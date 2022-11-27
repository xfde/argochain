const { TRANSACTION_FEE } = require("../config");
const ChainUtil = require("../chain-util");
const logger = require("../logger");
/**
 * Each action in the blockchain is represented by a transaction between two wallets
 * NewTransaction (check for ammount) -> Generate Transaction (populate with data) -> Sign Transaction (hash sign)
 */
class Transaction {
  constructor() {
    this.id = ChainUtil.id();
    this.type = null;
    this.input = null;
    this.output = null;
  }

  /**
   * Verify fees and generate a new transaction
   * @param {The wallet hash of the sender} senderWallet
   * @param {The wallet hash of the receiver} to
   * @param {The value that is being sent} amount
   * @param {TRANSACTION normal transactions on the blockchain 'STAKE' - For staking coins 'VALIDATOR_FEE' - Fixed amount transaction for beocming a validator} type
   * @returns New transaction or null
   */
  static newTransaction(senderWallet, to, amount, type) {
    if (amount + TRANSACTION_FEE > senderWallet.balance) {
      logger.warn("Not enough balance for transaction");
      return null;
    }
    return Transaction.generateTransaction(senderWallet, to, amount, type);
  }
  /**
   * Creates the new transaction object
   * @param {The wallet hash of the sender} senderWallet
   * @param {The wallet hash of the receiver} to
   * @param {The value that is being sent} amount
   * @param {The type of transaction} type
   * @returns new Transaction
   */
  static generateTransaction(senderWallet, to, amount, type) {
    const transaction = new this();
    transaction.type = type;
    transaction.output = {
      to: to,
      amount: amount - TRANSACTION_FEE,
      fee: TRANSACTION_FEE,
    };
    Transaction.signTransaction(transaction, senderWallet);
    return transaction;
  }
  /**
   * Signs a transaction using the wallet of the sender
   * @param {Transaction object to sign} transaction
   * @param {Wallet hash of the sender to validate transaction} senderWallet
   */
  static signTransaction(transaction, senderWallet) {
    transaction.input = {
      timestamp: Date.now(),
      from: senderWallet.publicKey,
      signature: senderWallet.sign(ChainUtil.hash(transaction.output)),
    };
  }
  /**
   * Verify a transaction signiture if it is valid
   * @param {Transaction object that needs to be verified} transaction
   * @returns True if transaction is valid, False otherwise
   */
  static verifyTransaction(transaction) {
    return ChainUtil.verifySignature(
      transaction.input.from,
      transaction.input.signature,
      ChainUtil.hash(transaction.output)
    );
  }
}

module.exports = Transaction;
