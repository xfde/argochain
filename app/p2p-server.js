const WebSocket = require("ws");
const logger = require("../logger");
//declare the peer to peer server port
const P2P_PORT = process.env.P2P_PORT || 5001;

//list of address to connect to
const peers = process.env.PEERS ? process.env.PEERS.split(",") : [];
const MESSAGE_TYPE = {
  chain: "CHAIN",
  transaction: "TRANSACTION",
  block: "BLOCK",
  clear_transactions: "CLEAR_TRANSACTIONS",
};
class P2pserver {
  constructor(blockchain, transactionPool, wallet) {
    this.blockchain = blockchain;
    this.sockets = [];
    this.transactionPool = transactionPool;
    this.wallet = wallet;
  }

  // create a new p2p server and connections

  listen() {
    // create the p2p server with port as argument
    const server = new WebSocket.Server({ port: P2P_PORT });

    // register callback for new connections to this node
    // on any new connection the current instance will send the current chain
    // to the newly connected peer
    server.on("connection", (socket) => {
      // register the connected socket as active
      socket.isAlive = true;
      this.connectSocket(socket);
    });

    // to connect to the peers that we have specified
    this.connectToPeers();

    logger.debug(`Listening for peer to peer connection on port : ${P2P_PORT}`);
  }

  // after a socket connects to this node
  connectSocket(socket) {
    // push the socket to the socket array
    this.sockets.push(socket);
    // register a message event listener to the socket
    this.messageHandler(socket);
    this.closeConnectionHandler(socket);
    this.sendChain(socket);
  }
  /**
   *
   * @param {socket to be disconnected} socket
   */
  closeConnectionHandler(socket) {
    socket.on("close", () => (socket.isAlive = false));
  }

  connectToPeers() {
    peers.forEach((peer) => {
      const socket = new WebSocket(peer);
      // open event listner is emitted when a connection is established
      socket.on("open", () => this.connectSocket(socket));
    });
  }

  /**
   * Broadcast a new block on the network
   * @param {the newly created block to be broadcasted} block
   */
  broadcastBlock(block) {
    this.sockets.forEach((socket) => {
      this.sendBlock(socket, block);
    });
  }
  /**
   * Helper function for sending a block to a socket
   * @param {the socket to send the block} socket
   * @param {blok to be sent} block
   */
  sendBlock(socket, block) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.block,
        block: block,
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
  messageHandler(socket) {
    //on recieving a message execute a callback function
    socket.on("message", (message) => {
      const data = JSON.parse(message);
      logger.debug("Received from peers: ", data.type);
      switch (data.type) {
        case MESSAGE_TYPE.chain:
          this.blockchain.replaceChain(data.chain);
          break;
        case MESSAGE_TYPE.transaction:
          if (!this.transactionPool.transactionExists(data.transaction)) {
            this.transactionPool.addTransaction(data.transaction);
            this.broadcastTransaction(data.transaction);
          }
          if (this.transactionPool.thresholdReached()) {
            logger.debug(
              "Transaction Pool Filled. Selected Validator is: " +
                this.blockchain.getCurrentValidator() +
                " and my address is: " +
                this.wallet.getPublcKey()
            );
            if (
              this.blockchain.getCurrentValidator() == this.wallet.getPublcKey()
            ) {
              // this node should validate the transaction
              logger.debug("Creating block");
              let block = this.blockchain.addBlock(
                this.transactionPool.transactions,
                this.wallet
              );
              this.broadcastBlock(block);
            }
          }
          break;
        case MESSAGE_TYPE.block:
          if (this.blockchain.isValidBlock(data.blok)) {
            // First validate the block with te VRF the add the block
            // this.blockchain.addBlock(data.block);
            // this.blockchain.executeTransactions(data.block);
            this.broadcastBlock(data.block);
            this.transactionPool.clear();
          }
          break;
      }
    });
  }
}

module.exports = P2pserver;
