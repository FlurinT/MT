const coap = require("coap")
const EC = require('elliptic').ec
const cbor = require('cbor')
const coseHelper = require('../AS_CoAP/services/coseHelper')
const cose = require('cose-js')
const base64url = require('base64url')

let ec = new EC('p256').genKeyPair()

/*
console.log('Private   ' + ec.getPrivate().toString('hex'))
console.log('Public X  '+ ec.getPublic().getX().toString('hex'))
console.log('Public Y  '+ ec.getPublic().getY().toString('hex'))
*/

let private = 'eccaba7c265cbad6d605e1bc917f95e634d36bf12c4204832d10541f4f001462'
let publicX = '1b698d23537b54c9b8098e81aa2317bfa0aa22197ebe334ed624d0a719c26689'
let publicY = 'f830a16268f812f2762367783ccf6fa7312e189f5f6813a0aa928ecf3eb9e46f'

let privateEPH = 'c81e9dc0b03170e80e2ba99d8a20b526d78e7b9848c624a48755fec77281c528'
let publicXEPH = '1ae92174574cd039c7b1a1dab863efdd08fe4fdc7a78904789a98636b98d9a46'
let publicYEPH = 'd022fcc96289290431c7e8cda295d953e08fdcc450a85b0e2ce869b19101b507'

async function tokenRequest(){
    
    const plaintext = {
        client_id: 'client0',
        scope: 'temp',
        req_cnf:{
            COSE_Key: {
                kty: 'EC',
                kid: "h'11'",
                crv: 'P-256',
                x: publicXEPH,
                y: publicYEPH
            }
        }
    }

    let cborPlaintext = cbor.encode(plaintext)
    let signedCose = await coseHelper.signES256(cborPlaintext, private)   
        
    var req = coap.request('coap://localhost/Token')
    /* not supported in coap package yet 
    * req.setOption('Content-Format', 'application/ace+cbor')
    */
    req.write(signedCose);

    req.on('response', function(res) {
        let b64token = res.payload.toString()
        let tokenPayload = (Buffer.from(b64token, 'base64').slice(2))
        console.log('TOKEN PAYLOAD')
        console.log(tokenPayload.toString('hex'))
        coseHelper.verifyES256(tokenPayload, publicX, publicY)
        .then((verifiedPayload) => {
            console.log('VERIFIED PAYLOAD')
            console.log(verifiedPayload.toString('hex'))
            this.cnonce = 100
            let rsPayload = {
                cwt: verifiedPayload,
                cnonce: this.cnonce
            }
            var rsReq = coap.request('coap://localhost/authz-info')
            rsReq.write(JSON.stringify(rsPayload))
            rsReq.on('response', (res) => {
                console.log(res.payload.toString())
                /*
                    Building the OSCORE context
                */
            })
            rsReq.end()
        })
    })
    
    req.end()
}

//tokenRequest()

function  oscoreTest () {

    const p = {"alg":"AES-CCM-16-128/64"}
    const u = { "alg":"direct", "kid":"clientID", 'Partial_IV':'nana'}
    const plaintext = Buffer.from('Secret message OSCORE')
    
    const headers = {
        'p': p,
        'u': u
    }
    const recipient = {
    'key': base64url.toBuffer("hJtXIZ2uSN5kbQfbtTNWbg"),
    'u': {"alg":"direct", "kid":"clientID"}
    }
    function randomSource (bytes) {
        if (bytes === 12) {
          return Buffer.from('02D1F7E6F26C43D4868D87CE', 'hex');
        } else if (bytes === 2) {
          return Buffer.from('61A7', 'hex');
        } else if (bytes === 13) {
          return Buffer.from('89F52F65A1C580933B5261A72F', 'hex');
        } else if (bytes === 7) {
          return Buffer.from('89F52F65A1C580', 'hex');
        }
      }
    const options = {
        'randomSource': randomSource
    }

    
cose.encrypt.create(
  headers,
  plaintext,
  recipient,
  options
).then((buf) => {
  console.log('Encrypted message: ' + buf.toString('hex'));
  console.log(cbor.decode(buf))
  // get ID from COSE header
  console.log(cbor.decode(buf).value[1].get(4).toString())
}).catch((error) => {
  console.log(error);
});
}

const key = base64url.toBuffer("hJtXIZ2uSN5kbQfbtTNWbg")
const COSEMessage = Buffer.from('d08343a1010aa30125044a6f75722d736563726574054d89f52f65a1c580933b5261a72f581d6f94d00b5636819fa8aa1f547034afcc8f077dfcaf34a51fc245544b05', 'hex');

cose.encrypt.read(
  COSEMessage,
  key)
.then((buf) => {
  console.log('Protected message: ' + buf.toString('utf8'));
}).catch((error) => {
  console.log(error);
});

oscoreTest()