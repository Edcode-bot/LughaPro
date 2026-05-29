export const CONTRACT_ADDRESSES = {
  celo: {
    LughaPayment: '0xFaBAC9A356C001dC3B32352e9b0f0B4D7c171B41' as `0x${string}`,
    LughaReferral: '0x385ba479dbEFcF3c4b0e5d0f778A43370c9e05B5' as `0x${string}`,
    LughaCertificate: '0x0CbE851a9E6f9aCBCC2B78Ada127001422B686af' as `0x${string}`,
    cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a' as `0x${string}`,
  }
} as const

export const CUSD_MAINNET_ADDRESS = CONTRACT_ADDRESSES.celo.cUSD

export const CUSD_ABI = [
  { type: 'function', name: 'approve', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'allowance', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'balanceOf', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'transfer', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
] as const

export const ERC20_ABI = CUSD_ABI

export const LUGHA_PAYMENT_ABI = [
  { type: 'function', name: 'purchaseContent', inputs: [{ name: 'purchaseId', type: 'bytes32' }, { name: 'creator', type: 'address' }, { name: 'contentId', type: 'bytes32' }, { name: 'amount', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'withdrawEarnings', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'hasPurchased', inputs: [{ name: 'buyer', type: 'address' }, { name: 'contentId', type: 'bytes32' }], outputs: [{ type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'getCreatorBalance', inputs: [{ name: 'creator', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'event', name: 'ContentPurchased', inputs: [{ name: 'purchaseId', type: 'bytes32', indexed: true }, { name: 'buyer', type: 'address', indexed: true }, { name: 'creator', type: 'address', indexed: true }, { name: 'contentId', type: 'bytes32' }, { name: 'amount', type: 'uint256' }] },
  { type: 'event', name: 'CreatorWithdraw', inputs: [{ name: 'creator', type: 'address', indexed: true }, { name: 'amount', type: 'uint256' }] },
] as const

export const LUGHA_REFERRAL_ABI = [
  { type: 'function', name: 'registerReferral', inputs: [{ name: 'referrer', type: 'address' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'getEarnings', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'hasBeenReferred', inputs: [{ name: '', type: 'address' }], outputs: [{ type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'triggerReferralReward', inputs: [{ name: 'newUser', type: 'address' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'event', name: 'ReferralRewarded', inputs: [{ name: 'referrer', type: 'address', indexed: true }, { name: 'referred', type: 'address', indexed: true }, { name: 'amount', type: 'uint256' }] },
] as const

export const LUGHA_CERTIFICATE_ABI = [
  { type: 'function', name: 'getStudentCertificates', inputs: [{ name: 'student', type: 'address' }], outputs: [{ type: 'uint256[]' }], stateMutability: 'view' },
  { type: 'function', name: 'getCertificate', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ components: [{ name: 'student', type: 'address' }, { name: 'courseName', type: 'string' }, { name: 'level', type: 'string' }, { name: 'creatorName', type: 'string' }, { name: 'issuedAt', type: 'uint256' }], type: 'tuple' }], stateMutability: 'view' },
  { type: 'function', name: 'totalMinted', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'mintCertificate', inputs: [{ name: 'student', type: 'address' }, { name: 'courseName', type: 'string' }, { name: 'level', type: 'string' }, { name: 'creatorName', type: 'string' }, { name: 'tokenURI', type: 'string' }], outputs: [{ type: 'uint256' }], stateMutability: 'nonpayable' },
  { type: 'event', name: 'CertificateMinted', inputs: [{ name: 'tokenId', type: 'uint256', indexed: true }, { name: 'student', type: 'address', indexed: true }, { name: 'courseName', type: 'string' }, { name: 'level', type: 'string' }] },
] as const
