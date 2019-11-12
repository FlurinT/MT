'use strict';

const cose = require('cose-js');
const jsonfile = require('jsonfile');
const cbor = require('cbor')

const example = jsonfile.readFileSync('./aes-ccm-enc-01.json');
  const p = {"alg":"AES-CCM-16-128/64"}
  const plaintext = Buffer.from('nanananana batman');

  const recipient = {
    'key': Buffer.from('f0910ed7295e6ad4b54fc793154302ff', 'hex')
  };
  console.log(recipient)

  const options = {
    'externalAAD': Buffer.from('0x8501810a40411440', 'hex'),
    'contextIv': Buffer.from('4622d4dd6d944168eefb54987c', 'hex')
  };

  console.log('OPTIONS')
  console.log(options)
  console.log('RECIPIENT')
  console.log(recipient.key.toString('hex'))
  console.log('p')
  console.log(p)
  return cose.encrypt.create(
    { p: p},
    plaintext,
    recipient,
    options)
    .then((buf) => {
      const actual = cbor.decodeFirstSync(buf);
      const expected = cbor.decodeFirstSync(example.output.cbor);
      console.log(buf.toString('hex'))
      const plaintext = example.input.plaintext;
      return cose.encrypt.read(buf,recipient.key, options)
      .then((buf) => {
        console.log(buf.toString())
      });
    });
  