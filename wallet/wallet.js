const ChainUtil = require("../chain-util");
const logger = require("../logger");
const Transaction = require("./transaction");
class Wallet {
  constructor(data, scope) {
    if (scope === "SIGN") {
      this.keyPair = ChainUtil.getKeyPairFromObject(data);
    } else {
      this.keyPair = ChainUtil.genKeyPair(data);
    }
    this.publicKey = this.keyPair.getPublic();
    this.balance;
  }
  /**
   * Sign using the wallets keyPair
   * @param blockHash hash of block to sign
   * @returns A HEX signature
   */
  sign(blockHash) {
    return this.keyPair.sign(blockHash);
  }
  /**
   * Initialise a transaction from the current wallet
   * @param {The wallet hash of the receiver} to
   * @param {The value that is being sent} amount
   * @param {The type of transaction} type
   * @param {Blockchain object reference} blockchain
   * @param {Transaction-pool object reference} transactionPool
   * @returns A new transaction
   */
  createTransaction(to, amount, type, blockchain, transactionPool) {
    this.balance = this.getBalance(blockchain);
    if (amount > this.balance) {
      logger.warn(
        `Amount: ${amount} exceeds the current balance: ${this.balance}`
      );
      return;
    }
    let transaction = Transaction.newTransaction(this, to, amount, type);
    if (transaction !== null) {
      transactionPool.addTransactionToPool(transaction);
    }
    return transaction;
  }
  /**
   * Use this function to save and serialise the key of the wallet
   * @returns The piblic key indeftifier for the EC instance
   */
  getEC() {
    let pubpoint = this.keyPair.getPublic();
    let pub = pubpoint.encode("hex");
    return pub;
  }
  /**
   *
   * @param {Blockchain instance} blockchain
   * @returns The balance of this wallet on the blockchain
   */
  getBalance(blockchain) {
    return blockchain.getBalance(this.getPublicKey("hex"));
  }
  getPublicBalance() {
    return this.balance;
  }
  /**
   * @returns The public key of this wallet
   */
  getPublicKey(arg) {
    return this.keyPair.getPublic(arg);
  }
  getPrivateKey() {
    return this.keyPair.getPrivate("hex");
  }
  /**
   *
   * @returns A string format of the wallet info
   */
  toString() {
    return `Wallet - 
          publicKey: ${this.publicKey.toString()}
          balance  : ${this.balance}`;
  }
}
module.exports = Wallet;
