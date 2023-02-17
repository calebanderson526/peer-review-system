//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./ERC20.sol";

//  ___________________________________________________________________
// |  THIS CONTRACT IS A BASIC ERC 20 TOKEN TO USE IN HARDHAT TESTING  |
// |___________________________________________________________________|

contract TestToken is ERC20 {
    uint constant _initial_supply = 100 * (10**18);
    constructor() ERC20("TestToken", "T3ST") {
        _mint(msg.sender, _initial_supply);
    }
}