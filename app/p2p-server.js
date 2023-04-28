const WebSocket = require("ws");
const { Evaluate, ProofHoHash } = require("@idena/vrf-js");
const logger = require("../logger");
const ChainUtil = require("../chain-util");
const Transaction = require("../wallet/transaction");
const fs = require("fs");
//declare the peer to peer server port
const P2P_PORT = process.env.P2P_PORT;

const MESSAGE_TYPE = {
  chain: "CHAIN",
  transaction: "TRANSACTION",
  block: "BLOCK",
  clear_transactions: "CLEAR_TRANSACTIONS",
  validator: "ADD_VALIDATOR",
  sync: "SYNC",
};

class P2pserver {
  constructor(blockchain, transactionPool, wallet) {
    this.blockchain = blockchain;
    this.sockets = [];
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.epoch_count = 0;
  }

  listen() {
    // create the p2p server with port as argument'
    this.blockchain.epoch.updateCurrentTime().then(() => {
      const server = new WebSocket.Server({ port: P2P_PORT });
      this.blockchain.epoch._nextEpoch();
      // register callback for new connections to this node
      // on any new connection the current instance will send the current chain
      // to the newly connected peer
      server.on("connection", (socket) => {
        // register the connected socket as active
        socket.isAlive = true;
        this.connectSocket(socket);
      });
      this.epochHandler();
      this.registerWallet(this.wallet.getPublicKey("hex"));
      // to connect to the peers that we have specified
      this.connectToPeers();
      logger.debug(`Listening for peer to peer connection on port : ${P2P_PORT}`);
    }
    );
    // after a socket connects to this node
  }
  connectSocket(socket) {
    this.sockets.push(socket);
    this.messageHandler(socket);
    this.closeConnectionHandler(socket);
    this.sendChain(socket);
  }
  /**
   * @param {socket to be disconnected} socket
   */
  closeConnectionHandler(socket) {
    socket.on("close", () => (socket.isAlive = false));
  }
  /**
   * Serialise the current state of the blockchain and write it to a local file.
   * Used when the program is killed/exited
   */
  saveBlockchain() {
    let jsonData = {
      chain: this.blockchain.chain,
      epoch: this.blockchain.epoch.epoch,
      stakeAddresses: this.blockchain.stakes.addresses,
      stakeBalance: this.blockchain.stakes.balance,
      addresses: this.blockchain.accounts.addresses,
      balance: this.blockchain.accounts.balance,
      validators: this.blockchain.validators.list,
      wallet: this.wallet.getEC(),
    };
    jsonData = JSON.stringify(jsonData);
    fs.writeFileSync("blockchain.txt", jsonData, "utf8");
  }
  connectToPeers() {
    //list of address to connect to
    const peers = this.getInitialPeers();
    peers.forEach((peer) => {
      const socket = new WebSocket(peer);
      // open event listner is emitted when a connection is established
      socket.on("open", () => {    this.sockets.push(socket);
        this.messageHandler(socket);
        this.closeConnectionHandler(socket);});
    });
  }

  getInitialPeers() {
    return process.env.PEERS ? process.env.PEERS.split(",") : [];
  }
  /**
   * Broadcast a new block on the network
   * @param {the newly created block to be broadcasted} block
   */
  broadcastBlock(block, proof) {
    this.sockets.forEach((socket) => {
      this.sendBlock(socket, block, proof);
    });
  }
  /**
   * Helper function for sending a block to a socket
   * @param {the socket to send the block} socket
   * @param {blok to be sent} block
   */
  sendBlock(socket, block, proof) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.block,
        block: block,
        proof: proof,
      })
    );
  }
  /**
   * helper function to send the chain instance
   */
  sendChain(socket) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.chain,
        chain: this.blockchain.chain,
        epoch: this.blockchain.getCurrentEpoch()+1,
        lastEpochTime: this.blockchain.epoch.lastEpochTime,
        time: this.blockchain.epoch.time,
        wallet: this.wallet.getPublicKey("hex"),
      })
    );
  }
  /**
   * utility function to sync the chain
   * whenever a new block is added to
   * the blockchain
   */
  syncChain() {
    this.sockets.forEach((socket) => {
      this.sendChain(socket);
    });
  }

  broadcastTransaction(transaction) {
    this.sockets.forEach((socket) => {
      this.sendTransaction(socket, transaction);
    });
  }

  sendTransaction(socket, transaction) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.transaction,
        transaction: transaction,
      })
    );
  }
  broadcastValidator(key) {
    this.sockets.forEach((socket) => {
      socket.send(
        JSON.stringify({
          type: MESSAGE_TYPE.validator,
          validator: key,
        })
      );
    });
  }
  registerWallet(wallet) {
    this.blockchain.accounts.initialize(wallet);
  }
  broadcastSync(){
    this.sockets.forEach((socket) => {
      socket.send(
        JSON.stringify({
          type: MESSAGE_TYPE.sync,
          chain: this.blockchain.chain,
          epoch: this.blockchain.getCurrentEpoch(),
          lastEpochTime: this.blockchain.epoch.lastEpochTime,
          time: this.blockchain.epoch.time,
        })
      );
    });
  }
  epochHandler() {
    this.blockchain.epoch.on("newEpoch", (epoch) => {
      logger.info(
        "Epoch " +
          epoch +
          " ended, transactions in pool: " +
          this.transactionPool.transactions.length
      );
      this.epoch_count +=1;
      if(this.epoch_count === 10){
        this.broadcastSync();
        this.epoch_count = 0;
      }
      // compute vrf proof
      if (
        !this.blockchain.validators.isValidator(this.wallet.getPublicKey("hex"))
      ) {
        return;
      }
      let data = ChainUtil.hash(
        `${this.blockchain.getHashOfLastBlock()}${epoch}`
      );
      const [hash, proof] = Evaluate(this.wallet.getPrivateKey(), data);
      let hex = Buffer.from(hash).toString("hex");
      let curr_raffle = parseInt(hex, 16) / Math.pow(2, 256);
      // if (curr_raffle < this.blockchain.validators.getValidatorThreshold()) {
        // WINNER WINNER CHICKEN DINNER
        let end = this.transactionPool.transactions.length;
        if (!this.transactionPool.isEmpty()) {
          //TODO: verify transactions before adding them to block
          let validTransactions = [];
          this.transactionPool.transactions.forEach((t) => {
            if (Transaction.verifyTransaction(t)) {
              validTransactions.push(t);
            }
          });
          let newBlock = this.blockchain.addBlock(
            validTransactions,
            this.wallet
          );
          this.broadcastBlock(newBlock, proof);
          this.transactionPool.clear();
        }
        logger.info(
          "Epoch " +
            epoch +
            " ended with " +
            end +
            " transactions added by this wallet"
        );
      // }
    });
  }
  messageHandler(socket) {
    //on recieving a message execute a callback function
    socket.on("message", (message) => {
      const data = JSON.parse(message);
      logger.debug("Received from peers the message: " + data.type);
      switch (data.type) {
        case MESSAGE_TYPE.chain:
          this.blockchain.replaceChain(data.chain);
          this.registerWallet(data.wallet);
          this.blockchain.epoch.syncEpoch(data);
          break;
        case MESSAGE_TYPE.sync:
          // this.blockchain.replaceChain(data.chain);
          this.blockchain.epoch.syncEpoch(data);
          break;
        case MESSAGE_TYPE.transaction:
          if (!this.transactionPool.transactionExists(data.transaction)) {
            this.transactionPool.addTransactionToPool(data.transaction);
            this.broadcastTransaction(data.transaction);
          }
          break;
        case MESSAGE_TYPE.validator:
          if (!this.blockchain.validators.isValidator(data.validator)) {
            this.broadcastValidator(data.validator);
            this.blockchain.validators.appointValidator(data.validator);
          }
          break;
        case MESSAGE_TYPE.block:
          // validation code NEEDS MOVING
          try {
            let blockMetaData = ChainUtil.hash(
              `${this.blockchain.getHashOfLastBlock()}${this.blockchain.getCurrentEpoch()+1}`
            );
            logger.debug(this.blockchain.getCurrentEpoch());
            let publicKey = ChainUtil.getKeyPairFromObject(
              data.block.validator
            );
            const h = ProofHoHash(
              publicKey.getPublic("array"),
              blockMetaData,
              data.proof
            );
          } catch (err) {
            logger.debug("Invalid proof, rejecting block");
            break;
          }
          if (this.blockchain.isValidBlock(data.block)) {
            // First validate the block with the VRF the add the block
            this.broadcastBlock(data.block);
            this.transactionPool.clear();
            logger.debug("Verification complete, block accepted");
          }
          break;
      }
    });
  }
}

module.exports = P2pserver;
