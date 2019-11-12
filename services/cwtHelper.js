'use strict'

module.exports.createCWT = async (cosePayload) => {

}

module.exports.checkScope = async (payloadScope) => {

}

/*
* @param message JSON object
* @return Map with translated JSON claims
*/
module.exports.translateClaims = async (message) => {
    var claimMap = new Map()
    await translateKeys(message, claimMap)
    return claimMap
}

// ToDo: create File for Claims with nice interface?
let claims = new Array()
claims['root'] = {
    iss: 1,
    sub: 2,
    aud: 3,
    exp: 4,
    nbf: 5, 
    iat: 6, 
    cti: 7, 
    cnf: 8,
    scope: 9
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
claims['OSCORE_Security_Context'] = {
    ms: 1,
    clientId: 2,
    serverId: 3,
    hkdf: 4,
    alg: 5,
    salt: 6,
    contextId: 7,
    rpl: 8
}

// Check if value from (key,value) is an object itself
function isObject(obj)
{
    return obj !== undefined && obj !== null && obj.constructor == Object;
}

/*  translates the claims contained in the ClaimDict and builds a map
*   found no other way to encode a json object without string keys
*/
function translateKeys(obj, map, claimDict = 'root') {
    var currMap = new Map()
    let claimObject = claimDict in claims ? claims[claimDict] : claims['root']
    for (var key in obj) {
        if((Object.keys(claimObject).toString()).includes(key.toString())){
            if(isObject(obj[key])){
                currMap = new Map()
                //obj[claimObject[key]] = obj[key]
                map.set(claimObject[key], currMap)
                //delete obj[key]
                translateKeys(obj[key], currMap, key.toString())
            } else {
                //obj[claimObject[key]] = obj[key]
                map.set(claimObject[key], obj[key])
                //delete obj[key]
            }
        }else{
            if(isObject(obj[key])){
                currMap = new Map()
                //obj[claimObject[key]] = obj[key]
                map.set(key, currMap)
                //delete obj[key]
                translateKeys(obj[key], currMap, key.toString())
            } else {
                //obj[claimObject[key]] = obj[key]
                map.set(key, obj[key])
                //delete obj[key]
            }
        }
    }
}