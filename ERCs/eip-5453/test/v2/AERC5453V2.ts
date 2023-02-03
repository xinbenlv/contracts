import { loadFixture, mine } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import Ajv from 'ajv';
import { FunctionCallTransferFromStruct } from "../../typechain-types/contracts/v2/EIP712Decoder";
const ethSigUtil = require("@metamask/eth-sig-util");
const { SignTypedDataVersion, TypedDataUtils, recoverTypedSignature } = require("@metamask/eth-sig-util");
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

        it("Should generate match sigs by signTypedData with Both @metamask/eth-sig-util and @hardhat/ethers", async function () {
            let { owner, mintSender, recipient, contract } = await loadFixture(deployFixture);
            let testWallet = new ethers.Wallet(
                "0x4af1bceebf7f3634ec3cff8a2c38e51178d5d4ce585c52d6043e5e2cc3418bb0"
            );
            const privateKey = Buffer.from(
                '4af1bceebf7f3634ec3cff8a2c38e51178d5d4ce585c52d6043e5e2cc3418bb0', "hex");
            const network = await ethers.getDefaultProvider().getNetwork();

            let chainId = network.chainId;

            let domain = {
                ...typedMessage.domain,
                chainId: 1, // XXX chainId,
                verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC" // XXX contract.address,
            };
            let types = {
                FunctionCallTransferFrom: typedMessage.types.FunctionCallTransferFrom
            };
            const tokenId = ethers.utils.hexZeroPad(ethers.utils.arrayify(0x01), 32);
            let message = {
                from: owner.address,
                to: recipient.address,
                tokenId,
            };

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
                    primaryType: "FunctionCallTransferFrom"
                },
                version: version
            });


            let hash = ethers.utils.hexlify(TypedDataUtils.eip712Hash({
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
                primaryType: "FunctionCallTransferFrom"
            }, version));
            console.log(`Hash =`, hash);
            let functionCallTransferFromStruct:FunctionCallTransferFromStruct = {
                from: owner.address,
                to: recipient.address,
                tokenId,
            };
            let packetHash = await contract.GET_FUNCTIONCALLTRANSFERFROM_PACKETHASH(
                functionCallTransferFromStruct
            );
            let domainHash = await contract.getEIP712DomainHash(
                "TestERC5453V2",
                "v2",
                1, //XXX block.chainid,
                "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC", //XXX address(this)
            );
            console.log(`DomainHash TS =`, domainHash);
            let sigHash = ethers.utils.keccak256(
                ethers.utils.concat([
                    ethers.utils.toUtf8Bytes('\x19\x01'),
                    ethers.utils.arrayify(domainHash),
                    ethers.utils.arrayify(packetHash)
                ])
            );
            console.log(`sigHash TS =`, sigHash);

            console.log(`PacketHash =`, packetHash);

            let sigByHardhat = await testWallet._signTypedData(
                domain,
                types,
                message
            );
            console.log(`sigByMetaMask TS =`, sigByMetaMask);
            let recoveredAddress = recoverTypedSignature({
                signature: sigByMetaMask,
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
                    primaryType: "FunctionCallTransferFrom"
                },
                version: version
            });
            console.log(`Recovered address TS =`, recoveredAddress);
            expect(ethers.utils.getAddress(recoveredAddress))
                .to.equal(ethers.utils.getAddress(testWallet.address));

            expect(sigByMetaMask).to.equal(sigByHardhat);
            expect(await contract.verifyEndorsement(
                "transferFrom(address from,address to,tokenId)",
                owner.address,
                recipient.address,
                tokenId,
                sigByHardhat
            )).to.equal(testWallet.address);
        });

    });

});
