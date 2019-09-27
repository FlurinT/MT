'use strict'
const coap = require('coap')
const coap_router = require('../coap_router')
const Client = require('../testObjects/mockClient').MockClient
const assert = require('assert')
const cbor = require('cbor')
const EC = require('elliptic').ec
const coseHelper = require('../services/coseHelper')


describe('#Client-AS', () => {

    before(() => {
        const server = coap.createServer(coap_router)
        server.listen(() => {
            console.log('CoAP server is up for testing')
        })

        let ec = new EC('p256').genKeyPair()
        this.privateK_Eph = ec.getPrivate().toString('hex')
        this.publicX_Eph = ec.getPublic().getX().toString('hex')
        this.publicY_Eph = ec.getPublic().getY().toString('hex')

        this.privateK = 'eccaba7c265cbad6d605e1bc917f95e634d36bf12c4204832d10541f4f001462'
        this.publicX = '1b698d23537b54c9b8098e81aa2317bfa0aa22197ebe334ed624d0a719c26689'
        this.publicY = 'f830a16268f812f2762367783ccf6fa7312e189f5f6813a0aa928ecf3eb9e46f'

        var tokenReqPayload = {
            client_id: 'client0',
            scope: 'temp',
            req_cnf: {
                COSE_Key: {
                    kty: 'EC',
                    crv: 'P-256',
                    x: this.publicX_Eph,
                    y: this.publicY_Eph
                }
            }
        }
        this.client = new Client(
            'coap://localhost',
            'coap://localhost',
            this.privateK,
            tokenReqPayload
        )
    })

    it('testTokenEndpoint', (done => {
        this.client.buildRequest()
            .then((req) => {
                req.on('response', (res) => {
                    assert.equal(res.code, '2.05')
                    const b64token = res.payload.toString()
                    const tokenPayload = (Buffer.from(b64token, 'base64').slice(2))
                    coseHelper.verifyES256(tokenPayload, this.publicX, this.publicY)
                        .then((verifiedPayload) => {
                            console.log('ENCODED TOKEN RESPONSE')
                            console.log(verifiedPayload.toString('hex'))
                            var decodedToken = cbor.decode(verifiedPayload)
                            assert.equal(
                                decodedToken.get(8).get('OSCORE_Security_Context').get(5),
                                'AES-CCM-16-64-128'
                            )
                            assert.equal(
                                decodedToken.get(8).get(1).get(-2),
                                this.publicX_Eph
                            )
                            assert.equal(
                                decodedToken.get(8).get(1).get(-3),
                                this.publicY_Eph
                            )
                            done()
                        })
                })
                req.end()
            })
    }))

    it('testTokenUpload')

    it('testClientOscoreContext')

    it('testRSOscoreContext')

    it('testResourceRequest')
})