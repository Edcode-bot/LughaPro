export function celoscanTx(hash: string) {
  return `https://celoscan.io/tx/${hash}`
}

export function celoscanAddress(address: string) {
  return `https://celoscan.io/address/${address}`
}

export function celoscanNft(contract: string, tokenId: string | number) {
  return `https://celoscan.io/nft/${contract}/${tokenId}`
}

export function truncateTx(hash: string) {
  return hash.length > 12 ? `${hash.slice(0, 8)}…${hash.slice(-6)}` : hash
}
