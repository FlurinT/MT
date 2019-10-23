var DPKI = artifacts.require("DPKI")

module.exports = function(deployer) {
  deployer.deploy(DPKI)
}