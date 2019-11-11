const Router = require("coap-router")
const coap_router = Router()
const coseHelper = require('./services/coseHelper')
const cwtHelper = require('./services/cwtHelper')
const cbor = require('cbor')
const crypto = require('crypto')

let private = 'eccaba7c265cbad6d605e1bc917f95e634d36bf12c4204832d10541f4f001462'
let publicX = '1b698d23537b54c9b8098e81aa2317bfa0aa22197ebe334ed624d0a719c26689'
let publicY = 'f830a16268f812f2762367783ccf6fa7312e189f5f6813a0aa928ecf3eb9e46f'

let privateEPH = 'c81e9dc0b03170e80e2ba99d8a20b526d78e7b9848c624a48755fec77281c528'
let publicXEPH = '1ae92174574cd039c7b1a1dab863efdd08fe4fdc7a78904789a98636b98d9a46'
let publicYEPH = 'd022fcc96289290431c7e8cda295d953e08fdcc450a85b0e2ce869b19101b507'


coap_router.get("/Token", async (req, res) => {
    var signedTokenRequest = req.payload
    var decodedTokenRequest = await cbor.decode(signedTokenRequest)
    // accessing not yet verified request, value[2] is the cbor payload in the signed cose object
    decodedTokenRequest = await cbor.decode(decodedTokenRequest.value[2])
    var clientPubX = decodedTokenRequest.req_cnf.COSE_Key.x
    var clientPubY = decodedTokenRequest.req_cnf.COSE_Key.y
    coseHelper.verifyES256(
        signedTokenRequest, 
        clientPubX, 
        clientPubY
    ).then(() => {
        var aud = decodedTokenRequest.aud
        return verifyAccess(clientPubX, clientPubY)
    })
    .then((access) => {
        console.log('VERIFIED Payload as hex')
        console.log(decodedTokenRequest)
        return createcwt(decodedTokenRequest, access)
    }).then((respPayload) => {
        res.end(respPayload)
    }).catch((err) => {
        console.log(err)
        // res.end(err)
    })
})

coap_router.get("/Introspection", (req, res) => {
    res.end('Introspection endpoint')
})

coap_router.get("/authz-info", (req, res) => {
    res.end(JSON.stringify({cnonce: 200}))
})

async function verifyAccess(x, y, aud){
    var keyString = Buffer.from('keyHash'/*key.getPublicKey().toString('hex')*/)
    var keyHash = '0x' + crypto.createHash('sha256').update(keyString).digest('hex');
    var access = await dpki.verifyAccess(dpki.accounts[1], keyHash, 'rs1', dpki.accounts[5])
    //check first if access is still valid, probably doing this in dpki
    return access
}

async function createcwt(decodedTokenRequest, access){
    var coseKey = decodedTokenRequest.req_cnf.COSE_Key
    const payload = { 
        aud: decodedTokenRequest.aud, 
        exp: access.expiry,
        scope: access.scope,
        cnf: {
            COSE_Key: coseKey
        }
    }
    let claimMap = await cwtHelper.translateClaims(payload)
    let cborClaims = await cbor.encode(claimMap)
    let cborToken = cborClaims.toString("base64")
    var resPayload = {
        access_token: cborToken,
        test: 'test'
    }
    var encodedResPayload = await cbor.encode(resPayload)
    let signedCose = await coseHelper.signES256(encodedResPayload,private)
    return signedCose
}

module.exports = coap_router;