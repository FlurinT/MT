pragma solidity 0.5.11;

contract DPKI{

    mapping (address => KeyRing) keyRings;

    struct KeyRing{
        address ringOwner;
        bool isSet;
        mapping (uint => mapping(uint => PublicKey)) publicKeys;
    }

    struct PublicKey{
        address keyOwnerId;
        Signature[] signatures;
    }

    struct Signature{
        address signerId;
        uint signature;
    }

    function createKeyRing(uint x, uint y, uint signature) public{
        KeyRing storage keyRing = keyRings[msg.sender];
        require(keyRing.isSet == false, 'keyRing existing');
        keyRing.ringOwner = msg.sender;
        keyRing.publicKeys[x][y].keyOwnerId = msg.sender;
        keyRing.publicKeys[x][y].signatures.push(Signature(msg.sender, signature));
        keyRing.isSet = true;
        //assert(keyRing.isSet == true);
    }

    function addPublicKey(uint x, uint y, address subject, uint signature) public {
        KeyRing storage keyRing = keyRings[msg.sender];
        require(keyRing.ringOwner == msg.sender, 'not keyRingOwner');
        require(keyRing.publicKeys[x][y].keyOwnerId == address(0), 'key existing');
        keyRing.publicKeys[x][y].keyOwnerId = subject;
        keyRing.publicKeys[x][y].signatures.push(Signature(subject, signature));
    }

    function addSignature(address ringOwner, uint x, uint y, uint signature) public{
        require(keyRings[ringOwner].isSet == true, 'keyRing not existing');
        keyRings[ringOwner].publicKeys[x][y].signatures.push(Signature(msg.sender, signature));
    }

    function getSignatureCount(address ringOwner, uint x, uint y) public view returns(uint){
        return keyRings[ringOwner].publicKeys[x][y].signatures.length;
    }

    function getSignature(address ringOwner, uint x, uint y, uint index) public view returns(address signerId, uint signature){
        Signature memory currSignature = keyRings[ringOwner].publicKeys[x][y].signatures[index];
        return(currSignature.signerId, currSignature.signature);
    }

    function get() public view returns(uint){
        return(10);
    }
}