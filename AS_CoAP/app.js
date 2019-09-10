const Router = require("coap-router");
const app = Router();
const cose = require('cose-js')
const CoseVerifying = require('../services/coseVerifying').CoseVerifying
const CoseSigning = require('../services/coseSigning').CoseSigning
const cwtClass = require('./@netnexus_modified/node-cborwebtoken').Cborwebtoken

let private = 'eccaba7c265cbad6d605e1bc917f95e634d36bf12c4204832d10541f4f001462'
let publicX = '1b698d23537b54c9b8098e81aa2317bfa0aa22197ebe334ed624d0a719c26689'
let publicY = 'f830a16268f812f2762367783ccf6fa7312e189f5f6813a0aa928ecf3eb9e46f'

async function cwtTest(){
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
            kty: 'EC',
                kid: "h'11'",
                crv: 'P-256',
                x: '123456',
                y: '123456'
        }
    }
}
cwt = new cwtClass()
let translatedClaims = await cwt.getTranslatedClaims(payload)
console.log('json Claims: ' + translatedClaims)
let coseSigning = await new CoseSigning(translatedClaims)
let signedCose = await coseSigning.signp256(private)
console.log(signedCose)
// HERE IS THE TOKEN :)
let cborToken = Buffer.concat([cwtClass.CWT_TAG, signedCose]).toString("base64")
console.log(cborToken)
let decodedToken = (Buffer.from(cborToken, "base64").slice(2))
let coseVerifying = new CoseVerifying(decodedToken, publicX, publicY)
coseVerifying.verifyp256(signedCose, (buf) => {
    console.log(Buffer.from(buf, 'hex').toString())
})

}

cwtTest()

app.get("/Token", (req, res) => {
    //console.log(Buffer.from(req.payload, 'hex').toString())
    coseVerifying = new CoseVerifying(req.payload, publicX, publicY)
    coseVerifying.verifyp256(req.payload, (buf) => {
        // entering here means the verification succeeded !
        console.log(JSON.parse(buf.toString('hex')))
        // ToDo: building the token and sending it, need another pair of keys for the AS
        

        res.end(req.payload)
    })
})

app.get("/Introspection", (req, res) => {
    res.end('Introspection endpoint')
})

module.exports = app;