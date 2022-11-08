const Transaction = require("./transaction");
/**
 *  All unprocessed transactions in the network will go inside a transaction pool until resolved
 */
class TransactionPool {
  constructor() {
    this.transactions = [];
  }
  /**
   *
   * @param {Transaction object to be added to the waiting pool} transaction
   */
  addTransactionToPool(transaction) {
    this.transactions.push(transaction);
  }
  /**
   * Checks if a transaction is already in the transaction pool
   * @param {Transaction object to be checked against the exisitng pool} transaction 
   * @returns True if transaction is in the pool, False otherwise
   */
  transactionExists(transaction) {
    let exists = this.transactions.find(t => t.id === transaction.id);
    return exists;
    }
  /**
   * 
   * @returns A list of valid transactions in the pool
   */
  validTransactions() {
    return this.transactions.filter((transaction) => {
      if (!Transaction.verifyTransaction(transaction)) {
        console.log(`Invalid signature from ${transaction.data.from}`);
        return;
      }

      return transaction;
    });
  }
}

module.exports = TransactionPool;
