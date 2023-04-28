const Block = require("./block");
const Account = require("./account");
const logger = require("../logger");
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
  /**
   *
   * @returns Current Epoch
   */
  getCurrentEpoch() {
    return this.epoch.getEpoch();
  }
  /**
   *
   * @returns Returns all acounts public keys and their associated balances on the blockchain
   */
  getAccountsData() {
    let obj = [];
    this.accounts.addresses.forEach((address, idx) => {
      obj.push({
        address: address,
        balance: this.accounts.balance[address],
        validator: this.validators.isValidator(address),
        stake: this.stakes.getStake(address),
      });
    });

    return obj;
  }
  /**
   *
   * @returns The hash of the last block in the chain
   */
  getHashOfLastBlock() {
    return this.chain[this.chain.length - 1].lastHash;
  }
  /**
   * Adds a new block to the chian
   * @param data data to be written in the new block
   * @returns the newly created block
   */
  addBlock(data, wallet) {
    const block = Block.createBlock(
      this.chain[this.chain.length - 1],
      data,
      wallet
    );
    this.executeTransactions(block);
    this.chain.push(block);
    logger.info("New block " + block.hash.slice(0, 8) + " created");
    return block;
  }
  /**
   * Checks a block for being valid. Reasons for block to be invalid: hash, lastHash, validator, signature
   * @param block the block to be verifed
   * @returns True if valid, False otherwise
   */
  isValidBlock(block) {
    const lastBlock = this.chain[this.chain.length - 1];
    if (block.lastHash === lastBlock.hash) {
      if (block.hash === Block.blockHash(block)) {
        if (Block.verifyBlock(block)) {
          if (this.validators.isValidator(block.validator)) {
            logger.debug("Block: " + block.hash.slice(0, 8) + " is valid");
            this.chain.push(block);
            this.executeTransactions(block);
            return true;
          } else {
            logger.debug("Block validator is invalid");
            return false;
          }
        } else {
          logger.debug("Block signature is invalid");
          return false;
        }
      } else {
        logger.debug("Block hash is invalid");
        return false;
      }
    } else {
      logger.debug("Block lastHash is invalid");
      return false;
    }
  }
  /**
   * Validate given chain
   * @param chain object
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
   * @param publicKey Public key of the wallet to retrieve the balance for
   * @returns the balance of the account that has the provided public key
   */
  getBalance(publicKey) {
    return this.accounts.getBalance(publicKey);
  }
  /**
   * Checks the validity of the received chain and replaces the existing chain with the new one if valid
   * @param newChain Array containing the blocks
   * @returns True if chain was replace, Flase if chian was not replaced due to invalid issue
   */
  replaceChain(newChain) {
    if (newChain.length == this.chain.length) {
      logger.warn(
        "Received chain " +
          newChain[newChain.length - 1].hash.slice(0, 8) +
          " is not longer than the current chain " +
          this.chain[this.chain.length - 1].hash.slice(0, 8)
      );
      return false;
    } else if (!this.isValidChain(newChain)) {
      logger.warn(
        "Received chain " +
          newChain[newChain.length - 1].hash.slice(0, 8) +
          " is invalid"
      );
      return false;
    }
    logger.debug(
      "Replacing the current chain " +
        this.chain[this.chain.length - 1].hash.slice(0, 8) +
        " with new chain " +
        newChain[newChain.length - 1].hash.slice(0, 8)
    );
    this.resetState();
    this.executeChain(newChain);
    this.chain = newChain;
    return true;
  }
  /**
   * Handler for adding new blocks or rebuild the blockchain locally
   * @param block block to be executed
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
  /**
   * Auxiliary function to execute a cain of transactions
   * @param chain to be excuted block by block
   */
  executeChain(chain) {
    chain.forEach((block) => {
      this.executeTransactions(block);
    });
  }
  /**
   * Auxiliary function to reset the state of the blockchain
   */
  resetState() {
    this.chain = [Block.genesis()];
    this.stakes = new Stake();
    this.accounts = new Account();
    this.validators = new Validators();
  }
}

module.exports = Blockchain;
