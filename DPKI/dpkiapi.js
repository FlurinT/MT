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
}

async function test() {
  const dpki = await new DPKI()
  var contract = await dpki.deployContract()
  contract.methods.get().call({ from: dpki.accounts[0] }).then(console.log)
}

test()
