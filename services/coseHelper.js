let cose = require('cose-js')

class CoseSigning {
    /*
    * @param message : message to sign
    */
    constructor(message) {
        this.message = message
    }

    async signp256(privateKey, callback){
        this.privateKey = privateKey
        const headers = {
            'p': {'alg': 'ES256'},
            'u': {'kid': '11'}
          }
        const signer = {
            'key': {
              'd': Buffer.from(this.privateKey, 'hex')
            }
        }
        return await cose.sign.create(
            headers,
            this.message,
            signer)
    }

}

class CoseVerifying {

    /*
    * @param message : message to sign
    */
    constructor(signedMessage, publicX, publicY) {
        this.signedMessage = signedMessage
        this.publicX = publicX
        this.publicY = publicY
    }

    verifyp256(callback){
    
        const verifier = {
            'key': {
              'x': Buffer.from(this.publicX, 'hex'),
              'y': Buffer.from(this.publicY, 'hex')
            }
          }
        
        cose.sign.verify(
            this.signedMessage,
            verifier)
        .then((verMessage) => {
                console.log('Verified message: ' + verMessage.toString('hex'));
                callback(verMessage)
              }).catch((error) => {
                console.log(error);
              })
    
    }
}

exports.CoseVerifying = CoseVerifying
exports.CoseSigning = CoseSigning