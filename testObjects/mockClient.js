const coap = require('coap')
const EC = require('elliptic').ec
const cbor = require('cbor')
const coseHelper = require('../services/coseHelper')
const cose = require('cose-js')
const base64url = require('base64url')

class MockClient {
    constructor(asAdress, rsAdress, privateK, publicX, publicY) {
        this.asAdress = asAdress
        this.rsAdress = rsAdress
        this.privateK = privateK
        this.publicX = publicX
        this.publicY = publicY

        let ec = new EC('p256').genKeyPair()
        this.privateEPH = ec.getPrivate().toString('hex')
        this.publicXEPH = ec.getPublic().getX().toString('hex')
        this.publicYEPH = ec.getPublic().getY().toString('hex')
    }

    async buildRequest() {

        // Static keys used to sign, preregistered on AS
        var privateK = 'eccaba7c265cbad6d605e1bc917f95e634d36bf12c4204832d10541f4f001462'
        var publicX = '1b698d23537b54c9b8098e81aa2317bfa0aa22197ebe334ed624d0a719c26689'
        var publicY = 'f830a16268f812f2762367783ccf6fa7312e189f5f6813a0aa928ecf3eb9e46f'

        const requestPayload = {
            client_id: 'client0',
            scope: 'temp',
            req_cnf: {
                COSE_Key: {
                    kty: 'EC',
                    kid: "h'11'",
                    crv: 'P-256',
                    x: this.publicXEPH,
                    y: this.publicYEPH
                }
            }
        }
        
        const cborPayload = cbor.encode(requestPayload)
        const signedCose = await coseHelper.signES256(cborPayload, privateK)
        var req = coap.request(this.asAdress + '/Token')
        req.write(signedCose)
        return req
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

module.exports.MockClient = MockClient