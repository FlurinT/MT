'use strict'
const hkdf = require('futoin-hkdf')
const cbor = require('cbor')

class OscoreSecurityContext {

    constructor(
        senderID,
        receiverID,
        masterSecret,
        masterSalt = '',
        idContext = null,
        aeadAlg = 10,
        hkdfAlg = 'SHA-256',
    ) {
        this.masterSecret = Buffer.from(masterSecret, 'hex')
        this.senderID = senderID
        this.receiverID = receiverID
        this.masterSalt = Buffer.from(masterSalt)
        this.idContext = idContext
        this.aeadAlg = aeadAlg
        this.hkdfAlg = hkdfAlg

        this.deriveFullContext()
    }

    deriveFullContext() {
        this.senderKey = this.deriveSenderKey()
        this.receiverKey = this.deriveReceiverKey()
        this.commonIV = this.deriveCommonIV()
    }

    deriveCommonIV() {
        let cborInfo = this.buildSerializedInfo('IV')
        console.log('cborINFO')
        console.log(cborInfo.toString('hex'))
        return this.runHKDF(cborInfo, 13)
    }

    deriveSenderKey() {
        let cborInfo = this.buildSerializedInfo('Key', this.senderID)
        return this.runHKDF(cborInfo, 16)
    }

    deriveReceiverKey() {
        let cborInfo = this.buildSerializedInfo('Key', this.receiverID)
        return this.runHKDF(cborInfo, 16)
    }

    /* for hkdf(), ToDo: replace this with information about cborInfo
    * @param ikm - Master Secret
    * @param L - required output length in bytes (16 for keys, 13 for commonIV)
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
            info: cborInfo
        }
        //console.log('INFO')
        //console.log(info.info.toString('hex'))
        //info.salt = this.masterSalt
        //info.hash = this.hkdfAlg
        return hkdf(this.masterSecret, L, info)
    }

    buildSerializedInfo(type, id, id_context = null, alg_aead = 10) {
        let infoArray = new Array()
        if (type === 'Key') {
            infoArray.push(Buffer.from(this.intToHex(id), 'hex'))
            infoArray.push(id_context)
            infoArray.push(alg_aead)
            infoArray.push(type)
            infoArray.push(16) // first 16 bytes for keys
        } else {
            infoArray.push(Buffer.from('', 'hex')) // empty string for common IV
            infoArray.push(id_context)
            infoArray.push(alg_aead)
            infoArray.push(type)
            infoArray.push(13) // first 13 bytes for common IV
        }
        return cbor.encode(infoArray)
    }

    intToHex(i) {
        var hex = i < 16 ? '0' + Number(i).toString(16) : Number(i).toString(16)
        return hex
    }
}

module.exports.OscoreSecurityContext = OscoreSecurityContext

function testDeriving() {
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
}
//testDeriving()

function testObject() {
    var context = new OscoreSecurityContext(0, 1)
    console.log("SENDER KEY")
    console.log(context.senderKey.toString('hex'))
    console.log("RECEIVER KEY")
    console.log(context.receiverKey.toString('hex'))
    console.log("COMMON IV")
    console.log(context.commonIV.toString('hex'))
}
//testObject()