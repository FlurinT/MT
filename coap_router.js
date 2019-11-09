const Router = require("coap-router")
const coap_router = Router()
const coseHelper = require('./services/coseHelper')
const cwtHelper = require('./services/cwtHelper')
const cbor = require('cbor')


let private = 'eccaba7c265cbad6d605e1bc917f95e634d36bf12c4204832d10541f4f001462'
let publicX = '1b698d23537b54c9b8098e81aa2317bfa0aa22197ebe334ed624d0a719c26689'
let publicY = 'f830a16268f812f2762367783ccf6fa7312e189f5f6813a0aa928ecf3eb9e46f'

let privateEPH = 'c81e9dc0b03170e80e2ba99d8a20b526d78e7b9848c624a48755fec77281c528'
let publicXEPH = '1ae92174574cd039c7b1a1dab863efdd08fe4fdc7a78904789a98636b98d9a46'
let publicYEPH = 'd022fcc96289290431c7e8cda295d953e08fdcc450a85b0e2ce869b19101b507'

coap_router.get("/Token", async (req, res) => {
    signedCose = req.payload
    // get X,Y according to ID submitted in req
    coseHelper.verifyES256(
        signedCose, 
        publicX, 
        publicY
    )/* Verify the payload as in the document!
    .then((cosePayload) => {
        return create cwtPayload()
    })
    */.then((verifiedReqPayload) => {
        console.log('VERIFIED Payload as hex')
        console.log(verifiedReqPayload.toString('hex'))
        return createcwt(verifiedReqPayload)
    }).then((cwToken) => {
        res.end(cwToken)
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

async function createcwt(verifiedReqPayload){
    var decodedPayload = cbor.decode(verifiedReqPayload)
    var coseKey = decodedPayload.req_cnf.COSE_Key
    const payload = { 
        aud: "coap://localhost:5000", 
        exp: 1444064944, 
        iat: 1443944944, 
        cnf: {
            COSE_Key: coseKey,
            OSCORE_Security_Context: {
                alg: 'AES-CCM-16-64-128',
                clientId: 'client0',
                serverId: 'server0',
                ms: "b64'+a+Dg2jjU+eIiOFCa9lObw'"
            }
        }
    }
    let claimMap = await cwtHelper.translateClaims(payload)
    let cborClaims = await cbor.encode(claimMap)
    let signedCose = await coseHelper.signES256(cborClaims,private)
    //console.log('SIGNED COSE')
    //console.log(signedCose.toString('hex'))
    //CWT_TAG = Buffer.from("d83d", "hex")
    let cborToken = Buffer.concat([Buffer.from("d83d", "hex"), signedCose]).toString("base64")
    return cborToken
}

module.exports = coap_router;