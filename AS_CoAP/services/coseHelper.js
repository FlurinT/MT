'use strict'
const cose = require('cose-js')

/*
* @param payload - Payload to be signed
* @param privateKey - Private Key used for signing
* @returns Signed COSE
*/
module.exports.signES256 = async (
    payload,
    privateKey
) => {
    const headers = {
        'p': { 'alg': 'ES256' },
        'u': { 'kid': '11' }
    }
    const signer = {
        'key': {
            'd': Buffer.from(privateKey, 'hex')
        }
    }
    return await cose.sign.create(
        headers,
        payload,
        signer
    )
}

/*
* @param signedCose - Verifying signature of signedCose
* @param publicKeyX - X coordinate on elliptic curve
* @param publicKeyY - Y coordinate on elliptic curve
* @returns Payload of signed COSE
*/
module.exports.verifyES256 = async (
    signedCose,
    publicKeyX,
    publicKeyY
) => {
    const verifier = {
        'key': {
            'x': Buffer.from(publicKeyX, 'hex'),
            'y': Buffer.from(publicKeyY, 'hex')
        }
    }
    return await cose.sign.verify(
        Buffer.from(signedCose, 'hex'),
        verifier
    )
}