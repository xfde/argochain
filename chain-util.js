const EDDSA = require("elliptic").eddsa;
const eddsa = new EDDSA("ed25519");
const { v4: uuidv4 } = require('uuid');

class ChainUtil {
    static genKeyPair(secret) {
      return eddsa.keyFromSecret(secret);
    }
    static id(){
        return uuidv4();
    }
    static hash(data){
        return SHA256(JSON.stringify(data)).toString();
    }
    static verifySignature(publicKey,signature,dataHash){
        return eddsa.keyFromPublic(publicKey).verify(dataHash,signature);
    }
}

module.exports = ChainUtil;