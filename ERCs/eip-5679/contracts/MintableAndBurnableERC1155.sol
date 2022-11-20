// SPDX-License-Identifier: Apache-2.0
// Author: Zainan Victor Zhou <zzn-ercref@zzn.im>
// Open source repo: http://zzn.li/ercref

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./AERC5679.sol";

contract MintableAndBurnableERC1155 is ERC5679Ext1155, ERC1155 {
    event ErcRefImplDeploy(uint256 version, string name, string url);
    uint256 constant version = 0x02;
    constructor() ERC1155("") {
        emit ErcRefImplDeploy(version, "MintableAndBurnableERC1155", "http://zzn.li/ercref");
    }
    function safeMint(
        address _to,
        uint256 _id,
        uint256 _amount,
        bytes calldata _data
    ) external override {
        _mint(_to, _id, _amount, _data);
    }

    function safeMintBatch(
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata data
    ) external override {
        _mintBatch(to, ids, amounts, data);
    }

    function burn(
        address _from,
        uint256 _id,
        uint256 _amount,
        bytes[] calldata // _data (unused)
    ) external override {
        _burn(_from, _id, _amount);
    }

    function burnBatch(
        address _from,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata // _data (unused)
    ) external override {
        _burnBatch(_from, ids, amounts);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC5679Ext1155, ERC1155)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
