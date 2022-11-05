// SPDX-License-Identifier: Apache-2.0 OR MIT OR BSD OR CC0-1.0 OR Unlicense
// Author: Zainan Victor Zhou <zzn-ercref@zzn.im>
// Visit our open source repo: http://zzn.li/ercref

pragma solidity ^0.8.17;

import "./AERC191.sol";

contract ERC191 is AERC191 {
    event ErcRefImplDeploy(uint256 version, string name, string url);

    constructor(uint256 _version)
    {
        emit ErcRefImplDeploy(
            _version,
            "ERC191",
            "http://zzn.li/ercref"
        );
    }
    // @dev A function verifies the signature of a transaction
    // Note: the method name `submitTransactionPreSigned` name comes from
    //      EIP-191 https://eips.ethereum.org/EIPS/eip-191
    function verifyPreSigned(
        address destination,
        uint value,
        bytes calldata data,
        uint nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external view returns (bytes32 resultHash) {
        resultHash = _computeHash(destination, value, data, nonce);
        require(ecrecover(resultHash, v, r, s) == msg.sender);
        return resultHash;
    }
}
