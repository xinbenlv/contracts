//
const typedMessage = {
    primaryType: 'GeneralExtensionDataStruct',
    domain: {
      name: 'TestERC5453V2',
      version: '1',
    },

    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      GeneralExtensionDataStruct: [
        { name: 'erc5453MagicWord', type: 'bytes' },
        { name: 'erc5453Type', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'validSince', type: 'uint256' },
        { name: 'endorsementPayload', type: 'bytes' },
      ],
      SingleEndorsementData: [
        { name: 'endorserAddress', type: 'address' },
        { name: 'sig', type: 'bytes' },
      ],
      EndorsementTypeA: [
        { name: 'erc5453MagicWord', type: 'bytes' },
        { name: 'erc5453Type', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'validSince', type: 'uint256' },
        { name: 'endorsement', type: 'SingleEndorsementData' },
      ],
      EndorsementTypeB: [
        { name: 'erc5453MagicWord', type: 'bytes' },
        { name: 'erc5453Type', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'validSince', type: 'uint256' },
        { name: 'endorsements', type: 'SingleEndorsementData[]' },
      ],
      FunctionCall: [
        { name: 'functionName', type: 'string' },
        { name: 'functionParams', type: 'bytes' },
      ],
      FunctionWithEndorsement: [
        { name: 'functionCall', type: 'FunctionCall' },
        { name: 'endorsementTypeB', type: 'EndorsementTypeB' },
      ],
      FunctionCallTransferFrom: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'tokenId', type: 'uint256' },
      ]
     }
  };

  module.exports = typedMessage;
