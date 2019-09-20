const coap = require("coap")
const EC = require('elliptic').ec
const cbor = require('cbor')
const coseHelper = require('../AS_CoAP/services/coseHelper')
const cose = require('cose-js');

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

const plaintext = 'Secret message!';
const headers = {
  'p': {'alg': 'A128GCM'},
  'u': {'kid': 'client0'}
};
const recipient = {
  'key': Buffer.from('231f4c4d4d3051fdc2ec0a3851d5b383', 'hex')
};

cose.encrypt.create(
  headers,
  plaintext,
  recipient
).then((buf) => {
  console.log('Encrypted message: ' + buf.toString('hex'));
  console.log(cbor.decode(buf))
  // get ID from COSE header
  console.log(cbor.decode(buf).value[1].get(4).toString())
}).catch((error) => {
  console.log(error);
});
}

const key = Buffer.from('231f4c4d4d3051fdc2ec0a3851d5b383', 'hex');
const COSEMessage = Buffer.from('d8608443a10101a2044a6f75722d736563726574054c291a40271067ff57b1623c30581f23b663aaf9dfb91c5a39a175118ad7d72d416385b1b610e28b3b3fd824a397818340a040', 'hex');

cose.encrypt.read(
  COSEMessage,
  key)
.then((buf) => {
  console.log('Protected message: ' + buf.toString('utf8'));
}).catch((error) => {
  console.log(error);
});

oscoreTest()