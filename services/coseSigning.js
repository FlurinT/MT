let cose = require('cose-js')

class CoseSigning {

    /*
    * @param message : message to sign
    */
    constructor(message, privateKey) {
        this.message = message
    }

    signp256(privateKey, callback){
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
        return cose.sign.create(
            headers,
            this.message,
            signer)
        .then((buf) => {
            callback(buf)
        })
        .catch((err) => {
            console.log(err)
        })
    }

}

exports.CoseSigning = CoseSigning