'use strict'
const coap = require('coap')
const coap_router = require('../coap_router')
const Client = require('../client').Client
const assert = require('assert')
const cbor = require('cbor')

describe('#fullWorkFlow', () => {

    before(() => {
        const server = coap.createServer(coap_router)
            server.listen(() => {
                console.log('CoAP server is up for testing')
            })
        this.asAdress = 'coap://localhost'
        this.rsAdress = 'coap://localhost'
    })

    it('testTokenEndpoint', () => {
        var client = new Client(this.asAdress, this.rsAdress)
        client.buildRequest()
        .then((req) => {
            req.on('response', (res) => {
                const b64token = res.payload.toString()
                const tokenPayload = (Buffer.from(b64token, 'base64').slice(2))
                assert.equal(res.code, '2.05')
                console.log('tokkken')
                console.log(tokenPayload.toString('hex'))
                this.token = tokenPayload
            })
            req.end()
        })
    })
    it('clientTokenResponse', () => {

    })
    it('clientTokenUploadRequest', () => {

    })
    it('rsTokenUploadRequest', () => {

    })
    it('rsTokenUploadResponse', () => {

    })    
    it('clientTokenUploadResponse', () => {

    })
    it('clientResourceRequest', () => {

    })
    it('rsResourceRequest', () => {

    })
    it('rsResourceResponse', () => {

    })
    it('clientResourceResponse', () => {

    })
})