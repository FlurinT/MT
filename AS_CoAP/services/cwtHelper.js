'use strict'

const util = require('util');
const coseHelper = require('./coseHelper')
const cbor = require('cbor')


module.exports.createCWT = async (cosePayload) => {

}

module.exports.checkScope = async (payloadScope) => {

}

module.exports.translateClaims = async (message) => {
    await translateKeys(message)
    var jsonString = JSON.stringify(message).replace(/\"([^(\")"]+)\":/g,"$1:")
    return jsonString
}

var payload = { 
    iss: "coap://as.example.com", 
    sub: "erikw", 
    aud: "coap://light.example.com", 
    exp: 1444064944, 
    nbf: 1443944944, 
    iat: 1443944944, 
    cti: Buffer.from("0b71", "hex"),
    cnf: {
        COSE_Key: {
            kty: 'publicKey',
            x: 'publicKeyClientX',
            y: 'publicKeyClientY'
        }
    }
}

let claims = new Array()
claims['root'] = {
    iss: 1,
    sub: 2,
    aud: 3,
    exp: 4,
    nbf: 5, 
    iat: 6, 
    cti: 7, 
    cnf: 8
    }
claims['cnf'] = {
    COSE_Key: 1
}
claims['COSE_Key'] = {
    kty: 1,
    crv: -1,
    x: -2,
    y: -3
}

// to check for nested json to replace
function isObject(obj)
{
    return obj !== undefined && obj !== null && obj.constructor == Object;
}

function translateKeys(obj, parent = 'root', map) {
    var currMap = new Map()
    let claimObject = claims[parent]
    for (var key in obj) {
        if((Object.keys(claimObject).toString()).includes(key.toString())){
            if(isObject(obj[key])){
                obj[claimObject[key]] = obj[key]
                map.set(claimObject[key], currMap)
                delete obj[key]
                translateKeys(obj[claimObject[key]], key.toString(), currMap)
            } else {
                obj[claimObject[key]] = obj[key]
                map.set(claimObject[key], obj[key])
                delete obj[key]
            }
        }
    }
}

function convertToMap(obj) {
    var resultMap = new Map()
}

function translateeClaims(obj) {
    const result = new Map();
    for (const key of Object.keys(obj)) {

        result.set(key, obj[key]);
    }
    return result;
}

async function test1 () {
    var map = new Map()
    await translateKeys(payload, 'root', map)
    console.log(cbor.encode(map).toString('hex'))
}

test1()