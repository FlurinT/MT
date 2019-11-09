var DPKI = artifacts.require("DPKI")
var EllipticCurve = artifacts.require("EllipticCurve");

module.exports = function(deployer) {
  deployer.deploy(DPKI)
  deployer.deploy(EllipticCurve)
}