import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployByName } from "../utils/deployUtil";

describe("Contract", function () {
  const version: string = "0x1234";
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const { contract, tx } = await deployByName(ethers, "ERC191", [version]);

    return { contract, tx, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should complete without problem", async function () {
      await loadFixture(deployFixture);
    });

    it("Should set the right version", async function () {
      const { tx } = await loadFixture(deployFixture);
      const receipt = await tx.wait();
      let events = receipt.events.filter((x: any) => { return x.event == "ErcRefImplDeploy" });
      expect(events.length).to.equal(1);
      expect(events[0].args.version).to.equal(version);
    });
  });

  describe("Hash and Sig", function () {
    it("Should match", async function () {
        const { contract, addr1 } = await loadFixture(deployFixture);
        const destination = addr1.address;
        const value = ethers.utils.randomBytes(32);
        const dataSize = 1;
        const data = ethers.utils.randomBytes(dataSize);
        const nonce = ethers.utils.randomBytes(32);
        const hashComputedByContract = await contract.computeHash(
          destination, value, data, nonce
        );
        // const bytes = ethers.utils.concat([destination, value, data, nonce]);
        // const hashComputedByEthers = await ethers.utils.hashMessage(bytes);
        // expect(hashComputedByContract).to.equal(hashComputedByEthers);
        // const sig = await addr1.signMessage(bytes);
        // const sigSplit = ethers.utils.splitSignature(sig);
        // const hashVerified = await contract.verifyPreSigned(destination, value, data, nonce, sigSplit.v, sigSplit.r, sigSplit.s);
        // expect(hashVerified).to.equal(hashComputedByEthers);
    });

  });

});
