// SPDX-License-Identifier: Apache-2.0 OR MIT OR BSD OR CC0-1.0 OR Unlicense
// Author: Zainan Victor Zhou <zzn-ercref@zzn.im>
// Visit our open source repo: http://zzn.li/ercref

pragma solidity ^0.8.17;

abstract contract AERC191 {

    function computeHash(
        address destination,
        uint value,
        bytes calldata data,
        uint nonce
    ) external view returns (bytes32 resultHash) {
        return _computeHash(destination, value, data, nonce);
    }
    // The computation as origianlly documented in
    // EIP-191 https://eips.ethereum.org/EIPS/eip-191
    function _computeHash(
        address destination,
        uint value,
        bytes calldata data,
        uint nonce
    ) internal view returns (bytes32 result) {
        // Arguments when calculating hash to validate
        // 1: byte(0x19) - the initial 0x19 byte
        // 2: byte(0) - the version byte
        // 3: this - the validator address
        // 4-7 : Application specific data
        return keccak256(
            abi.encodePacked(
                bytes1(0x19),
                bytes1(0),
                address(this),
                destination,
                value,
                data,
                nonce
            )
        );
    }
}
