// SPDX-License-Identifier: Apache-2.0
// Author: Zainan Victor Zhou <zzn-ercref@zzn.im>

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
// import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "./IERC5453.sol";
import "./EIP712Decoder.sol";

// add hardhat log
import "hardhat/console.sol";

abstract contract AERC5453EndorsibleV2 is
    EIP712Decoder
    // ,
    // IERC5453EndorsementCore,
    // IERC5453EndorsementDigest,
    // IERC5453EndorsementDataTypeA,
    // IERC5453EndorsementDataTypeB
{
    bytes32 public immutable domainHash;

    constructor(string memory contractName, string memory version) {
        domainHash = getEIP712DomainHash(
            contractName,
            version,
            1, //XXX block.chainid,
            address(0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC) //XXX address(this)
        );
        console.log("XXX sol log domainHash BEGIN --- ");
        console.logBytes32(domainHash);
        console.log("XXX sol log domainHash END --- ");
    }

    function getEIP712DomainHash(
        string memory contractName,
        string memory version,
        uint256 chainId,
        address verifyingContract
    ) public pure returns (bytes32) {
        bytes memory encoded = abi.encode(
            EIP712DOMAIN_TYPEHASH,
            keccak256(bytes(contractName)),
            keccak256(bytes(version)),
            chainId,
            verifyingContract
        );
        return keccak256(encoded);
    }

    function verifyEndorsement(
        string memory functionName,
        address from,
        address to,
        uint256 tokenId,
        bytes memory signature
    ) public view returns (address) {
        require(
            signature.length == 65,
            "AERC5453Endorsible: wrong signature length"
        );
        require(
            keccak256(abi.encodePacked(functionName)) ==
                keccak256(
                    abi.encodePacked(
                        "transferFrom(address from,address to,tokenId)"
                    )
                ),
            "AERC5453Endorsible: wrong function name"
        );
        // Break out the struct that was signed:
        FunctionCallTransferFrom
            memory functionCallTransferFrom = FunctionCallTransferFrom({
                from: from,
                to: to,
                tokenId: tokenId
            });

        // Get the top-level hash of that struct, as defined just below:
        bytes32 sigHash = getFunctionCallTransferFromTypedDataHash(
            functionCallTransferFrom
        );
        
        console.log("XXX sol log sigHash BEGIN --- ");
        console.logBytes32(sigHash);
        console.log("XXX sol log sigHash END --- ");

        console.log("XXX sol log signature BEGIN --- ");
        console.logBytes(signature);
        console.log("XXX sol log signature END --- ");

        // The `recover` method comes from the codegen, and will be able to recover from this:
        address recoveredSignatureSigner = recover(sigHash, signature);

        console.log("XXX sol log recoveredSignatureSigner BEGIN --- ");
        console.logAddress(recoveredSignatureSigner);
        console.log("XXX sol log recoveredSignatureSigner END --- ");

        return recoveredSignatureSigner;
    }

    function getFunctionCallTransferFromTypedDataHash(
        FunctionCallTransferFrom memory functionCallTransferFrom
    ) public view returns (bytes32) {
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                // The domainHash is derived from your contract name and address above:
                domainHash,
                // This last part is calling one of the generated methods.
                // It must match the name of the struct that is the `primaryType` of this signature.
                GET_FUNCTIONCALLTRANSFERFROM_PACKETHASH(
                    functionCallTransferFrom
                )
            )
        );
        return digest;
    }
}
