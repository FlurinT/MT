const Web3 = require('web3')
const fs = require('fs')
const keccak256 = require('keccak256')
const crypto = require('crypto');
const ecPem = require('ec-pem')



class DPKI {
  constructor() {
    var contractBuffer = fs.readFileSync('./DPKI/build/contracts/DPKI.json')
    var contractJson = JSON.parse(contractBuffer)
    this.abi = contractJson.abi
    this.bytecode = contractJson.bytecode
    this.web3 = new Web3('ws://localhost:8545');
  }

  async setContract(contract) {
    this.contract = contract
  }

  async deployContract() {
    this.accounts = await this.web3.eth.getAccounts()
    const contract = await new this.web3.eth.Contract(
      this.abi, { data: this.bytecode, from: this.accounts[0], gas: 5000000 }
    )
    return new Promise((resolve) => {
      contract.deploy().send()
        .on('receipt', (receipt) => {
          var contractAddress = receipt.contractAddress
          const DPKI = new this.web3.eth.Contract(this.abi, contractAddress)
          resolve(DPKI)
        })
    })
  }

  addKey(keyHash, signature, publicKey, sender) {
    return new Promise((resolve) => {
      this.contract.methods.addKey(keyHash, signature, publicKey)
        .send({ from: sender, gas: 5000000 })
        .then(() => {
          resolve()
        })
    })
  }

  revokeKey(keyHash, sender) {
    return new Promise((resolve) => {
      this.contract.methods.revokeKey(keyHash)
        .send({ from: sender, gas: 5000000 })
        .then(() => {
          resolve()
        })
    })
  }

  createKeyRing(sender) {
    return new Promise((resolve) => {
      this.contract.methods.createKeyRing()
        .send({ from: sender, gas: 5000000 })
        .then(() => {
          resolve()
        })
    })
  }

  giveAccess(keyHash, aud, scope, expiry, sender) {
    return new Promise((resolve) => {
      this.contract.methods.giveAccess(keyHash, aud, scope, expiry)
        .send({ from: sender, gas: 5000000 })
        .then(() => {
          resolve()
        })
    })
  }

  updateExpiry(keyHash, aud, expiry, sender) {
    return new Promise((resolve) => {
      this.contract.methods.updateExpiry(keyHash, aud, expiry)
        .send({ from: sender, gas: 5000000 })
        .then(() => {
          resolve()
        })
    })
  }

  changeScope(keyHash, aud, scope, sender) {
    return new Promise((resolve) => {
      this.contract.methods.changeScope(keyHash, aud, scope)
        .send({ from: sender, gas: 5000000 })
        .then(() => {
          resolve()
        })
    })
  }

  trustRing(ringAddress, sender) {
    return new Promise((resolve) => {
      this.contract.methods.trustRing(ringAddress)
        .send({ from: sender, gas: 500000 })
        .then(() => {
          resolve()
        })
    })
  }

  untrustRing(index, sender) {
    return new Promise((resolve) => {
      this.contract.methods.untrustRing(index)
        .send({ from: sender, gas: 500000 })
        .then(() => {
          resolve()
        })
    })
  }

  getTrustedRingsCount(ringAddress, sender) {
    return new Promise((resolve) => {
      this.contract.methods.getTrustedRingsCount(ringAddress)
        .call({ from: sender })
        .then((signatureCount) => {
          resolve(signatureCount)
        })
    })
  }

  async getTrustedRingAddress(ringAddress, index, sender) {
    return new Promise((resolve) => {
      this.contract.methods.getTrustedRingAddress(ringAddress, index)
        .call({ from: sender })
        .then((trustedAddress) => {
          resolve(trustedAddress)
        })
    })
  }

  async isOnCurve(x, y, sender) {
    return new Promise((resolve) => {
      this.contract.methods.isOnCurve(x, y)
        .call({ from: sender })
        .then((bool) => {
          resolve(bool)
        })
    })
  }

  async validateSignature(message, rs, q, sender) {
    return new Promise((resolve) => {
      this.contract.methods.validateSignature(message, rs, q)
        .call({ from: sender })
        .then((bool) => {
          resolve(bool)
        })
    })
  }

}

async function test() {
  const dpki = await new DPKI()
  var contract = await dpki.deployContract()
  dpki.setContract(contract)
  await dpki.createKeyRing(dpki.accounts[0])
  var keyHash = '0x' + keccak256(1,3).toString('hex')
  await dpki.addKey(keyHash, dpki.accounts[0])
  await dpki.giveAccess(keyHash, 'rs1', 'temp', 1000, dpki.accounts[0])
  await dpki.updateExpiry(keyHash, 'rs1', 2000,dpki.accounts[0])
  await dpki.changeScope(keyHash, 'rs1', 'humidity', dpki.accounts[0])
  await dpki.trustRing(dpki.accounts[1], dpki.accounts[0])
  await dpki.untrustRing(0, dpki.accounts[0])
  await dpki.trustRing(dpki.accounts[2], dpki.accounts[0])
  var trustedRingCount = await dpki.getTrustedRingsCount(dpki.accounts[0], dpki.accounts[1])
  console.log('truster rings count: ', trustedRingCount)
  var trustedAddress = await dpki.getTrustedRingAddress(dpki.accounts[0], 1,dpki.accounts[1])
  console.log(trustedAddress)
}

//test()
/*
async function testSignature() {
  const dpki = await new DPKI()
  var contract = await dpki.deployContract()
  dpki.setContract(contract)

  
  var prime256v1 = crypto.createECDH('prime256v1');
  prime256v1.generateKeys()
  var pemFormattedKeyPair = ecPem(prime256v1, 'prime256v1');
  var message = Buffer.from(prime256v1.getPublicKey().toString('hex'))
  console.log(message)
  var messageHash = '0x' + crypto.createHash('sha256').update(message).digest('hex');
  console.log(typeof(messageHash))
  console.log(messageHash)
  var signer = crypto.createSign('RSA-SHA256');
  signer.update(message);
  var sigString = signer.sign(pemFormattedKeyPair.encodePrivateKey(), 'hex');
  console.log(sigString)
  var xlength = 2 * ('0x' + sigString.slice(6, 8));
  var sigString = sigString.slice(8)

  publicKey1 = [
    '0x' + prime256v1.getPublicKey('hex').slice(2, 66),
    '0x' + prime256v1.getPublicKey('hex').slice(-64)
  ];
  signature1 = [
    '0x' + sigString.slice(0, xlength),
    '0x' + sigString.slice(xlength + 4)
  ]  
  var keyHash = '0x' + keccak256(1,3).toString('hex')
  await dpki.addKey(keyHash, messageHash, signature1, publicKey1, dpki.accounts[0])
  var verified = await dpki.validateSignature(messageHash, signature1, publicKey1, dpki.accounts[0])
  console.log(verified)
}
*/
module.exports = DPKI

//testSignature()