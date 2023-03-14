const EC = require("elliptic");
const ec = new EC.ec("secp256k1");
const { v4: uuidv4 } = require("uuid");
const SHA256 = require("crypto-js/sha256");
class ChainUtil {
  static genKeyPair(secret) {
    return ec.genKeyPair();
  }
  static id() {
    return uuidv4();
  }
  static hash(data) {
    return SHA256(JSON.stringify(data)).toString();
  }
  static verifySignature(publicKey, signature, dataHash) {
    return ec.keyFromPublic(publicKey).verify(dataHash, signature);
  }
  static getKeyPairFromObject(publicKey) {
    let key = ec.keyFromPublic(publicKey, "hex");
    return key;
  }
}

module.exports = ChainUtil;
