pragma solidity ^0.7.0;

import "./ENS.sol";

/**
 * A registrar that allocates subdomains to the first person to claim them,
 * and allow this person to re-register them to someone else.
 */
contract SimpleRegistry {

    ENS public ens;
    bytes32 public rootNode;
    mapping (bytes32 => uint) public expiryTimes;

    /**
     * Constructor.
     * @param ensAddr The address of the ENS registry.
     * @param node The node that this registrar administers.
     */
    constructor(ENS ensAddr, bytes32 node) public {
        ens = ensAddr;
        rootNode = node;
    }

    /**
     * Register a name that's not currently registered
     * @param label The hash of the label to register.
     * @param owner The address of the new owner.
     */
    function register(bytes32 label, address owner) public {
        require(ens.owner(keccak256(abi.encodePacked(rootNode, label))) == address(0));
        ens.setSubnodeOwner(rootNode, label, owner);
    }

        /**
     * Register a name that's not currently registered
     * @param label The hash of the label to register.
     * @param owner The address of the new owner.
     */
    function unregister(bytes32 label) public {
        require(ens.owner(keccak256(abi.encodePacked(rootNode, label))) == address(0));
        ens.setSubnodeOwner(rootNode, label, address(0));
    }
}
