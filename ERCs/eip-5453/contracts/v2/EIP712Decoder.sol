pragma solidity ^0.8.13;
// SPDX-License-Identifier: MIT


struct EIP712Domain {
  string name;
  string version;
  uint256 chainId;
  address verifyingContract;
}

bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

struct GeneralExtensionDataStruct {
  bytes erc5453MagicWord;
  uint256 erc5453Type;
  uint256 nonce;
  uint256 validSince;
  bytes endorsementPayload;
}

bytes32 constant GENERALEXTENSIONDATASTRUCT_TYPEHASH = keccak256("GeneralExtensionDataStruct(bytes erc5453MagicWord,uint256 erc5453Type,uint256 nonce,uint256 validSince,bytes endorsementPayload)");

struct SingleEndorsementData {
  address endorserAddress;
  bytes sig;
}

bytes32 constant SINGLEENDORSEMENTDATA_TYPEHASH = keccak256("SingleEndorsementData(address endorserAddress,bytes sig)");

struct EndorsementTypeA {
  bytes erc5453MagicWord;
  uint256 erc5453Type;
  uint256 nonce;
  uint256 validSince;
  SingleEndorsementData endorsement;
}

bytes32 constant ENDORSEMENTTYPEA_TYPEHASH = keccak256("EndorsementTypeA(bytes erc5453MagicWord,uint256 erc5453Type,uint256 nonce,uint256 validSince,SingleEndorsementData endorsement)SingleEndorsementData(address endorserAddress,bytes sig)");

struct EndorsementTypeB {
  bytes erc5453MagicWord;
  uint256 erc5453Type;
  uint256 nonce;
  uint256 validSince;
  SingleEndorsementData[] endorsements;
}

bytes32 constant ENDORSEMENTTYPEB_TYPEHASH = keccak256("EndorsementTypeB(bytes erc5453MagicWord,uint256 erc5453Type,uint256 nonce,uint256 validSince,SingleEndorsementData[] endorsements)SingleEndorsementData(address endorserAddress,bytes sig)");

struct FunctionCall {
  string functionName;
  bytes functionParams;
}

bytes32 constant FUNCTIONCALL_TYPEHASH = keccak256("FunctionCall(string functionName,bytes functionParams)");

struct FunctionWithEndorsement {
  FunctionCall functionCall;
  EndorsementTypeB endorsementTypeB;
}

bytes32 constant FUNCTIONWITHENDORSEMENT_TYPEHASH = keccak256("FunctionWithEndorsement(FunctionCall functionCall,EndorsementTypeB endorsementTypeB)EndorsementTypeB(bytes erc5453MagicWord,uint256 erc5453Type,uint256 nonce,uint256 validSince,SingleEndorsementData[] endorsements)FunctionCall(string functionName,bytes functionParams)SingleEndorsementData(address endorserAddress,bytes sig)");

struct FunctionCallTransferFrom {
  address from;
  address to;
  uint256 tokenId;
}

bytes32 constant FUNCTIONCALLTRANSFERFROM_TYPEHASH = keccak256("FunctionCallTransferFrom(address from,address to,uint256 tokenId)");


contract EIP712Decoder {

  /**
  * @dev Recover signer address from a message by using their signature
  * @param hash bytes32 message, the hash is the signed message. What is recovered is the signer address.
  * @param sig bytes signature, the signature is generated using web3.eth.sign()
  */
  function recover(bytes32 hash, bytes memory sig) internal pure returns (address) {
    bytes32 r;
    bytes32 s;
    uint8 v;

    //Check the signature length
    if (sig.length != 65) {
      return (address(0));
    }

    // Divide the signature in r, s and v variables
    assembly {
      r := mload(add(sig, 32))
      s := mload(add(sig, 64))
      v := byte(0, mload(add(sig, 96)))
    }
// Version of signature should be 27 or 28, but 0 and 1 are also possible versions
    if (v < 27) {
      v += 27;
    }

    // If the version is correct return the signer address
    if (v != 27 && v != 28) {
      return (address(0));
    } else {
      return ecrecover(hash, v, r, s);
    }
  }

  function GET_EIP712DOMAIN_PACKETHASH (EIP712Domain memory _input) public pure returns (bytes32) {
    
    bytes memory encoded = abi.encode(
      EIP712DOMAIN_TYPEHASH,
      _input.name,
      _input.version,
      _input.chainId,
      _input.verifyingContract
    );
    
    return keccak256(encoded);
  }

  function GET_GENERALEXTENSIONDATASTRUCT_PACKETHASH (GeneralExtensionDataStruct memory _input) public pure returns (bytes32) {
    
    bytes memory encoded = abi.encode(
      GENERALEXTENSIONDATASTRUCT_TYPEHASH,
      keccak256(_input.erc5453MagicWord),
      _input.erc5453Type,
      _input.nonce,
      _input.validSince,
      keccak256(_input.endorsementPayload)
    );
    
    return keccak256(encoded);
  }

  function GET_SINGLEENDORSEMENTDATA_PACKETHASH (SingleEndorsementData memory _input) public pure returns (bytes32) {
    
    bytes memory encoded = abi.encode(
      SINGLEENDORSEMENTDATA_TYPEHASH,
      _input.endorserAddress,
      keccak256(_input.sig)
    );
    
    return keccak256(encoded);
  }

  function GET_ENDORSEMENTTYPEA_PACKETHASH (EndorsementTypeA memory _input) public pure returns (bytes32) {
    
    bytes memory encoded = abi.encode(
      ENDORSEMENTTYPEA_TYPEHASH,
      keccak256(_input.erc5453MagicWord),
      _input.erc5453Type,
      _input.nonce,
      _input.validSince,
      GET_SINGLEENDORSEMENTDATA_PACKETHASH(_input.endorsement)
    );
    
    return keccak256(encoded);
  }

  function GET_ENDORSEMENTTYPEB_PACKETHASH (EndorsementTypeB memory _input) public pure returns (bytes32) {
    
    bytes memory encoded = abi.encode(
      ENDORSEMENTTYPEB_TYPEHASH,
      keccak256(_input.erc5453MagicWord),
      _input.erc5453Type,
      _input.nonce,
      _input.validSince,
      GET_SINGLEENDORSEMENTDATA_ARRAY_PACKETHASH(_input.endorsements)
    );
    
    return keccak256(encoded);
  }

  function GET_SINGLEENDORSEMENTDATA_ARRAY_PACKETHASH (SingleEndorsementData[] memory _input) public pure returns (bytes32) {
    bytes memory encoded;
    for (uint i = 0; i < _input.length; i++) {
      encoded = bytes.concat(
        encoded,
        GET_SINGLEENDORSEMENTDATA_PACKETHASH(_input[i])
      );
    }
    
    bytes32 hash = keccak256(encoded);
    return hash;
  }

  function GET_FUNCTIONCALL_PACKETHASH (FunctionCall memory _input) public pure returns (bytes32) {
    
    bytes memory encoded = abi.encode(
      FUNCTIONCALL_TYPEHASH,
      _input.functionName,
      keccak256(_input.functionParams)
    );
    
    return keccak256(encoded);
  }

  function GET_FUNCTIONWITHENDORSEMENT_PACKETHASH (FunctionWithEndorsement memory _input) public pure returns (bytes32) {
    
    bytes memory encoded = abi.encode(
      FUNCTIONWITHENDORSEMENT_TYPEHASH,
      GET_FUNCTIONCALL_PACKETHASH(_input.functionCall),
      GET_ENDORSEMENTTYPEB_PACKETHASH(_input.endorsementTypeB)
    );
    
    return keccak256(encoded);
  }

  function GET_FUNCTIONCALLTRANSFERFROM_PACKETHASH (FunctionCallTransferFrom memory _input) public pure returns (bytes32) {
    
    bytes memory encoded = abi.encode(
      FUNCTIONCALLTRANSFERFROM_TYPEHASH,
      _input.from,
      _input.to,
      _input.tokenId
    );
    
    return keccak256(encoded);
  }

}


