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
   * @param {Address to be initilaised in the chain} address
   */
  initialize(address) {
    if (this.balance[address] == undefined) {
      this.balance[address] = 0;
      this.addresses.push(address);
    }
  }
  /**
   * Intialises the wallets and trasfers the amount
   * @param {Sender Wallet} from
   * @param {Receiver Wallet} to
   * @param {Amount to be transfered} amount
   */
  transfer(from, to, amount) {
    this.initialize(from);
    this.initialize(to);
    this.increment(to, amount);
    this.decrement(from, amount);
  }
  /**
   *
   * @param {Target wallet} to
   * @param {Ammount to be incremented} amount
   */
  increment(to, amount) {
    this.balance[to] += amount;
  }
  /**
   *
   * @param {Target wallet} from
   * @param {Ammount to be decremented} amount
   */
  decrement(from, amount) {
    this.balance[from] -= amount;
  }
  /**
   *
   * @param {Target wallet} address
   * @returns The balance of the given wallet
   */
  getBalance(address) {
    this.initialize(address);
    return this.balance[address];
  }
  /**
   * Creates a transfer from the given transaction
   * @param {Transaction object} transaction
   */
  update(transaction) {
    let amount = transaction.output.amount;
    let from = transaction.input.from;
    let to = transaction.output.to;
    this.transfer(from, to, amount);
  }
  /**
   * Trasnfers the fee on the block to the validator
   * @param {block to written} block
   * @param {} transaction
   */
  transferFee(block, transaction) {
    let amount = transaction.output.fee;
    let from = transaction.input.from;
    let to = block.validator;
    this.transfer(from, to, amount);
  }
}

module.exports = Account;
