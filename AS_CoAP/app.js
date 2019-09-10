const Router = require("coap-router");
const app = Router();
const cose = require('cose-js')
const CoseVerifying = require('../services/coseVerifying').CoseVerifying

let publicX = '1b698d23537b54c9b8098e81aa2317bfa0aa22197ebe334ed624d0a719c26689'
let publicY = 'f830a16268f812f2762367783ccf6fa7312e189f5f6813a0aa928ecf3eb9e46f'

app.get("/Token", (req, res) => {
    //console.log(Buffer.from(req.payload, 'hex').toString())
    coseVerifying = new CoseVerifying(req.payload, publicX, publicY)
    coseVerifying.verifyp256(req.payload, (buf) => {
        console.log(buf.toString('hex'))
        res.end(req.payload)
    })
})

app.get("/Introspection", (req, res) => {
    res.end('Introspection endpoint')
})

module.exports = app;