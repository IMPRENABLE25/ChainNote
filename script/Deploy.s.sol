// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../contracts/ChainNote.sol";

interface Vm { function startBroadcast() external; function stopBroadcast() external; }

contract DeployScript {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    function run() external returns (ChainNote deployed) {
        vm.startBroadcast();
        deployed = new ChainNote();
        vm.stopBroadcast();
    }
}
