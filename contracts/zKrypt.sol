// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract ZkryptContract is Context, ERC20, Ownable {
    uint256 public dripAmount;
    uint256 public constant DECIMALS = 18;

    constructor(
        uint256 _initialSupply, 
        uint256 _initialDripAmount
    ) ERC20("Zkrypt Token", "ZKT") Ownable(_msgSender()) {
        _mint(_msgSender(), _initialSupply * 10**DECIMALS);
        dripAmount = _initialDripAmount * 10**DECIMALS;
    }

    // Frontend compatibility functions
    function standard() public pure returns (string memory) {
        return "ERC-20";
    }

    function ownerOfContract() public view returns (address) {
        return owner();
    }
    
    function getTokenHolder() public view returns (address) {
        return owner();
    }
    
    function _userId() public view returns (address) {
        return owner();
    }
    
    function setDripAmount(uint256 _newDripAmount) public onlyOwner {
        dripAmount = _newDripAmount * 10**DECIMALS;
    }

    // FIXED FAUCET: Contract holds its own tokens for distribution
    function requestTokens() public {
        require(balanceOf(address(this)) >= dripAmount, "Faucet: Insufficient contract balance");
        _transfer(address(this), _msgSender(), dripAmount);
    }

    // Owner funding function - send tokens directly to contract
    function fundFaucet(uint256 amount) public onlyOwner {
        _transfer(_msgSender(), address(this), amount);
    }

    // Emergency withdrawal for owner
    function withdrawTokens(uint256 amount) public onlyOwner {
        _transfer(address(this), _msgSender(), amount);
    }
}