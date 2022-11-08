const WebSocket = require("ws");

//declare the peer to peer server port
const P2P_PORT = process.env.P2P_PORT || 5001;

//list of address to connect to
const peers = process.env.PEERS ? process.env.PEERS.split(",") : [];
const MESSAGE_TYPE = {
  chain: "CHAIN",
  transaction: "TRANSACTION",
  block: "BLOCK",
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

    // event listener and a callback function for any new connection
    // on any new connection the current instance will send the current chain
    // to the newly connected peer
    server.on("connection", (socket) => this.connectSocket(socket));

    // to connect to the peers that we have specified
    this.connectToPeers();

    console.log(`Listening for peer to peer connection on port : ${P2P_PORT}`);
  }

  // after making connection to a socket
  connectSocket(socket) {
    // push the socket to the socket array
    this.sockets.push(socket);
    console.log("Socket connected");

    // register a message event listener to the socket
    this.messageHandler(socket);
    this.sendChain(socket);
    // on new connection send the blockchain chain to the peer
    // TODO DON'T SEND THE ENTIRE BLOCKCHAIN
    socket.send(JSON.stringify(this.blockchain));
  }

  connectToPeers() {
    //connect to each peer
    peers.forEach((peer) => {
      // create a socket for each peer
      const socket = new WebSocket(peer);

      // open event listner is emitted when a connection is established
      // saving the    socket in the array
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
      console.log("Received from peers: ", data);
      switch (data.type) {
        case MESSAGE_TYPE.chain:
          this.blockchain.replaceChain(data.chain);
          break;
        case MESSAGE_TYPE.transaction:
          if (!this.transactionPool.transactionExists(data.transaction)) {
            // check if pool is filled
            let thresholdReached = this.transactionPool.addTransaction(
              data.transaction
            );
            // let oter nodes know about this transaction
            this.broadcastTransaction(data.transaction);
            if (thresholdReached) {
              if (
                this.blockchain.getCurrentValidator() ==
                this.wallet.getPublcKey()
              ) {
                // this node should validate the transaction
                console.log("Creating block");
                let block = this.blockchain.addBlock(
                  this.transactionPool.transactions,
                  this.wallet
                );
                this.broadcastBlock(block);
              }
            }
          }
          break;
        case MESSAGE_TYPE.block:
          if (this.blockchain.isValidBlock(data.blok)) {
            this.broadcastBlock(data.block);
          }
          break;
      }
    });
  }
}

module.exports = P2pserver;
