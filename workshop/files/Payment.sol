// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
contract WorkshopPayment {
 address private immutable implementation = address(this);
 address public owner;
 uint256 public paymentCount;
 event Paid(address indexed payer,address indexed recipient,uint256 amount);
 constructor(){owner=address(1);}
 function initialize(address who) external {require(owner==address(0),"initialized");require(who!=address(0),"owner");owner=who;}
/* COPY_FROM_CHEATSHEET
function pay(address payable recipient) external payable {
  require(address(this)!=implementation,"proxy only");
  require(msg.sender==owner,"owner only");require(msg.value>0,"amount");
  paymentCount++;(bool ok,)=recipient.call{value:msg.value}("");require(ok,"payment failed");
  emit Paid(msg.sender,recipient,msg.value);
 }
END_COPY */
}