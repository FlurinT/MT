const Router = require("coap-router");
const coap_router = Router();
const coseHelper = require('./services/coseHelper')
const cwtHelper = require('./services/cwtHelper')
const cbor = require('cbor')


let private = 'eccaba7c265cbad6d605e1bc917f95e634d36bf12c4204832d10541f4f001462'
let publicKeyX = '1b698d23537b54c9b8098e81aa2317bfa0aa22197ebe334ed624d0a719c26689'
let publicKeyY = 'f830a16268f812f2762367783ccf6fa7312e189f5f6813a0aa928ecf3eb9e46f'

coap_router.get("/Token", async (req, res) => {
    signedCose = req.payload
    // get X,Y according to ID submitted in req
    coseHelper.verifyES256(
        signedCose, 
        publicKeyX, 
        publicKeyY
    )/* Verify the payload as in the document!
    .then((cosePayload) => {
        return create cwtPayload()
    })
    */.then((buf) => {
        console.log('VERIFIED Payload as hex')
        console.log(buf.toString('hex'))
        return createcwt(/*cwtPayload*/)
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

async function createcwt(){
    const payload = { 
        iss: 'coap://as.example.com', 
        sub: "erikw", 
        aud: "coap://light.example.com", 
        exp: 1444064944, 
        nbf: 1443944944, 
        iat: 1443944944, 
        cti: Buffer.from("0b71", "hex"),
        cnf: {
            COSE_Key: {
                kty: 'publicKey',
                x: 'publicKeyClientX',
                y: 'publicKeyClientY'
            }
        }
    }
    let claimMap = await cwtHelper.translateClaims(payload)
    let cborclaims = await cbor.encode(claimMap)
    let signedCose = await coseHelper.signES256(cborclaims,private)
    //CWT_TAG = Buffer.from("d83d", "hex")
    let cborToken = Buffer.concat([Buffer.from("d83d", "hex"), signedCose]).toString("base64")
    return cborToken
}

module.exports = coap_router;