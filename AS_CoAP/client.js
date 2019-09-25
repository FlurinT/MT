const coap = require('coap')
const EC = require('elliptic').ec
const cbor = require('cbor')
const coseHelper = require('../services/coseHelper')
const cose = require('cose-js')
const base64url = require('base64url')

class Client {
    constructor(asAdress, rsAdress) {
        this.asAdress = asAdress
        this.rsAdress = rsAdress
    }

    tokenRequest() {
        const requestPayload = {
            client_id: 'client0',
            scope: 'temp',
            req_cnf: {
                COSE_Key: {
                    kty: 'EC',
                    kid: "h'11'",
                    crv: 'P-256',
                    x: publicXEPH,
                    y: publicYEPH
                }
            }
        }
        // Static keys used to sign, preregistered on AS
        let private = 'eccaba7c265cbad6d605e1bc917f95e634d36bf12c4204832d10541f4f001462'
        let publicX = '1b698d23537b54c9b8098e81aa2317bfa0aa22197ebe334ed624d0a719c26689'
        let publicY = 'f830a16268f812f2762367783ccf6fa7312e189f5f6813a0aa928ecf3eb9e46f'

        const cborPayload = cbor.encode(requestPayload)
        const signedCose = await coseHelper.signES256(cborPayload, private)
        var req = coap.request(this.asAdress)
        req.write(signedCose)
        req.on('response', (res) => {
            const b64token = res.payload.toString()
            const tokenPayload = (Buffer.from(b64token, 'base64').slice(2))
            console.log('TOKEN PAYLOAD')
            console.log(tokenPayload.toString('hex'))
            verifyToken(tokenPayload)
        })
    }

    verifyToken(tokenPayload) {
        coseHelper.verifyES256(tokenPayload, publicX, publicY)
                .then((verifiedPayload) => {
                    console.log('VERIFIED PAYLOAD')
                    console.log(verifiedPayload.toString('hex'))     
                    this.cwt = verifiedPayload
                })
    }

    tokenUpload() {
        const uploadPayload = {
            cwt: this.cwt,
            cnonce: 100
        }
        var req = coap.request(this.rsAdress + '/authz-info')
        const cborPayload = cbor.encode(uploadPayload)
        req.write(cborPayload)
        req.on('response', (res) => {
            console.log(res.payload.toString())
        })
    }
}

module.exports.Client = Client