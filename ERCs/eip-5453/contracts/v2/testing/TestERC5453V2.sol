// SPDX-License-Identifier: Apache-2.0
// Author: Zainan Victor Zhou <zzn-ercref@zzn.im>

pragma solidity ^0.8.9;

import "../AERC5453V2.sol";

contract TestERC5453V2 is AERC5453EndorsibleV2 {
    constructor() AERC5453EndorsibleV2("TestERC5453V2", "v2") {
    }
}
