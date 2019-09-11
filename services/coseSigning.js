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

exports.CoseSigning = CoseSigning