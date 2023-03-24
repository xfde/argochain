const express = require("express");
const logger = require("../logger");
const swaggerUi = require("swagger-ui-express");
const bodyParser = require("body-parser");
const Blockchain = require("../blockchain/blockchain.js");
const P2pServer = require("./p2p-server.js");
const Wallet = require("../wallet/wallet");
const TransactionPool = require("../wallet/transaction-pool");
const swaggerDocument = require("../swagger.json");
const fs = require("fs");
const cors = require("cors");
const HTTP_PORT = process.env.HTTP_PORT;
const devMode = process.env.NODE_ENV !== "production";
const base_path = "/api";
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions)); // Use this after the variable declaration
//GET PRE SAVED DATA
fs.readFile("blockchain.txt", "utf8", function (err, data) {
  let blockchain, wallet;
  try {
    data = JSON.parse(data);
    if (data.length < 20) {
      data = undefined;
    }
  } catch (e) {
    data = undefined;
  }
  blockchain = new Blockchain(data);
  wallet = new Wallet(data !== undefined ? data : Date.now().toString());
  const transactionPool = new TransactionPool();
  const p2pserver = new P2pServer(blockchain, transactionPool, wallet);

  p2pserver.listen(); // starts the p2pserver

  //api to get the blocks
  app.get(base_path + "/blocks", (req, res) => {
    logger.debug("Retriving the chain");
    res.json(blockchain.chain);
  });
  //api to get the blocks
  app.get(base_path + "/accounts", (req, res) => {
    logger.debug("Retriving accounts list");
    let acc = blockchain.getAccountsData();
    res.json(acc);
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
      "Received transaction: " +
        type +
        " for: " +
        amount +
        " to address: " +
        to.slice(0, 8)
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
  });

  //api to add a block
  app.post(base_path + "/dev/createBlock", (req, res) => {
    const block = blockchain.addBlock(req.body.data, wallet);
    logger.debug(`New block added: ${block.toString().slice(0, 8)}`);
    p2pserver.syncChain();
    res.redirect("/blocks");
  });
  // DEV API TO APPOINT VALIDATOR
  app.post(base_path + "/dev/appointValidator", (req, res) => {
    const pkey = wallet.getPublicKey("hex");
    blockchain.validators.appointValidator(pkey);
    p2pserver.broadcastValidator(pkey);
    logger.debug(`Wallet ` + pkey.slice(0, 8) + " added as validator");
    res.json({ response: "You enlisted as a validator successfully!" });
  });
  // DEV API TO CREDIT WALLET
  app.post(base_path + "/dev/addBalance", (req, res) => {
    const pkey = wallet.getPublicKey("hex");
    blockchain.accounts.transfer("0", pkey, req.body.amount);
    logger.debug(
      `Wallet ` + pkey.slice(0, 8) + " credited with balance " + req.body.amount
    );
    res.json({ response: "Balance added sucessfully on the blockchain!" });
  });

  // api to see the current wallet
  app.get(base_path + "/wallet", (req, res) => {
    const pkey = wallet.getPublicKey("hex");
    logger.debug("Get wallet details");
    res.json({
      localBalance: wallet.getPublicBalance(),
      blockchainBalance: blockchain.getBalance(pkey),
      publicKey: pkey,
    });
  });
  // app server configurations
  app.listen(HTTP_PORT, () => {
    logger.info(`App started on port: ${HTTP_PORT}`);
  });

  if (process.platform === "win32") {
    var rl = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.on("SIGINT", function () {
      p2pserver.saveBlockchain();
      process.emit("SIGINT");
    });
  }

  process.on("SIGINT", function () {
    //graceful shutdown
    p2pserver.saveBlockchain();
    process.exit();
  });
});
