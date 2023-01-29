// SPDX-License-Identifier: Apache-2.0
// Author: Zainan Victor Zhou <zzn-ercref@zzn.im>
// See the full hardhat project in
pragma solidity ^0.8.9;

interface IERC5453EndorsementCore {
    function eip5453Nonce(address endorser) external view returns (uint256);
    function isEligibleEndorser(address endorser) external view returns (bool);
}

interface IERC5453EndorsementDigest {
    function computeValidityDigest(
        bytes32 _functionParamStructHash,
        uint256 _validSince,
        uint256 _validBy,
        uint256 _nonce
    ) external view returns (bytes32);

    function computeFunctionParamHash(
        string memory _functionName,
        bytes memory _functionParamPacked
    ) external view returns (bytes32);
}

interface IERC5453EndorsementDataTypeA {
    function computeExtensionDataTypeA(
        uint256 nonce,
        uint256 validSince,
        uint256 validBy,
        address endorserAddress,
        bytes calldata sig
    ) external view returns (bytes memory);
}


interface IERC5453EndorsementDataTypeB {
    function computeExtensionDataTypeB(
        uint256 nonce,
        uint256 validSince,
        uint256 validBy,
        address[] calldata endorserAddress,
        bytes[] calldata sigs
    ) external view returns (bytes memory);
}
