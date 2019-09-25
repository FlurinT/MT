const coap = require('coap')
const coap_router = require('./coap_router')

const server = coap.createServer(coap_router)
server.listen(() => {
    console.log('The CoAP server is now running.')
})

