const logger = require("../logger");

class Account {
  constructor(data) {
    if (data) {
      this.addresses = data.addresses;
      this.balance = data.balance;
    } else {
      this.addresses = [];
      this.balance = {};
    }
  }
  /**
   * Initises an adress
   * @param address Address to be initilaised in the chain
   */
  initialize(address) {
    if (this.balance[address] == undefined) {
      this.balance[address] = 0;
      this.addresses.push(address);
    }
  }
  /**
   * Intialises the wallets and trasfers the amount
   * @param from Sender Wallet
   * @param to Receiver Wallet
   * @param amount Amount to be transfered
   */
  transfer(from, to, amount) {
    this.initialize(from);
    this.initialize(to);
    this.increment(to, amount);
    this.decrement(from, amount);
  }
  /**
   *
   * @param to Target wallet
   * @param amount Ammount to be incremented
   */
  increment(to, amount) {
    this.balance[to] += amount;
  }
  /**
   *
   * @param from Target wallet
   * @param amount Ammount to be decremented
   */
  decrement(from, amount) {
    this.balance[from] -= amount;
  }
  /**
   *
   * @param address Target wallet
   * @returns The balance of the given wallet
   */
  getBalance(address) {
    this.initialize(address);
    return this.balance[address];
  }
  /**
   * Creates a transfer from the given transaction
   * @param transaction Transaction object
   */
  update(transaction) {
    let amount = transaction.output.amount;
    let from = transaction.input.from;
    let to = transaction.output.to;
    this.transfer(from, to, amount);
  }
  /**
   * Trasnfers the fee on the block to the validator
   * @param block block to written
   * @param transaction Transaction object
   */
  transferFee(block, transaction) {
    let amount = transaction.output.fee;
    let from = transaction.input.from;
    let to = block.validator;
    this.transfer(from, to, amount);
  }
}

module.exports = Account;
