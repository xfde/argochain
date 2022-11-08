const ChainUtil = require('../chain-util');
class Block {
    constructor(timestamp, lastHash, hash, data, validator, signature) {
      this.timestamp = timestamp;
      this.lastHash = lastHash;
      this.hash = hash;
      this.data = data;
      this.validator = validator;
      this.signature = signature;
    }
    
    static genesis() {
        return new this(Date.now(), "---", "genesis-hash", []);
    }
    
    static blockHash(block){
        //destructuring
        const { timestamp, lastHash, data } = block;
        return Block.hash(timestamp,lastHash,data);
    }

    static createBlock(lastBlock, data) {
        let hash;
        let timestamp = Date.now();
        const lastHash = lastBlock.hash;
        hash = Block.hash(timestamp, lastHash, data);
    
        return new this(timestamp, lastHash, hash, data);
    }

    static hash(timestamp,lastHash,data){
        return ChainUtil.hash(`${timestamp}${lastHash}${data}`);
    }

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