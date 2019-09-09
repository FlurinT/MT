const coap = require("coap")
const encodr = require('encodr')
const cose = require('cose-js')
const EC = require('elliptic').ec

let ec = new EC('p256').genKeyPair()
/*
console.log('Private   ' + ec.getPrivate().toString('hex'))
console.log('Public X  '+ ec.getPublic().getX().toString('hex'))
console.log('Public Y  '+ ec.getPublic().getY().toString('hex'))
*/

let private = 'eccaba7c265cbad6d605e1bc917f95e634d36bf12c4204832d10541f4f001462'
let publicX = '1b698d23537b54c9b8098e81aa2317bfa0aa22197ebe334ed624d0a719c26689'
let publicY = 'f830a16268f812f2762367783ccf6fa7312e189f5f6813a0aa928ecf3eb9e46f'

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
const signer = {
  'key': {
    'd': Buffer.from(private, 'hex')
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
          'x': Buffer.from(publicX, 'hex'),
          'y': Buffer.from(publicY, 'hex')
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
