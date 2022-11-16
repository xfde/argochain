const Block = require("./block");
const Account = require("./account");
const logger = require("../logger");

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
    this.accounts = new Account();
  }
  /**
   * Adds a new block to the chian
   * @param {data to be written in the new block} data
   * @returns the newly created block
   */
  addBlock(data, wallet) {
    const block = Block.createBlock(
      this.chain[this.chain.length - 1],
      data,
      wallet
    );
    this.chain.push(block);

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
      logger.debug("block valid");
      //this.addBlock(block, wallet);
      //BROKEN
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
   * @param {Public key of the wallet to retrieve the balance} publicKey
   * @returns the balance of the account that has the provided public key
   */
  getBalance(publicKey) {
    return this.accounts.getBalance(publicKey);
  }
  /**
   * Checks the validity of the received chain and replaces the existing chain with the new one if valid
   * @param {The new chain object} newChain
   * @returns True if chain was replace, Flase if chian was not replaced due to invalid issue
   */
  replaceChain(newChain) {
    if (newChain.length <= this.chain.length) {
      logger.warn("Recieved chain is not longer than the current chain");
      return false;
    } else if (!this.isValidChain(newChain)) {
      logger.warn("Recieved chain is invalid");
      return false;
    }

    logger.debug("Replacing the current chain with new chain");
    this.chain = newChain;
    return true;
  }
}

module.exports = Blockchain;
