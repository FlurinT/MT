'use strict';

const cose = require('cose-js');
const jsonfile = require('jsonfile');
const base64url = require('base64url');
const deepEqual = require('deep-equal')
const cbor = require('cbor')

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

const example = jsonfile.readFileSync('./aes-ccm-enc-01.json');
  const p = {alg: 'AES-CCM-16-128/64'}
  const u = example.input.encrypted.unprotected;
  const plaintext = Buffer.from('01b3747631', 'hex');

  const recipient = {
    'key': Buffer.from('f0910ed7295e6ad4b54fc793154302ff', 'hex')
    };

  const options = {
    'externalAAD': Buffer.from('0x8501810a40411440', 'hex'),
    'contextIv': Buffer.from('4622d4dd6d944168eefb54987c', 'hex')
  };

  console.log('OPTIONS')
  console.log(options)
  console.log('RECIPIENT')
  console.log(recipient)
  console.log('p')
  console.log(p)
  console.log('u')
  console.log(u)
  return cose.encrypt.create(
    { p: p, u: u },
    plaintext,
    recipient,
    options)
    .then((buf) => {
      const actual = cbor.decodeFirstSync(buf);
      const expected = cbor.decodeFirstSync(example.output.cbor);
      deepEqual(actual, expected);
      console.log('TEST DONE')
    });