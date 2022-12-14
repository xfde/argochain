const ChainUtil = require("../chain-util");
class Block {
  constructor(timestamp, lastHash, hash, data, validator, signature) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.validator = validator;
    this.signature = signature;
  }
  /**
   * Static initialisation of the gensis block
   * @returns A new genesis block
   */
  static genesis() {
    return new this(Date.now(), "---", "genesis-hash", []);
  }
  /**
   * Creates the block hash with the data recevied
   * @param {block object sotring the data} block
   * @returns the hash of the block
   */
  static blockHash(block) {
    //destructuring
    const { timestamp, lastHash, data } = block;
    return Block.hash(timestamp, lastHash, data);
  }
  /**
   * Cratates a new block using the last hash and new data
   * @param {last valid block in the chain} lastBlock
   * @param {The information to be written in the new block} data
   * @param {The wallet of the signer} wallet
   * @returns A newly created block based on last hash
   */
  static createBlock(lastBlock, _data, wallet) {
    let hash;
    let timestamp = Date.now();
    const lastHash = lastBlock.hash;
    // make data array so you can store more info in a block
    hash = Block.hash(timestamp, lastHash, _data);

    let validator = wallet.getPublicKey();

    //Sign the block
    let signature = Block.signBlockHash(hash, wallet);
    return new this(timestamp, lastHash, hash, _data, validator, signature);
  }
  /**
   *
   * @param {hash of the block} hash
   * @param {wallet to sign the block} wallet
   * @returns
   */
  static signBlockHash(hash, wallet) {
    return wallet.sign(hash);
  }
  /**
   * Utility function for hashing
   * @param {*} timestamp
   * @param {*} lastHash
   * @param {*} data
   * @returns
   */
  static hash(timestamp, lastHash, data) {
    return ChainUtil.hash(`${timestamp}${lastHash}${data}`);
  }
  /**
   * Verfies the signature of a block
   * @param {Block object} block
   * @returns
   */
  static verifyBlock(block) {
    return ChainUtil.verifySignature(
      block.validator,
      block.signature,
      Block.hash(block.timestamp, block.lastHash, block.data)
    );
  }
  /**
   * Verify the validator of a block
   * @param {block object} block
   * @param {Validator} validator
   * @returns true if block validator is the same as the given validator, false otherwise
   */
  static verifyValidator(block, validator) {
    return block.validator == validator ? true : false;
  }
  /**
   * Utility function for displaying the blocks information
   * @returns A string containing the block information
   */
  toString() {
    return `Block - 
          Timestamp : ${this.timestamp}
          Last Hash : ${this.lastHash}
          Hash      : ${this.hash}
          Data      : ${this.data}
          Validator : ${this.validator}
          Signature : ${this.signature}`;
  }
}

module.exports = Block;
