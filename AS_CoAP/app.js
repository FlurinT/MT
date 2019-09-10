const Router = require("coap-router");
const app = Router();
const cose = require('cose-js')

app.get("/Token", (req, res) => {
    console.log('/Token got called')
    //console.log(Buffer.from(req.payload, 'hex').toString())
    console.log(req)
    verify(req.payload)

    res.end('Token endpoint')
})

function verify(payload){
    console.log('TEST')
    console.log(payload)

    const verifier = {
        'key': {
          'x': Buffer.from('1b698d23537b54c9b8098e81aa2317bfa0aa22197ebe334ed624d0a719c26689', 'hex'),
          'y': Buffer.from('f830a16268f812f2762367783ccf6fa7312e189f5f6813a0aa928ecf3eb9e46f', 'hex')
        }
      }
    
    cose.sign.verify(
        payload,
        verifier)
    .then((buf) => {
            console.log('Verified message: ' + buf.toString('hex'));
          }).catch((error) => {
            console.log(error);
          })

}

app.get("/Introspection", (req, res) => {
    res.end('Introspection endpoint')
})

module.exports = app;