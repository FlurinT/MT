const Web3 = require('web3')
const fs = require('fs')

class DPKI {
  constructor() {
    var contractBuffer = fs.readFileSync('./build/contracts/DPKI.json')
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

  createKeyRing(x, y, signature, sender) {
    return new Promise((resolve) => {
      this.contract.methods.createKeyRing(x, y, signature)
        .send({ from: sender, gas: 5000000 })
        .then(() => {
          console.log('after creation')
          resolve()
        })
    })
  }

  addPublicKey(x, y, keyowner, signature, sender) {
    return new Promise((resolve) => {
      this.contract.methods.addPublicKey(x, y, keyowner, signature)
        .send({ from: sender, gas: 5000000 })
        .then(() => {
          resolve()
        })
    })
  }
  // if directly using resolve, then the signature is added but the index not increased, what the heck :)?
  addSignature(ringOwner, x, y, signature, sender) {
    return new Promise((resolve) => {
      this.contract.methods.addSignature(ringOwner, x, y, signature)
        .send({ from: sender, gas: 500000 })
        .then(() => {
          resolve()
        })
    })
  }

  getSignatureCount(ringOwner, x, y, sender) {
    return new Promise((resolve) => {
      this.contract.methods.getSignatureCount(ringOwner, x, y)
        .call({ from: sender })
        .then((signatureCount) => {
          resolve(signatureCount)
        })
    })
  }

  async getSignature(ringOwner, x, y, index, sender) {
    return new Promise((resolve) => {
      this.contract.methods.getSignature(ringOwner, x, y, index)
        .call({ from: sender })
        .then((signature) => {
          console.log(signature['signerId'])
          resolve(signature)
        })
    })
  }

  async getAllSignatures(ringOwner, x, y, sender) {
    var signatures = new Array()
    var signatureCount = await this.getSignatureCount(ringOwner, x, y, sender)
    for (var i = 0; i < signatureCount; i++) {
      var signature = await this.getSignature(ringOwner, x, y, i, sender)
      signatures.push({
        signerId: signature['signerId'],
        signature: signature['signature']
      })
    }
    return signatures
  }
}

async function test() {
  const dpki = await new DPKI()
  var contract = await dpki.deployContract()
  dpki.setContract(contract)
  await dpki.createKeyRing(1, 2, 3, dpki.accounts[0])
  await dpki.addPublicKey(1, 3, dpki.accounts[1], 3, dpki.accounts[0])
  await dpki.addSignature(dpki.accounts[0], 1, 2, 4, dpki.accounts[3])
  await dpki.addSignature(dpki.accounts[0], 1, 2, 5, dpki.accounts[4])
  await dpki.addSignature(dpki.accounts[0], 1, 2, 6, dpki.accounts[5])
  var signatureCount = await dpki.getSignatureCount(dpki.accounts[0], 1, 2, dpki.accounts[6])
  console.log('signature count: ', signatureCount)
  var signature = await dpki.getSignature(dpki.accounts[0], 1, 2, 2, dpki.accounts[6])
  var signatures = await dpki.getAllSignatures(dpki.accounts[0], 1, 2, dpki.accounts[4])
  console.log(signatures)
}

test()
