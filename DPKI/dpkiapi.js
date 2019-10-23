const Web3 = require('web3')
const fs = require('fs')

let contractBuffer = fs.readFileSync('./build/contracts/DPKI.json')
let contractJson = JSON.parse(contractBuffer)
let abi = contractJson.abi
let bytecode = contractJson.bytecode
let contractAddress
const web3 = new Web3('ws://localhost:8545');

web3.eth.getAccounts()
.then((accounts) => {
  const Contract = new web3.eth.Contract(
    abi,
    {data: bytecode, from: accounts[0], gas: 5000000}
  )

  Contract.deploy()
  .send()
  .on('receipt', (receipt) => {
      contractAddress = receipt.contractAddress
      console.log('CONTRACT ADDRESS')
      console.log(contractAddress)

      const DPKI = new web3.eth.Contract(abi, contractAddress)
      DPKI.methods.createKeyRing(1,2,3,).send({from: accounts[0], gas: '500000'})
      console.log('done')
    })
})