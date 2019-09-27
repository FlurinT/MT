const coap = require('coap')
const EC = require('elliptic').ec
const cbor = require('cbor')
const coseHelper = require('../services/coseHelper')
const cose = require('cose-js')
const base64url = require('base64url')

class MockClient {
    constructor(asAdress, rsAdress, privateK, tokenReqPayload) {
        this.asAdress = asAdress
        this.rsAdress = rsAdress
        this.privateK = privateK
        this.tokenReqPayload = tokenReqPayload

        let ec = new EC('p256').genKeyPair()
        this.privateK_Eph = ec.getPrivate().toString('hex')
        this.publicX_Eph = ec.getPublic().getX().toString('hex')
        this.publicY_Eph = ec.getPublic().getY().toString('hex')
    }

    async buildRequest() {
        const cborPayload = cbor.encode(this.tokenReqPayload)
        console.log('ENCODED REQUEST PAYLOAD')
        console.log(cborPayload.toString('hex'))
        const signedCose = await coseHelper.signES256(cborPayload, this.privateK)
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