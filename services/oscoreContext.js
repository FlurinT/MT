'use string'

class OscoreCommonContext{
    constructor( 
        masterSecret, 
        masterSalt, 
        idContext, 
        commonIV,
        aeadAlg = 'AES-CCM-16-64-128',
        hkdfAlg = 'HKDF SHA-256',
    ){
        
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

module.exports.OscoreCommonContext = OscoreCommonContext
module.exports.OscoreSenderContext = OscoreSenderContext
module.exports.OscoreReceiverContext = OscoreReceiverContext

