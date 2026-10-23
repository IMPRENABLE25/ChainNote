// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ChainNote
/// @notice Stores public, timestamped notes and their SHA-256 content fingerprints.
/// @author ZAJ
contract ChainNote {
    uint256 public constant MAX_MESSAGE_BYTES = 2_000;

    struct Note {
        address author;
        string message;
        bytes32 contentHash;
        string imageCid;
        uint64 timestamp;
    }

    uint256 public noteCount;
    mapping(uint256 id => Note) private notes;

    event NotePublished(
        uint256 indexed id,
        address indexed author,
        bytes32 contentHash,
        string imageCid,
        uint64 timestamp
    );

    error EmptyMessage();
    error MessageTooLong(uint256 supplied, uint256 maximum);
    error EmptyContentHash();
    error ContentHashMismatch();

    /// @dev SHA-256 is calculated over the exact UTF-8 bytes stored in `message`.
    /// Anyone can recompute the digest without relying on a text normalization rule.
    function publish(string calldata message, bytes32 contentHash, string calldata imageCid)
        external
        returns (uint256 id)
    {
        bytes memory messageBytes = bytes(message);
        if (messageBytes.length == 0) revert EmptyMessage();
        if (messageBytes.length > MAX_MESSAGE_BYTES) {
            revert MessageTooLong(messageBytes.length, MAX_MESSAGE_BYTES);
        }
        if (contentHash == bytes32(0)) revert EmptyContentHash();
        if (sha256(messageBytes) != contentHash) revert ContentHashMismatch();

        id = ++noteCount;
        uint64 timestamp = uint64(block.timestamp);
        notes[id] = Note(msg.sender, message, contentHash, imageCid, timestamp);
        emit NotePublished(id, msg.sender, contentHash, imageCid, timestamp);
    }

    function getNote(uint256 id)
        external
        view
        returns (address author, string memory message, bytes32 contentHash, string memory imageCid, uint64 timestamp)
    {
        Note storage note = notes[id];
        if (note.author == address(0)) revert EmptyMessage();
        return (note.author, note.message, note.contentHash, note.imageCid, note.timestamp);
    }
}
