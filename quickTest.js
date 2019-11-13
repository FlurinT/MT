'use strict';

const cose = require('cose-js');
const jsonfile = require('jsonfile');
const cbor = require('cbor')

const example = jsonfile.readFileSync('./aes-ccm-enc-01.json');
  const p = {
    "alg":"AES-CCM-16-128/64",
  }
  // both unprotected, but integrity protected by being the encrypted payload
  const u = {
    'kid': Buffer.from('16', 'hex'), //sender ID
    'Partial_IV': Buffer.from('19', 'hex') //sequence number
  }
  const plaintext = Buffer.from(JSON.stringify(u));
  

  const recipient = {
    'key': Buffer.from('321b26943253c7ffb6003b0b64d74041', 'hex')
  };
  console.log(recipient)

  const options = {
    'externalAAD': Buffer.from('0x8501810a40411440', 'hex'),
    'contextIv': Buffer.from('be35ae297d2dace910c52e99f9', 'hex')
  };

  console.log('OPTIONS')
  console.log(options)
  console.log('RECIPIENT')
  console.log(recipient.key.toString('hex'))
  console.log('p')
  console.log(p)
  return cose.encrypt.create(
    { 
      p: p,
      u: u
    },
    plaintext,
    recipient,
    options)
    .then((buf) => {
      console.log(buf.toString('hex'))
      const actual = cbor.decodeFirstSync(buf);
      const expected = cbor.decodeFirstSync(example.output.cbor);
      const plaintext = example.input.plaintext;
      return cose.encrypt.read(buf,recipient.key, options)
      .then((plaintext) => {
        console.log(plaintext.toString())
      });
    });
  