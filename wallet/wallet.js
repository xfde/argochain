const ChainUtil = require("../chain-util");
const logger = require("../logger");
const Transaction = require("./transaction");
class Wallet {
  constructor(secret) {
    this.balance = 0;
    this.keyPair = ChainUtil.genKeyPair(secret);
    this.publicKey = this.keyPair.getPublic("hex");
  }
  /**
   * Sign using the wallets keyPair
   * @param {} dataHash
   * @returns A HEX signature
   */
  sign(dataHash) {
    return this.keyPair.sign(dataHash).toHex();
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
   *
   * @param {Blockchain instance} blockchain
   * @returns The balance of this wallet on the blockchain
   */
  getBalance(blockchain) {
    return blockchain.getBalance(this.publicKey);
  }
  /**
   * @returns The public key of this wallet
   */
  getPublicKey() {
    return this.publicKey;
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
