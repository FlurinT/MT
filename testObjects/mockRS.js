const Router = require("coap-router")
const rs_router = Router()
const cbor = require('cbor')
const coseHelper = require('../services/coseHelper')
const oscoreContext = require('../services/oscoreContext').OscoreSecurityContext
const cose = require('cose-js')
const coap = require('coap')
const crypto = require('crypto')

rs_router.get("/authz-info", async (req, res) => {

    console.log('### AUTHZ TOKEN ###')
    var signedTokenPayload = req.payload
    var decodedTokenPayload = await cbor.decode(signedTokenPayload)
    /*
    var introspectionRes = await introspectToken(decodedToken)
    console.log('### INTROSPECTION RES ###')
    console.log(introspectionRes)
    */
    var decodedToken = await cbor.decode(decodedTokenPayload.value[2])
    var clientPubX = decodedToken.get(8).get(1).get(-2)
    var clientPubY = decodedToken.get(8).get(1).get(-3)
    console.log('pubx key: ' + clientPubX)
    console.log('puby key: ' + clientPubY)
    coseHelper.verifyES256(
        signedTokenPayload,
        clientPubX,
        clientPubY
    ).then((buf) => {
        console.log('### VERIFIED POP TOKEN ###')
        console.log(buf)
        res.end('Hello Client')
    })
})

rs_router.get("/temperature", async (req, res) => {
    const rsECDH = crypto.createECDH('prime256v1')
    rsECDH.setPrivateKey(preestablishedKeys.tempSensorInLivingRoom.private)
    var ecdhSecret = rsECDH.computeSecret(preestablishedKeys.client.xy, null, 'hex');

    console.log('RS ECDH SECRET')
    console.log(ecdhSecret)

    var securityContext = new oscoreContext(1, 0, ecdhSecret)
    const p = {
        "alg": "AES-CCM-16-128/64",
    }
    const u = {
        'kid': Buffer.from('01', 'hex'), //sender ID
        'Partial_IV': Buffer.from('19', 'hex') //sequence number
    }

    const recipient = {
        'key': securityContext.receiverKey
    };
    const options = {
        'externalAAD': Buffer.from('0x8501810a40411440', 'hex'),
        'contextIv': securityContext.commonIV
    };

    var decrypted = await cose.encrypt.read(req.payload, recipient.key, options)
    console.log('### DECRYPTED HEADERS ###')
    console.log(decrypted.toString())
    res.end(Buffer.from('30'))
})

async function introspectToken(token) {
    return new Promise((resolve) => {
        var req = coap.request(this.asAdress + '/Introspection')
        req.write(token)
        req.on('response', (res) => {
            //console.log('### Introspection RES ###')
            //console.log(res.payload.toString())
            resolve(res.payload)
        })
        req.end()
    })

}

module.exports = rs_router;