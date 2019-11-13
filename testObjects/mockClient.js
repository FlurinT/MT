const coap = require('coap')
const EC = require('elliptic').ec
const cbor = require('cbor')
const coseHelper = require('../services/coseHelper')
const cose = require('cose-js')
const base64url = require('base64url')
const oscoreContext = require('../services/oscoreContext').OscoreSecurityContext

class MockClient {
    constructor(asAdress, rsAdress, privateK, tokenReqPayload) {
        this.asAdress = asAdress
        this.rsAdress = rsAdress
        this.privateK = privateK
        this.tokenReqPayload = tokenReqPayload
    }

    async buildRequest() {
        const cborPayload = cbor.encode(this.tokenReqPayload)
        console.log('### ENCODED TOKEN REQ ###')
        console.log(cborPayload.toString('hex'))
        const signedCose = await coseHelper.signES256(cborPayload, this.privateK)
        var req = coap.request(this.asAdress + '/Token')
        req.write(signedCose)
        return req
    }

    async buildAuthzRequest(token) {

        const signedCose = await coseHelper.signES256(token, this.privateK)
        var req = coap.request(this.rsAdress + ':5000' + '/authz-info')
        req.write(signedCose)
        return req
    }

    async buildGetRequest(){
        var securityContext = new oscoreContext(0,1)
        const p = {
            "alg":"AES-CCM-16-128/64",
          }
        const u = {
            'kid': Buffer.from('01', 'hex'), //sender ID
            'Partial_IV': Buffer.from('19', 'hex') //sequence number
        }

        const recipient = {
            'key': securityContext.senderKey
          };
        const options = {
            'externalAAD': Buffer.from('0x8501810a40411440', 'hex'),
            'contextIv': securityContext.commonIV
        };

        //const signedCose = await coseHelper.signES256(token, this.privateK)
        var encrypted = await cose.encrypt.create(
            { 
              p: p,
              u: u
            },
            Buffer.from(JSON.stringify(u)),
            recipient,
            options)
        //var decrypted = await cose.encrypt.read(encrypted,recipient.key, options)
        //console.log(decrypted.toString('base64'))
        var req = coap.request(this.rsAdress + ':5000' + '/temperature')
        req.write(encrypted)
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