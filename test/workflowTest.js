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
        this.token = 'pQN2dGVtcFNlbnNvckluTGl2aW5nUm9vbQFpZXhhbXBsZUFTBGQxMDAwCWZ0ZW1wX2cIoQGkAWJFQyBlUC0yNTYheEBhMmEyMzBiMTdiYTlmOGE5MzA4N2RhNTQ4NmY1MzFjZWI1ZTQwYzRhZTExZWM1YTk2MmY2MzcxMDQ1MzIxY2E4InhAMGI2OWRlNmQ0YmIxZDA2Nzc0ZWE4M2VkOWRlMTczYWVmODQzYzhmNGFmNmZiYTE5YzE1NTU1YzUxYmIxYmIwYg=='

        global.dpki = await new DPKI()
        var dpkiContract = await dpki.deployContract()
        dpki.setContract(dpkiContract)

        global.storedRS = {}
        var prime256v1RS = crypto.createECDH('prime256v1');
        prime256v1RS.generateKeys()

        const alice = crypto.createECDH('prime256v1')
        alice.setPublicKey(prime256v1RS.getPublicKey())
        alice.setPrivateKey(prime256v1RS.getPrivateKey())
        const bob = crypto.createECDH('prime256v1');
        bob.generateKeys()
        const aliceSecret = alice.computeSecret(bob.getPublicKey(), null, 'hex');
        const bobSecret = bob.computeSecret(alice.getPublicKey(), null, 'hex');
        //aliceSecret and bobSecret should be the same shared secret value
        console.log('ALICE AND BOB SAME SECRET:');
        console.log(aliceSecret === bobSecret);


        storedRS.tempSensorInLivingRoom = {
            x: prime256v1RS.getPublicKey('hex').slice(2, 66),
            y: prime256v1RS.getPublicKey('hex').slice(-64),
            ringAddress: dpki.accounts[1]
        }

        const server = coap.createServer(coap_router)
        server.listen(() => {
            console.log('CoAP server is up for testing')
        })
        const rServer = coap.createServer(rs_router)
        rServer.listen(5000, () => {
            console.log('Mock RS server is up for testing')
        })

        var prime256v1 = crypto.createECDH('prime256v1');
        prime256v1.generateKeys()
        
        this.privateKForTokenUpload = '77fea0c714eb09b70a165d4a388b66d0b6f716a07f69b8a386d807de8aa4c2f0'//prime256v1.getPrivateKey()
        /*
        this.publicX = 'a2a230b17ba9f8a93087da5486f531ceb5e40c4ae11ec5a962f6371045321ca8'//prime256v1.getPublicKey('hex').slice(2, 66)
        this.publicY = '0b69de6d4bb1d06774ea83ed9de173aef843c8f4af6fba19c15555c51bb1bb0b'//prime256v1.getPublicKey('hex').slice(-64)
        */
        this.privateK = prime256v1.getPrivateKey()
        this.publicX = prime256v1.getPublicKey('hex').slice(2, 66)
        this.publicY = prime256v1.getPublicKey('hex').slice(-64)
        // Pre Provisioned Public Key of AS
        this.privateKAS = 'eccaba7c265cbad6d605e1bc917f95e634d36bf12c4204832d10541f4f001462'
        this.publicXAS = '1b698d23537b54c9b8098e81aa2317bfa0aa22197ebe334ed624d0a719c26689'
        this.publicYAS = 'f830a16268f812f2762367783ccf6fa7312e189f5f6813a0aa928ecf3eb9e46f'
        
        await prepareDPKI(prime256v1)//prime256v1)
        
        var tokenReqPayload = {
            aud: 'tempSensorInLivingRoom',
            client_id: 'client123',
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
        this.client.buildRequest()
            .then((req) => {
                req.on('response', (res) => {
                    assert.equal(res.code, '2.05')
                    const payload = res.payload
                    coseHelper.verifyES256(payload, this.publicXAS, this.publicYAS)
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

    it('testTokenUpload', () => {
        this.client.buildAuthzRequest(this.token)
            .then((req) => {
                req.on('response', (res) => {
                    assert.equal(res.code, '2.05')
                    console.log('### AUTHZ RES ###')
                    console.log(res.payload.toString())
                    var rsPublicX = storedRS.tempSensorInLivingRoom.x
                    var rsPublicY = storedRS.tempSensorInLivingRoom.y
                })
                req.end()
            })
    })

    it('testClientOscoreContext')

    it('testRSOscoreContext')

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