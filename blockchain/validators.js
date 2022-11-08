class Validators {
    constructor() {
      // list of addressed of nodes that have paid the validator fee
      // and are eligible to be elected
      this.list = [];
    }
  
    update(transaction) {
      if (transaction.amount == 30 && transaction.to == "0") {
        this.list.push(transaction.from);
        return true;
      }
      return false;
    }
  }
  
  module.exports = Validators;