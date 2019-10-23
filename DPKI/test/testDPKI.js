var assert = require('assert');
const DPKI = artifacts.require('./DPKI.sol')

describe('DPKI', function() {
  contract('#Key Ring', function(accounts) {
    it('Key Rign Creation', async function(){
      var dpki = await DPKI.deployed()
      await dpki.createKeyRing(1,2,3)
      await dpki.addPublicKey(11,11, accounts[1], 11)
      await dpki.addPublicKey(12,12, accounts[1], 12)
      await dpki.addPublicKey(13,13, accounts[1], 13)
      await dpki.addPublicKey(21,21, accounts[2], 21)
      await dpki.addPublicKey(22,22, accounts[2], 22)
      await dpki.addPublicKey(23,23, accounts[2], 23)
      await dpki.addSignature(accounts[0], 11, 11, 3, {from: accounts[3]})
      var signature = await dpki.getSignature(accounts[0], 1, 2, 0)
    })
  })
})