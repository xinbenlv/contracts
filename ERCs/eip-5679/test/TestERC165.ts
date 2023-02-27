
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployByName } from "../utils/deployUtil";

describe("Contract", function () {

  describe("EIP-165 Identifier", function () {

    const version: string = "0x1234";
    it("Should match", async function () {
        const { contract } = await deployByName(ethers, "ERC165Report", []);
        expect(await contract.get165("IERC5679Ext20")).to.equal("0xd0017968");
        expect(await contract.get165("IERC5679Ext721")).to.equal("0xcce39764");
        expect(await contract.get165("IERC5679Ext1155")).to.equal("0x41809e3e");
    });
    it("Should match ERC5679Ext20RefImpl", async function () {
        const { contract } = await deployByName(ethers, "ERC5679Ext20RefImpl", [version]);
        expect(await contract.supportsInterface("0xd0017968")).to.be.true;
    });
    it("Should match ERC5679Ext721RefImpl", async function () {
        const { contract } = await deployByName(ethers, "ERC5679Ext721RefImpl", [version]);
        expect(await contract.supportsInterface("0xcce39764")).to.be.true;
    });
    it("Should match ERC5679Ext1155RefImpl", async function () {
        const { contract } = await deployByName(ethers, "ERC5679Ext1155RefImpl", [version]);
        expect(await contract.supportsInterface("0x41809e3e")).to.be.true;
    });

  });

});
