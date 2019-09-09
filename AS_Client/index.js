const coap = require("coap")
const encodr = require('encodr')
const cose = require('cose-js')
const EC = require('elliptic').ec

const plaintext = JSON.stringify({
    client_id: 'client_0',
    audience: 'temp',
    req_cnf:{
        kty: 'EC',
        kid: "h'11'",
        x: 1,
        y:2
    }
})
const headers = {
  'p': {'alg': 'ES256'},
  'u': {'kid': '11'}
};

let ec = new EC('p256').genKeyPair()
const signer = {
  'key': {
    'd': Buffer.from(ec.getPrivate().toString('hex'), 'hex')
  }
};

cose.sign.create(
  headers,
  plaintext,
  signer)
.then((buf) => {
  console.log('Signed message: ' + buf.toString('hex'));
  return buf
})
.then((buf) => {
    const verifier = {
        'key': {
          'x': Buffer.from(ec.getPublic().getX().toString('hex'), 'hex'),
          'y': Buffer.from(ec.getPublic().getY().toString('hex'), 'hex')
        }
      }; 
    cose.sign.verify(
        buf,
        verifier)
      .then((buf) => {
        console.log('Verified message: ' + buf.toString('hex'));
      }).catch((error) => {
        console.log(error);
      });})
.catch((error) => {
  console.log(error);
});


/*
var req = coap.request('coap://localhost/Token')
req.on('response', function(res) {
    res.pipe(process.stdout)
    res.on('end', function(res) {
        console.log(res)
    })
  })
  req.end()
*/
