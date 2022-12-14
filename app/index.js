const express = require("express");
const logger = require("../logger");
const swaggerUi = require("swagger-ui-express");
const bodyParser = require("body-parser");
const Blockchain = require("../blockchain/blockchain.js");
const P2pServer = require("./p2p-server.js");
const Wallet = require("../wallet/wallet");
const TransactionPool = require("../wallet/transaction-pool");

const swaggerDocument = require("../swagger.json");

const HTTP_PORT = process.env.HTTP_PORT;
const devMode = process.env.NODE_ENV !== "production";
const base_path = "/api";
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const blockchain = new Blockchain();
//TODO change it to a mnemonic
const wallet = new Wallet(Date.now().toString());
const transactionPool = new TransactionPool();
const p2pserver = new P2pServer(blockchain, transactionPool, wallet);

p2pserver.listen(); // starts the p2pserver

//api to get the blocks
app.get(base_path + "/blocks", (req, res) => {
  logger.debug("Retriving the chain");
  res.json(blockchain.chain);
});

// api to view transaction in the transaction pool
app.get(base_path + "/transactions", (req, res) => {
  logger.debug("Get the transactions in the pool");
  res.json(transactionPool.transactions);
});

//api to create a transaction
app.post(base_path + "/transactions", (req, res) => {
  const { to, amount, type } = req.body;
  logger.debug(
    "Received transaction: " + type + " for: " + amount + " to address: " + to
  );
  const transaction = wallet.createTransaction(
    to,
    amount,
    type,
    blockchain,
    transactionPool
  );
  if (transaction !== null) {
    p2pserver.broadcastTransaction(transaction);
  }
  res.redirect(base_path + "/transactions");
  logger.debug("Transaction pool: " + transactionPool.toString());
});

//api to add a block
app.post(base_path + "/dev/createBlock", (req, res) => {
  const block = blockchain.addBlock(req.body.data);
  logger.debug(`New block added: ${block.toString()}`);
  p2pserver.syncChain();
  res.redirect("/blocks");
});

app.post(base_path + "/dev/appointValidator", (req, res) => {
  blockchain.validators.appointValidator(wallet.getPublicKey("hex"));
  logger.debug(`Wallet ` + wallet.getPublicKey("hex") + " added as validator");
  res.json({ response: "You enlisted as a validator successfully!" });
});

app.post(base_path + "/dev/addBalance", (req, res) => {
  blockchain.accounts.transfer(
    "0",
    wallet.getPublicKey("hex"),
    req.body.amount
  );
  logger.debug(
    `Wallet ` +
      wallet.getPublicKey("hex") +
      " credited with balance " +
      req.body.amount
  );
  res.json({ response: "Balance added sucessfully on the blockchain!" });
});
// api to see the current wallet
app.get(base_path + "/wallet", (req, res) => {
  logger.debug("Get wallet details");
  res.json({
    localBalance: wallet.getPublicBalance(),
    blockchainBalance: blockchain.getBalance(wallet.getPublicKey("hex")),
    publicKey: wallet.getPublicKey("hex"),
    privateKey: wallet.getPrivateKey(),
  });
});
// app server configurations
app.listen(HTTP_PORT, () => {
  logger.info(`App started on port: ${HTTP_PORT}`);
});
