'use string'

const hkdf = require('futoin-hkdf')

class OscoreSecurityContext{
    
    constructor( 
        masterSecret, 
        senderID,
        receiverID,
        salt, 
        idContext = nil,
        aeadAlg = 'AES-CCM-16-64-128',
        hkdfAlg = 'HKDF SHA-256',
    ){
        this.masterSecret = masterSecret
        this.senderID = senderID
        this.receiverID = receiverID
        this.salt = salt
        this.idContext = idContext
        this.aeadAlg = aeadAlg
        this.hkdfAlg = hkdfAlg

        commonIV = deriveCommonIV() //used to generate the AEAD nonce, same length as AEAD alg nonce
    }

    deriveCommonIV() {
        
    }

    deriveSenderKey() {
        this.senderKey = 'nanana'
    }

    deriveReceiverKey() {
        this.receiverKey = 'batman'
    }

    /*
    * @param ikm - Master Secret
    * @param length - required output length in bytes (16 for keys, 13 for commonIV)
    * @param info - optional parameters
    * @param info.salt - Master Salt
    * @param info.info - serialized CBOR array consisting of:
    * @param info.info.id - sender/receiver ID for key, empty string for commonIV
    * @param info.info.id_context - ID Context
    * @param info.info.alg_aead - encoded AEAD algorithm
    * @param info.info.type - "Key" or "IV"
    * @param info.info.L - byte size of key/nonce used for AEAD algorithm
    * @param info.hash - HMAC hashign algorithm to use
    */ 
    runHKDF(ikm, length, info) {

    }


}

class OscoreSenderContext{
    constructor(senderID, senderSeqNumber){
        HKDF(
            masterSalt, 
            masterSecret, 
            {
                id: 'bstr, sender/rec ID for sender/rec key or empty byte string for commonIV',
                id_context: 'bstr/nil idContext or nil if not provided',
                alg_aed: 'int/tstr, AEAD algorithm encoded, e.g. 10 for AES-CCM-16-64-128',
                type: 'tstr, "key" or "IV", label is an ASCII string not including trailing NUL byte',
                L: 'uint, size of key/nonce used for AEAD algorithm'

            })  
        }
        
}    

class OscoreReceiverContext{
    constructor(recID, recKey, replayWindow){

    }
}

module.exports.OscoreSecurityContext = OscoreSecurityContext

function contextTest() {
    let masterSecret = Buffer.from('0102030405060708090a0b0c0d0e0f10', 'hex') // 16 bytes
    let masterSalt =  Buffer.from('9e7ca92223786340', 'hex') // 8 bytes
    let recID = Buffer.from('01', 'hex')
}
