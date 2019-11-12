'use strict'
const coap = require('coap')
const coap_router = require('../coap_router')
const Client = require('../testObjects/mockClient').MockClient
const assert = require('assert')
const cbor = require('cbor')
const coseHelper = require('../services/coseHelper')
const DPKI = require('../DPKI/dpkiapi')
const crypto = require('crypto')
const ecPem = require('ec-pem')

describe('#Client-AS', () => {
    before(async () => {

        global.dpki = await new DPKI()
        var dpkiContract = await dpki.deployContract()
        dpki.setContract(dpkiContract)

        global.storedRS = {}
        var prime256v1RS = crypto.createECDH('prime256v1');
        prime256v1RS.generateKeys()
        storedRS.tempSensorInLivingRoom = {
            x: prime256v1RS.getPublicKey('hex').slice(2, 66),
            y: prime256v1RS.getPublicKey('hex').slice(-64),
            ringAddress: dpki.accounts[1]
        }

        const server = coap.createServer(coap_router)
        server.listen(() => {
            console.log('CoAP server is up for testing')
        })

        var prime256v1 = crypto.createECDH('prime256v1');
        prime256v1.generateKeys()
        this.privateK = prime256v1.getPrivateKey()
        this.publicX = prime256v1.getPublicKey('hex').slice(2, 66)
        this.publicY = prime256v1.getPublicKey('hex').slice(-64)

        this.privateKAS = 'eccaba7c265cbad6d605e1bc917f95e634d36bf12c4204832d10541f4f001462'
        this.publicXAS = '1b698d23537b54c9b8098e81aa2317bfa0aa22197ebe334ed624d0a719c26689'
        this.publicYAS = 'f830a16268f812f2762367783ccf6fa7312e189f5f6813a0aa928ecf3eb9e46f'

        await prepareDPKI(prime256v1)

        var tokenReqPayload = {
            aud: 'tempSensorInLivingRoom',
            client_id: 'myclient',
            req_cnf: {
                COSE_Key: {
                    kty: 'EC',
                    crv: 'P-256',
                    x: this.publicX,
                    y: this.publicY
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
        console.log('first test starting')
        this.client.buildRequest()
            .then((req) => {
                req.on('response', (res) => {
                    assert.equal(res.code, '2.05')
                    const payload = res.payload
                    console.log(payload)
                    coseHelper.verifyES256(payload, this.publicXAS, this.publicYAS)
                        .then((verifiedPayload) => {
                            var decodedPayload = cbor.decode(verifiedPayload)
                            console.log('WHOLE PAYLOAD')
                            console.log(decodedPayload)
                            var payloadToken = (Buffer.from(decodedPayload.access_token, 'base64'))
                            console.log('ENCODED TOKEN RESPONSE')
                            console.log(payloadToken.toString('hex'))
                            var decodedToken = cbor.decode(payloadToken)
                            assert.equal(
                                decodedToken.get(8).get(1).get(-2),
                                this.publicX
                            )
                            assert.equal(
                                decodedToken.get(8).get(1).get(-3),
                                this.publicY
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

async function prepareDPKI(key) {

    var pemFormattedKeyPair = ecPem(key, 'prime256v1');
    var keyString = Buffer.from('keyHash'/*key.getPublicKey().toString('hex')*/)
    var keyHash = '0x' + crypto.createHash('sha256').update(keyString).digest('hex');
    var signer = crypto.createSign('RSA-SHA256');
    signer.update(keyString);
    var sigString = signer.sign(pemFormattedKeyPair.encodePrivateKey(), 'hex');
    
    var xlength = 2 * ('0x' + sigString.slice(6, 8));
    var sigString = sigString.slice(8)
    var signature1 = [
        '0x' + sigString.slice(0, xlength),
        '0x' + sigString.slice(xlength + 4)
    ]
    var publicKey1 = [
        '0x' + key.getPublicKey('hex').slice(2, 66),
        '0x' + key.getPublicKey('hex').slice(-64)
    ];
    await dpki.addKey(keyHash, signature1, publicKey1, dpki.accounts[5])
    await dpki.createKeyRing(dpki.accounts[0])
    await dpki.createKeyRing(dpki.accounts[1])
    await dpki.trustRing(dpki.accounts[1], dpki.accounts[0])
    await dpki.giveAccess(keyHash, 'tempSensorInLivingRoom', 'temp_g', 1000, dpki.accounts[1])

    console.log('workflow end')
}