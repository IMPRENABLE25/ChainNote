export const contractAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;
export const contractReady = contractAddress !== "0x0000000000000000000000000000000000000000";

export const chainNoteAbi = [
  { type: "function", name: "publish", stateMutability: "nonpayable", inputs: [{ name: "message", type: "string" }, { name: "contentHash", type: "bytes32" }, { name: "imageCid", type: "string" }], outputs: [{ name: "id", type: "uint256" }] },
  { type: "function", name: "getNote", stateMutability: "view", inputs: [{ name: "id", type: "uint256" }], outputs: [{ name: "author", type: "address" }, { name: "message", type: "string" }, { name: "contentHash", type: "bytes32" }, { name: "imageCid", type: "string" }, { name: "timestamp", type: "uint64" }] },
  { type: "function", name: "noteCount", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "event", name: "NotePublished", anonymous: false, inputs: [{ indexed: true, name: "id", type: "uint256" }, { indexed: true, name: "author", type: "address" }, { indexed: false, name: "contentHash", type: "bytes32" }, { indexed: false, name: "imageCid", type: "string" }, { indexed: false, name: "timestamp", type: "uint64" }] },
] as const;
