// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract ZkryptContract is Context, ERC20, Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    uint256 public dripAmount;
    EnumerableSet.AddressSet private _holders;

    constructor(
        uint256 _initialSupply, 
        uint256 _initialDripAmount
    ) ERC20("Zkrypt Token", "ZKT") Ownable(_msgSender()) {
        _mint(_msgSender(), _initialSupply); 
        dripAmount = _initialDripAmount;
        _holders.add(_msgSender());
    }

    // ✅ AUTOMATIC HOLDER TRACKING - Called on EVERY transfer/mint/burn
    function _update(address from, address to, uint256 value) internal virtual override {
        super._update(from, to, value);
        
        // Remove sender if balance becomes 0
        if (from != address(0) && balanceOf(from) == 0) {
            _holders.remove(from);
        }
        // Add receiver if they have balance > 0
        if (to != address(0) && balanceOf(to) > 0 && !_holders.contains(to)) {
            _holders.add(to);
        }
    }

    // Returns ALL holders automatically tracked
    function getTokenHolder() public view returns (address[] memory) {
        return _holders.values();
    }

    // Frontend required functions - UNCHANGED
    function standard() public pure returns (string memory) {
        return "ERC-20";
    }

    function ownerOfContract() public view returns (address) {
        return owner();
    }

    function _userId() public view returns (address) {
        return owner();
    }

    function setDripAmount(uint256 _newDripAmount) public onlyOwner {
        dripAmount = _newDripAmount;
    }

    function requestTokens() public {
        address faucetSource = owner();
        require(balanceOf(faucetSource) >= dripAmount, "Faucet owner balance insufficient");
        _transfer(faucetSource, _msgSender(), dripAmount);
    }
}