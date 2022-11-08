class Stake {
    constructor() {
      this.addresses = [];
      this.balance = {};
    }
    /**
     * Add the address in the list and initilise its balance with 0
     * @param {Wallet address to be initialised in the records} address 
     */
    initialize(address) {
      if (this.balance[address] == undefined) {
        this.balance[address] = 0;
        this.addresses.push(address);
      }
    }
    /**
     * Utility function to add stake
     * @param {address to add the stake} from 
     * @param {ammount to be transfered} amount 
     */
    addStake(from, amount) {
      this.initialize(from);
      this.balance[from] += amount;
    }
    /**
     * Getter for staked balance
     * @param {account address of the balance holder} address 
     * @returns The balance of the given address
     */
    getStake(address) {
      this.initialize(address);
      return this.balance[address];
    }
    /**
     * TEMP FUNCTION TO GET THE TOP VALIDATOR BASED ON MAX STAKE
     * @param {registered adreessed to chose from} addresses 
     * @returns the address of the account with highest stake
     */
    getMax(addresses) {
      let balance = -1;
      let leader = undefined;
      addresses.forEach(address => {
        if (this.getBalance(address) > balance) {
          leader = address;
        }
      });
      return leader;
    }
    /**
     * Records a stake transaction from an adress
     * @param {Stake transaction} transaction 
     */
    update(transaction) {
      let amount = transaction.output.amount;
      let from = transaction.input.from;
      this.addStake(from, amount);
    }
  }
  
  module.exports = Stake;