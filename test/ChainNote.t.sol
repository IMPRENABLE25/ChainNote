// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../contracts/ChainNote.sol";

contract ChainNoteTest {
    ChainNote private note;

    function setUp() public { note = new ChainNote(); }

    function testPublishAndRead() public {
        bytes32 digest = sha256(bytes("bonjour"));
        uint256 id = note.publish("bonjour", digest, "bafy-image");
        require(id == 1, "first ID should be one");
        (address author, string memory message, bytes32 storedHash, string memory cid, uint64 timestamp) = note.getNote(id);
        require(author == address(this), "wrong author");
        require(keccak256(bytes(message)) == keccak256(bytes("bonjour")), "wrong message");
        require(storedHash == digest, "wrong hash");
        require(keccak256(bytes(cid)) == keccak256(bytes("bafy-image")), "wrong CID");
        require(timestamp > 0, "missing timestamp");
    }

    function testCountIncrements() public {
        note.publish("one", sha256(bytes("one")), "");
        note.publish("two", sha256(bytes("two")), "");
        require(note.noteCount() == 2, "count should increment");
    }

    function testRejectsEmptyMessage() public {
        (bool ok,) = address(note).call(abi.encodeCall(note.publish, ("", sha256(bytes("")), "")));
        require(!ok, "empty note accepted");
    }

    function testRejectsOversizedMessage() public {
        bytes memory longMessage = new bytes(note.MAX_MESSAGE_BYTES() + 1);
        (bool ok,) = address(note).call(abi.encodeCall(note.publish, (string(longMessage), sha256(longMessage), "")));
        require(!ok, "oversized note accepted");
    }
}
