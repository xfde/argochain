const express = require("express");
const Blockchain = require("../blockchain/blockchain.js");
const bodyParser = require("body-parser");
const P2pServer = require("./p2p-server.js");
const Wallet = require("../wallet/wallet");
const TransactionPool = require("../wallet/transaction-pool");
//get the port from the user or set the default port
const HTTP_PORT = process.env.HTTP_PORT || 3001;

//create a new app
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// create a new blockchain instance
const blockchain = new Blockchain();
// Create a new wallet and pass the current date as a secrete *IND
const wallet = new Wallet(Date.now().toString());
const transactionPool = new TransactionPool();
const p2pserver = new P2pServer(blockchain, transactionPool,wallet);
p2pserver.listen(); // starts the p2pserver
//EXPOSED APIs

//api to get the blocks
app.get("/blocks", (req, res) => {
  console.log("Retrieving blocks");
  res.json(blockchain.chain);
});

// api to view transaction in the transaction pool
app.get("/transactions", (req, res) => {
  res.json(transactionPool.transactions);
});

// create transactions
app.post("/transact", (req, res) => {
  const { to, amount, type } = req.body;
  const transaction = wallet.createTransaction(
    to,
    amount,
    type,
    blockchain,
    transactionPool
  );
  p2pserver.broadcastTransaction(transaction);
  res.redirect("/transactions");
});

//api to add blocks
app.post("/mine", (req, res) => {
  const block = blockchain.addBlock(req.body.data);
  console.log(`New block added: ${block.toString()}`);
  p2pserver.syncChain();
  res.redirect("/blocks");
});

// app server configurations
app.listen(HTTP_PORT, () => {
  console.log(`listening on port ${HTTP_PORT}`);
});
