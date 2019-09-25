'use strict'
const hkdf = require('futoin-hkdf')
const cbor = require('cbor')

class OscoreSecurityContext{
    
    constructor(         
        senderID,
        receiverID,
        masterSecret = '8540f60a6249560d0102030405060708090a0b0c0d0e0f10', 
        masterSalt = '', 
        idContext = null,
        aeadAlg = 10,
        hkdfAlg = 'SHA-256',
    ){
        this.masterSecret = Buffer.from(masterSecret)
        this.senderID = senderID
        this.receiverID = receiverID
        this.masterSalt = Buffer.from(masterSalt)
        this.idContext = idContext
        this.aeadAlg = aeadAlg
        this.hkdfAlg = hkdfAlg

        //this.commonIV = this.deriveCommonIV() //used to generate the AEAD nonce, same length as AEAD alg nonce
        this.senderKey = this.deriveSenderKey()
        //this.receiverKey = derivereceiverKey()
    }

    deriveCommonIV() {
        let cborInfo = this.buildSerializedInfo('IV')
        console.log('serialized Info')
        console.log(cborInfo.toString('hex'))
        return this.runHKDF(cborInfo, 13)
    }

    deriveSenderKey() {
        let cborInfo = this.buildSerializedInfo('Key', this.senderID)
        console.log('serialized info')
        console.log(cborInfo.toString('hex'))
        return this.runHKDF(cborInfo, 16)
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
    runHKDF(cborInfo, L) {
        var info = {
            info:cborInfo
        }
        console.log(info.info.toString('hex'))
        //info.salt = this.masterSalt
        //info.hash = this.hkdfAlg
        return hkdf(this.masterSecret, L, info)
    }

    buildSerializedInfo(type, id, id_context = null, alg_aead = 10) {
        var infoArray = new Array()
        if(type === 'Key'){
            console.log('ID')
            console.log(this.intToHex(id))
            infoArray.push(Buffer.from('01', 'hex'))
            infoArray.push(id_context)
            infoArray.push(alg_aead)
            infoArray.push(type)
            infoArray.push(16) // first 16 bytes for keys
        } else {
            infoArray.push(Buffer.from('','hex')) // empty string for common IV
            infoArray.push(id_context)
            infoArray.push(alg_aead)
            infoArray.push(type)
            infoArray.push(13) // first 13 bytes for common IV
        }
        return cbor.encode(infoArray)
    }

    intToHex(i) {
        var hex = i < 16 ? '0'+ Number(i).toString(16) : Number(i).toString(16)
        return hex
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

function testDeriving() {
    let ikm = Buffer.from('0102030405060708090a0b0c0d0e0f10', 'hex')
    let info = {
        //salt : Buffer.from('9e7ca92223786340', 'hex'),
        info: Buffer.from('854100f60a634b657910', 'hex'),
        //hash : 'SHA-256'
    }
    let length = 16 // to derive key 16, 13 for common IV
    
    let senderKey = hkdf(ikm, length, info)
    console.log('SENDER KEY')
    console.log(senderKey.toString('hex'))
    
    /*
    var infoo = [
        Buffer.from('00', 'hex'),
        null,
        10,
        'Key',
        16
    ]
    console.log('ENCODE')
    console.log(cbor.encode(infoo).toString('hex'))
    console.log('DECODE')
    console.log(cbor.decode(Buffer.from('854101f60a634b657910', 'hex')))
    console.log('KEY')
    console.log(senderKey.toString('hex'))
    */
}

testDeriving()

function testObject() {
    var context = new OscoreSecurityContext(0, 1)
    console.log(context.senderKey.toString('hex'))
}

//testObject()