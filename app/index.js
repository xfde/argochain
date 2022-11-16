const express = require("express");
const logger = require("../logger");
const Blockchain = require("../blockchain/blockchain.js");
const bodyParser = require("body-parser");
const P2pServer = require("./p2p-server.js");
const Wallet = require("../wallet/wallet");
const TransactionPool = require("../wallet/transaction-pool");

//get the port from the user or set the default port
const HTTP_PORT = process.env.HTTP_PORT || 3001;
const devMode = (process.env.NODE_ENV !== "production");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// create a new blockchain instance
const blockchain = new Blockchain();
//TODO change it to a mnemonic
const wallet = new Wallet(Date.now().toString());
const transactionPool = new TransactionPool();
const p2pserver = new P2pServer(blockchain, transactionPool, wallet);
p2pserver.listen(); // starts the p2pserver

// APIS

//api to get the blocks
app.get("/blocks", (req, res) => {
  logger.debug("Get the chain");
  res.json(blockchain.chain);
});

// api to view transaction in the transaction pool
app.get("/transactions", (req, res) => {
  logger.debug("Get the transactions in the pool");
  res.json(transactionPool.transactions);
});

//api to create a transaction
app.post("/transact", (req, res) => {
  const { to, amount, type } = req.body;
  logger.debug(
    "Received transaction " + type + " for " + amount + " to address: " + to
  );
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

//api to add a block
app.post("/mine", (req, res) => {
  const block = blockchain.addBlock(req.body.data);
  logger.debug(`New block added: ${block.toString()}`);
  p2pserver.syncChain();
  res.redirect("/blocks");
});

// app server configurations
app.listen(HTTP_PORT, () => {
  logger.info(`App started on port ${HTTP_PORT}`);
});
