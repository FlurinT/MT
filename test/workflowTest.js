'use strict'
const coap = require('coap')
const coap_router = require('../coap_router')
const Client = require('../testObjects/mockClient').MockClient
const assert = require('assert')
const cbor = require('cbor')

describe('#Client-AS', () => {

    before(() => {
        const server = coap.createServer(coap_router)
            server.listen(() => {
                console.log('CoAP server is up for testing')
            })
    })

    it('testTokenEndpoint', () => {
        var client = new Client('coap://localhost', 'coap://localhost')
        client.buildRequest()
        .then((req) => {
            req.on('response', (res) => {
                const b64token = res.payload.toString()
                const tokenPayload = (Buffer.from(b64token, 'base64').slice(2))
                assert.equal(res.code, '2.05')
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