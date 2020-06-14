'use strict'
const coap = require('coap')
const coap_router = require('../coap_router')
const rs_router = require('../testObjects/mockRS')
const Client = require('../testObjects/mockClient').MockClient
const assert = require('assert')
const cbor = require('cbor')
const coseHelper = require('../services/coseHelper')
const DPKI = require('../DPKI/dpkiapi')
const crypto = require('crypto')
const ecPem = require('ec-pem')
const ethereumJSUtil = require('ethereumjs-util');

describe('#Client-AS', () => {
    before(async () => {

        global.dpki = await new DPKI()
        var dpkiContract = await dpki.deployContract()
        dpki.setContract(dpkiContract)

        global.preestablishedKeys = {}

        var p256_RS = crypto.createECDH('prime256v1');
        p256_RS.generateKeys()

        var p256_Client = crypto.createECDH('prime256v1');
        p256_Client.generateKeys()

        var p256_AS = crypto.createECDH('prime256v1');
        p256_AS.generateKeys()

        preestablishedKeys.tempSensorInLivingRoom = {
            x: p256_RS.getPublicKey('hex').slice(2, 66),
            y: p256_RS.getPublicKey('hex').slice(-64),
            xy: p256_RS.getPublicKey(),
            private: p256_RS.getPrivateKey(),
            ringAddress: dpki.accounts[1]
        }

        preestablishedKeys.client = {
            x: p256_Client.getPublicKey('hex').slice(2, 66),
            y: p256_Client.getPublicKey('hex').slice(-64),
            xy: p256_Client.getPublicKey(),
            private: p256_Client.getPrivateKey()
        }

        preestablishedKeys.AS = {
            x: '1b698d23537b54c9b8098e81aa2317bfa0aa22197ebe334ed624d0a719c26689',
            y: 'f830a16268f812f2762367783ccf6fa7312e189f5f6813a0aa928ecf3eb9e46f',
            private: 'eccaba7c265cbad6d605e1bc917f95e634d36bf12c4204832d10541f4f001462'
        }

        const server = coap.createServer(coap_router)
        server.listen(() => {
            console.log('CoAP server is up for testing')
        })
        const rServer = coap.createServer(rs_router)
        rServer.listen(5000, () => {
            console.log('Mock RS server is up for testing')
        })
                
        await prepareDPKI(p256_Client)//prime256v1)
        
        var tokenReqPayload = {
            aud: 'tempSensorInLivingRoom',
            client_id: 'client123',
            req_cnf: {
                COSE_Key: {
                    kty: 'EC',
                    crv: 'P-256',
                    x: preestablishedKeys.client.x,
                    y: preestablishedKeys.client.y
                }
            }
        }
        this.client = new Client(
            'coap://localhost',
            'coap://localhost',
            preestablishedKeys.client.private,
            tokenReqPayload
        )
    })

    it('testTokenEndpoint', (done => {
        this.client.buildRequest()
            .then((req) => {
                req.on('response', (res) => {
                    assert.equal(res.code, '2.05')
                    const payload = res.payload
                    coseHelper.verifyES256(payload, preestablishedKeys.AS.x, preestablishedKeys.AS.y)
                        .then((verifiedPayload) => {
                            console.log('### TOKEN RES ###')
                            console.log(verifiedPayload.toString('hex'))
                            var decodedPayload = cbor.decode(verifiedPayload)
                            var payloadToken = (Buffer.from(decodedPayload.access_token, 'base64'))
                            console.log('### ENCODED CWT###')
                            console.log(payloadToken.toString('hex'))

                            this.token = payloadToken.toString('hex')
                            console.log('token sent to RS START')
                            console.log(this.token)
                            console.log('token sent to RS END')
                            
                            var decodedToken = cbor.decode(payloadToken)
                            assert.equal(
                                decodedToken.get(8).get(1).get(-2),
                                preestablishedKeys.client.x
                            )
                            assert.equal(
                                decodedToken.get(8).get(1).get(-3),
                                preestablishedKeys.client.y
                            )
                            done()
                        })
                })
                req.end()
            })
    }))

    it('testTokenUpload', () => {
        this.client.buildAuthzRequest(this.token)
            .then((req) => {
                req.on('response', (res) => {
                    assert.equal(res.code, '2.05')
                    console.log('### AUTHZ RES ###')
                    console.log(res.payload.toString())
                })
                req.end()
            })
    })

    it('testResourceRequest', () => {
        this.client.buildGetRequest()
            .then((req) => {
                req.on('response', (res) => {
                    console.log('### TEMP RES ###')
                    console.log(res.payload.toString())
                })
                req.end()
            })
    })
})

async function prepareDPKI(key) {

    // Public key of Curve
    var publicKey1 = [
        '0x' + key.getPublicKey('hex').slice(2, 66),
        '0x' + key.getPublicKey('hex').slice(-64)
    ];
    var encodedKey = dpki.web3.eth.abi.encodeParameters(['uint256', 'uint256'], [publicKey1[0], publicKey1[1]])
    var keyHash = '0x' + crypto.createHash('sha256').update(ethereumJSUtil.toBuffer(encodedKey)).digest('hex')
    
    /* Tests for specific formating of keyhash to match with the smart contract implementation
    console.log('KEYHASH')
    console.log(keyHash)
    console.log(ethereumJSUtil.sha256(Buffer.from(encodedKey,'utf-8')).toString('hex'))
    console.log(ethereumJSUtil.sha256(encodedKey).toString('hex'))
    console.log('BUFFER MISSMATCH')
    console.log(ethereumJSUtil.toBuffer(encodedKey))
    console.log(Buffer.from(encodedKey, 'utf-8'))
    */
    var signer = crypto.createSign('RSA-SHA256');
    signer.update(ethereumJSUtil.toBuffer(encodedKey))
    var pemFormattedKeyPair = ecPem(key, 'prime256v1');
    var sigString = signer.sign(pemFormattedKeyPair.encodePrivateKey(), 'hex');

    var xlength = 2 * ('0x' + sigString.slice(6, 8));
    var sigString = sigString.slice(8)
    var signature1 = [
        '0x' + sigString.slice(0, xlength),
        '0x' + sigString.slice(xlength + 4)
    ]

    console.log('SIGNATURE')
    console.log(signature1)

    // current static change:
    //keyHash = '0x' + '026fe9d7917b756b563b0195d736c5fb73fad790764838c23aca514b9adc489a'
    console.log('KEYHASH ON Test')
    console.log(keyHash)
    await dpki.addKey(keyHash, signature1, publicKey1, dpki.accounts[5])
    await dpki.createKeyRing(dpki.accounts[0])
    await dpki.createKeyRing(dpki.accounts[1])
    await dpki.trustRing(dpki.accounts[1], dpki.accounts[0])
    await dpki.giveAccess(keyHash, 'tempSensorInLivingRoom', 'temp_g', 1000, dpki.accounts[1])

    console.log('workflow end')
}