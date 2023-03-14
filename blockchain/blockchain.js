const Block = require("./block");
const Account = require("./account");
const logger = require("../logger");
const Wallet = require("../wallet/wallet");
const Stake = require("./stake");
const Validators = require("./validators");
const Epoch = require("./epoch");

const TRANSACTION_TYPE = {
  transaction: "TRANSACTION",
  stake: "STAKE",
  validator_fee: "VALIDATOR_FEE",
};

class Blockchain {
  constructor(data) {
    this.chain = data !== undefined ? data.chain : [Block.genesis()];
    this.stakes = new Stake(data);
    this.accounts = new Account(data);
    this.validators = new Validators(data);
    this.epoch = new Epoch(data);
  }
  getCurrentEpoch() {
    return this.epoch.getEpoch();
  }
  getHashOfLastBlock() {
    return this.chain[this.chain.length - 1].lastHash;
  }
  /**
   * Adds a new block to the chian
   * @param {data to be written in the new block} data
   * @returns the newly created block
   */
  addBlock(data) {
    const block = Block.createBlock(
      this.chain[this.chain.length - 1],
      data,
      new Wallet(process.env.SECRET)
    );
    this.chain.push(block);
    logger.info("New block " + block.hash + " created");
    return block;
  }
  /**
   * Creates a new block on the chain (from transactions)
   * @param {transaction} transactions
   * @param {validator} wallet
   * @returns
   */
  createBlock(transactions, wallet) {
    const block = Block.createBlock(
      this.chain[this.chain.length - 1],
      transactions,
      wallet
    );
    logger.info(
      "New block " + block.hash + " created by " + wallet.getPublicKey("hex")
    );
    return block;
  }
  /**
   * Checks a block for being valid. Reasons for block to be invalid:
   * invalid hash
   * invalid lastHash
   * invalid validator
   * invalid signature
   * @param {block to be checked} block
   * @returns True if valid, False otherwise
   */
  isValidBlock(block) {
    const lastBlock = this.chain[this.chain.length - 1];
    if (
      block.lastHash === lastBlock.hash &&
      block.hash === Block.blockHash(block) &&
      Block.verifyBlock(block) &&
      Block.verifyValidator(block, this.getValidator())
    ) {
      logger.debug("Block" + block.hash.slice(-4) + " is valid");
      this.addBlock(block);
      this.executeTransactions(block);
      return true;
    } else {
      return false;
    }
  }
  /**
   * Validate given chain
   * @param {chian object} chain
   * @returns Flase if any of the nodes hashes are invalid (including genesis), True otherwise
   */
  isValidChain(chain) {
    // Check genesis block
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
      return false;
    // Check all the other nodes in the chain
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const lastBlock = chain[i - 1];
      if (
        block.lastHash !== lastBlock.hash ||
        block.hash !== Block.blockHash(block)
      )
        return false;
    }

    return true;
  }
  /**
   * Get the balance of the account
   * @param {Public key of the wallet to retrieve the balance for} publicKey
   * @returns the balance of the account that has the provided public key
   */
  getBalance(publicKey) {
    return this.accounts.getBalance(publicKey);
  }
  /**
   * Checks the validity of the received chain and replaces the existing chain with the new one if valid
   * @param {Array containing the blocks} newChain
   * @returns True if chain was replace, Flase if chian was not replaced due to invalid issue
   */
  replaceChain(newChain) {
    if (newChain.length <= this.chain.length) {
      logger.warn(
        "Received chain " +
          newChain[newChain.length - 1].hash.slice(-5) +
          " is not longer than the current chain " +
          this.chain[this.chain.length - 1].hash.slice(-5)
      );
      return false;
    } else if (!this.isValidChain(newChain)) {
      logger.warn(
        "Received chain " +
          newChain[newChain.length - 1].hash.slice(-5) +
          " is invalid"
      );
      return false;
    }
    logger.debug(
      "Replacing the current chain " +
        this.chain[this.chain.length - 1].hash.slice(-5) +
        " with new chain " +
        newChain[newChain.length - 1].hash.slice(-5)
    );
    this.resetState();
    this.executeChain(newChain);
    this.chain = newChain;
    return true;
  }
  /**
   * Handler for adding new blocks or rebuild the blockchain locally
   * @param {block to be executed} block
   */
  executeTransactions(block) {
    block.data.forEach((transaction) => {
      switch (transaction.type) {
        case TRANSACTION_TYPE.transaction:
          this.accounts.update(transaction);
          this.accounts.transferFee(block, transaction);
          break;
        case TRANSACTION_TYPE.stake:
          this.stakes.update(transaction);
          this.accounts.decrement(
            transaction.input.from,
            transaction.output.amount
          );
          this.accounts.transferFee(block, transaction);

          break;
        case TRANSACTION_TYPE.validator_fee:
          logger.info("VALIDATOR_FEE received from: " + transaction.input.from);
          if (this.validators.update(transaction)) {
            this.accounts.decrement(
              transaction.input.from,
              transaction.output.amount
            );
            this.accounts.transferFee(block, transaction);
          }
          break;
      }
    });
  }

  executeChain(chain) {
    chain.forEach((block) => {
      this.executeTransactions(block);
    });
  }

  resetState() {
    this.chain = [Block.genesis()];
    this.stakes = new Stake();
    this.accounts = new Account();
    this.validators = new Validators();
  }
}

module.exports = Blockchain;
