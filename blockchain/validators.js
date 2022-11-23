const logger = require("../logger");

class Validators {
  constructor() {
    // list of addressed of nodes that have paid the validator fee
    // and are eligible to be elected
    this.list = [];
  }

  update(transaction) {
    if (transaction.amount == 30 && transaction.to == "0") {
      this.list.push(transaction.input.from);
      logger.info("New validator registered: " + transaction.input.from);
      return true;
    }
    return false;
  }
}

module.exports = Validators;
