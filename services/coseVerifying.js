let cose = require('cose-js')

class CoseVerifying {

    /*
    * @param message : message to sign
    */
    constructor(signedMessage, publicX, publicY) {
        this.signedMessage = signedMessage
        this.publicX = publicX
        this.publicY = publicY
    }

    verifyp256(payload, callback){
    
        const verifier = {
            'key': {
              'x': Buffer.from(this.publicX, 'hex'),
              'y': Buffer.from(this.publicY, 'hex')
            }
          }
        
        cose.sign.verify(
            this.signedMessage,
            verifier)
        .then((buf) => {
            console.log('then')
                console.log('Verified message: ' + buf.toString('hex'));
                callback(buf)
              }).catch((error) => {
                console.log(error);
              })
    
    }
}

exports.CoseVerifying = CoseVerifying