const coap = require("coap")
const encodr = require('encodr')
const cose = require('cose-js')
const EC = require('elliptic').ec
const CoseSigning = require('../services/coseHelper').CoseSigning
const CoseVerifying = require('../services/coseHelper').CoseVerifying



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
    
    const plaintext = JSON.stringify({
        client_id: 'client_0',
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
    })

    let signedCose = await signCose(plaintext,private)    
        
    var req = coap.request('coap://localhost/Token')
    req.write(signedCose);

    req.on('response', function(res) {

        let cwToken = res.payload.toString()
        console.log('cwt as b64: ' + cwToken)
        let tokenBuffer = (Buffer.from(cwToken, "base64").slice(2))
        let coseVerifying = new CoseVerifying(tokenBuffer, publicX, publicY)

        coseVerifying.verifyp256(async () => {
                // reaching here means signature verified successfull
                // ToDo: make a RS request with token, how should it look?
                //signeCose()
                tokenPost(cwToken)
            })

        })
        req.end()

}

async function tokenPost (cwToken) {
    var req = coap.request('coap://localhost/Token')
}

async function signCose(message, private){
    let coseSigning = new CoseSigning(message)
    let signedCose = await coseSigning.signp256(private)
    return signedCose
}

tokenRequest()







