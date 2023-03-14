const logger = require("../logger");

class Validators {
  constructor(data) {
    // list of addressed of nodes that have paid the validator fee
    // and are eligible to be elected
    this.list = data != undefined ? data.validators : [];
  }
  // DEV PURPOSES
  appointValidator(wallet) {
    this.list.push(wallet);
  }
  update(transaction) {
    if (transaction.amount == 30 && transaction.to == "0") {
      this.list.push(transaction.input.from);
      logger.info("New validator registered: " + transaction.input.from);
      return true;
    }
    return false;
  }
  isValidator(address) {
    return this.list.includes(address);
  }
  getValidatorThreshold() {
    return 1 / this.list.length;
  }
}

module.exports = Validators;
