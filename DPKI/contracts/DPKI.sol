pragma solidity 0.5.12;

contract DPKI{

    mapping (uint => address) public publicKeys;
    mapping (uint => bool) public revokedKeys;

    function addKey(uint keyHash) public{
        require(publicKeys[keyHash] == address(0), 'key existing');
        publicKeys[keyHash] = msg.sender;
    }

    // why not having a key can can be shared for revoking keys instead of using msg.sender?
    function revokeKey(uint keyHash) public{
        require(publicKeys[keyHash] != address(0), 'key not existing');
        require(publicKeys[keyHash] == msg.sender, 'no permit to revoke');
        revokedKeys[keyHash] = true;
    }

    mapping (address => KeyRing) public keyRings;
    //maybe define the trust depth of the ring?
    struct KeyRing{
        address ringOwner;
        address[] trustedRings;
        mapping (uint => mapping(string => Access)) keyAccess;
    }

    struct Access{
       string scope;
       uint expiry;
    }

    function createKeyRing() public{
        KeyRing storage keyRing = keyRings[msg.sender];
        require(keyRing.ringOwner == address(0), 'keyRing existing');
        keyRing.ringOwner = msg.sender;
    }

    function giveAccess(uint keyHash, string memory aud, string memory scope, uint expiry) public{
        KeyRing storage keyRing = keyRings[msg.sender];
        require(keyRing.ringOwner == msg.sender, 'not keyRing Owner');
        require(revokedKeys[keyHash] == false, 'key is revoked');
        keyRing.keyAccess[keyHash][aud] = Access(scope, expiry);
    }

    function updateExpiry(uint keyHash, string memory aud, uint expiry) public{
        KeyRing storage keyRing = keyRings[msg.sender];
        require(keyRing.ringOwner == msg.sender, 'not keyRing Owner');
        keyRing.keyAccess[keyHash][aud].expiry = expiry;
    }

    function changeScope(uint keyHash, string memory aud, string memory scope) public{
        KeyRing storage keyRing = keyRings[msg.sender];
        require(keyRing.ringOwner == msg.sender, 'not keyRing Owner');
        require(keyRing.keyAccess[keyHash][aud].expiry != 0, 'no expiry');
        keyRing.keyAccess[keyHash][aud].scope = scope;
    }

    function trustRing(address ringAddress) public{
        KeyRing storage keyRing = keyRings[msg.sender];
        require(keyRing.ringOwner == msg.sender, 'not keyRing Owner');
        keyRing.trustedRings.push(ringAddress);
    }

    function untrustRing(uint index) public{
        KeyRing storage keyRing = keyRings[msg.sender];
        require(keyRing.ringOwner == msg.sender, 'not keyRing Owner');
        delete keyRing.trustedRings[index];
    }

    function getTrustedRingsCount(address ringAddress) public view returns(uint){
        address[] memory ringAddresses = keyRings[ringAddress].trustedRings;
        return (ringAddresses.length);
    }

    function getTrustedRingAddress(address ringAddress, uint index) public view returns(address){
        return keyRings[ringAddress].trustedRings[index];
    }
}