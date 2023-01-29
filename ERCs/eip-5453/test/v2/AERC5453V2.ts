import { loadFixture, mine } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import Ajv from 'ajv';
// const ethSigUtil = require('@metamask/eth-sig-util');
const typedMessage = require("../../utils/endorsement-types");

export const TYPED_MESSAGE_SCHEMA = {
    type: 'object',
    properties: {
        types: {
            type: 'object',
            additionalProperties: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        type: { type: 'string' },
                    },
                    required: ['name', 'type'],
                },
            },
        },
        primaryType: { type: 'string' },
        domain: { type: 'object' },
        message: { type: 'object' },
    },
    required: ['types', 'primaryType', 'domain', 'message'],
};

/**
 * Validate the given message with the typed message schema.
 *
 * @param typedMessage - The typed message to validate.
 * @returns Whether the message is valid.
 */
function validateTypedMessageSchema(
    typedMessage: Record<string, unknown>,
): boolean {
    const ajv = new Ajv();
    const validate = ajv.compile(TYPED_MESSAGE_SCHEMA);
    return validate(typedMessage);
}
describe("AERC5453V2", function () {
    async function deployFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, mintSender, recipient] = await ethers.getSigners();
        const Factory = await ethers.getContractFactory("TestERC5453V2");
        const contract = await Factory.deploy();
        return { owner, mintSender, recipient, contract };
    }

    describe("Deployment", function () {
        it("Should validate schema", async function () {
            const typedMessage1 = {
                ...typedMessage, message: {
                    from: "0x0000000000000000000000000000000000000000",
                    to: "0x0000000000000000000000000000000000000000",
                    tokenId: 1,
                }
            };
            expect(validateTypedMessageSchema(typedMessage1)).to.be.true;

        });

        it("Should works with SignTypedDataX", async function () {

            let { owner, mintSender, recipient, contract } = await loadFixture(deployFixture);
            // Sign typed data
            let domain = {
                ...typedMessage.domain,
                verifyingContract: contract.address,
            };
            let types = {
                FunctionCallTransferFrom: typedMessage.types.FunctionCallTransferFrom
            };
            let value = {
                from: owner.address,
                to: recipient.address,
                tokenId: ethers.utils.hexZeroPad(ethers.utils.arrayify(0x01), 32)
            }
            console.log(`Domain`, domain);
            console.log(`Types`, types);
            console.log(`Value`, value);
            let newWallet = new ethers.Wallet(
                "0x4af1bceebf7f3634ec3cff8a2c38e51178d5d4ce585c52d6043e5e2cc3418bb0"
            );
            let sig2 = await owner._signTypedData(
                domain,
                types,
                value
            );
            console.log(`Sig2 =`, sig2);
            console.log(`Signer address = `, owner.address);
            console.log(`Recovered address = `, await contract.verifyEndorsement(
                "transferFrom(address from,address to,tokenId)",
                owner.address,
                recipient.address,
                ethers.utils.hexZeroPad(ethers.utils.arrayify(0x01), 32),
                sig2
            ));
        });

        it("Should signTypedData with Both @metamask/eth-sig-util and @hardhat/ethers", async function () {
            const network = await ethers.getDefaultProvider().getNetwork();
            console.log("Network name=", network.name);
            console.log("Network chain id=", network.chainId);
            let chainId = network.chainId;
            const ethSigUtil = require("@metamask/eth-sig-util");
            const { SignTypedDataVersion } = require("@metamask/eth-sig-util");

            let { owner, mintSender, recipient, contract } = await loadFixture(deployFixture);
            // Sign typed data
            let domain = {
                ...typedMessage.domain,
                chainId,
                verifyingContract: contract.address,
            };
            let types = {
                TransferWithAuthorization: [
                    { name: "from", type: "address" },
                    { name: "to", type: "address" },
                    { name: "value", type: "uint256" },
                    { name: "validAfter", type: "uint256" },
                    { name: "validBefore", type: "uint256" },
                    { name: "nonce", type: "bytes32" }
                ]
            };
            const amount = 1000000;
            const validAfter = 0;
            const validBefore = Math.floor(Date.now() / 1000) + 3600;
            const nonce = ethers.utils.hexZeroPad(ethers.utils.arrayify(0x01), 32);
            let message = {
                from: owner.address,
                to: recipient.address,
                value: amount,
                validAfter: validAfter,
                validBefore: validBefore,
                nonce: nonce
            };
            let newWallet = new ethers.Wallet(
                "0x4af1bceebf7f3634ec3cff8a2c38e51178d5d4ce585c52d6043e5e2cc3418bb0"
            );
            const privateKey = Buffer.from(
                '4af1bceebf7f3634ec3cff8a2c38e51178d5d4ce585c52d6043e5e2cc3418bb0', "hex");
            let version = SignTypedDataVersion.V4;

            const sigByMetaMask = ethSigUtil.signTypedData({
                privateKey: privateKey,
                data: {
                    domain,
                    types: { ...types,
                        EIP712Domain: [
                            { name: 'name', type: 'string' },
                            { name: 'version', type: 'string' },
                            { name: 'chainId', type: 'uint256' },
                            { name: 'verifyingContract', type: 'address' },
                        ]
                    } ,
                    message,
                    primaryType: "TransferWithAuthorization"
                },
                version: version
            });

            let sigByHardhat = await newWallet._signTypedData(
                domain,
                types,
                message
            );
            expect(sigByMetaMask).to.equal(sigByHardhat);
        });

    });

});
