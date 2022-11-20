
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployByName } from "../utils/deployUtil";

describe("Contract", function () {

  describe("ERC5679", function () {

    const version: string = "0x1234";
    it("Should match", async function () {
        const { contract } = await deployByName(ethers, "ERC165Report", []);
        expect(await contract.get165("IERC5679Ext20")).to.equal("0xd0017968");
        expect(await contract.get165("IERC5679Ext721")).to.equal("0xcce39764");
        expect(await contract.get165("IERC5679Ext1155")).to.equal("0xf4cedd5a");
    });
    it("Extending ERC20", async function () {
        const { contract } = await deployByName(ethers, "MintableAndBurnableERC20", []);
        // TODO add more tests
    });
    it("Should match ERC5679Ext721", async function () {
        const { contract } = await deployByName(ethers, "MintableAndBurnableERC721", []);
        // TODO add more tests
    });
    it("Should match ERC5679Ext1155", async function () {
        const { contract } = await deployByName(ethers, "MintableAndBurnableERC1155", []);
        // TODO add more tests
    });

  });

});
