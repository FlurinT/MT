const Router = require("coap-router");
const coap_router = Router();
const cose = require('cose-js')
const cwtClass = require('./@netnexus_modified/node-cborwebtoken/dist/src').Cborwebtoken
const cbor = require('cbor')
const coseHelper = require('./services/coseHelper')
const CoseSigning = require('../services/coseHelper').CoseSigning


let private = 'eccaba7c265cbad6d605e1bc917f95e634d36bf12c4204832d10541f4f001462'
let publicKeyX = '1b698d23537b54c9b8098e81aa2317bfa0aa22197ebe334ed624d0a719c26689'
let publicKeyY = 'f830a16268f812f2762367783ccf6fa7312e189f5f6813a0aa928ecf3eb9e46f'

coap_router.get("/Token", async (req, res) => {
    signedCose = req.payload
    coseHelper.verifyES256(
        signedCose, 
        publicKeyX, 
        publicKeyY
    ).then(() => {
        return createcwt()
    }).then((cwToken) => {
        res.end(cwToken)
    })
})

coap_router.get("/Introspection", (req, res) => {
    res.end('Introspection endpoint')
})

async function createcwt(){
    const payload = { 
        iss: "coap://as.example.com", 
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
    cwt = new cwtClass()
    //let translatedClaims = await cwt.getTranslatedClaims(payload)
    let translatedClaims = await cwt.translateClaims(payload)
    console.log(translatedClaims)
    let signedCose = await signCose(translatedClaims,private)
    let cborToken = Buffer.concat([cwtClass.CWT_TAG, signedCose]).toString("base64")
    return new Promise((resolve, reject) => {
        resolve(cborToken)
    })
}

async function signCose(message, private){
    let cborPayload = cbor.encode(message)
    let coseSigning = new CoseSigning(cborPayload)
    let signedCose = await coseSigning.signp256(private)
    return signedCose
}

function verifyToken (cborToken) {
    let decodedToken = (Buffer.from(cborToken, "base64").slice(2))
    let coseVerifying = new CoseVerifying(decodedToken, publicX, publicY)
    coseVerifying.verifyp256(decodedToken, async (buf) => {
        //console.log(Buffer.from(buf, 'hex').toString())
        
    })
}

module.exports = coap_router;