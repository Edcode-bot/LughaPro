export const CONTRACT_ADDRESSES = {
  celo: {
    LughaPayment: '0xFaBAC9A356C001dC3B32352e9b0f0B4D7c171B41' as `0x${string}`,
    LughaPaymentV2: '0x99e6eaf7952b9c45658C69f0999Ac8503989B003' as `0x${string}`,
    LughaReferral: '0x0EBD10ce94576D523Dcb13BA3b4Fb48d4a49b221' as `0x${string}`,
    LughaCertificate: '0xcc908CF79314335BAd128dEBfA929B6E99c94F7F' as `0x${string}`,
    cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a' as `0x${string}`,
    USDT: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e' as `0x${string}`,
  }
} as const

export const CUSD_MAINNET_ADDRESS = CONTRACT_ADDRESSES.celo.cUSD
export const USDT_MAINNET_ADDRESS = CONTRACT_ADDRESSES.celo.USDT

export const CUSD_ABI = [
  { type: 'function', name: 'approve', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'allowance', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'balanceOf', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'transfer', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
] as const

export const ERC20_ABI = CUSD_ABI
export const USDT_ABI = CUSD_ABI

export const LUGHA_PAYMENT_ABI = [
  { type: 'function', name: 'purchaseContent', inputs: [{ name: 'purchaseId', type: 'bytes32' }, { name: 'creator', type: 'address' }, { name: 'contentId', type: 'bytes32' }, { name: 'amount', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'withdrawEarnings', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'hasPurchased', inputs: [{ name: 'buyer', type: 'address' }, { name: 'contentId', type: 'bytes32' }], outputs: [{ type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'getCreatorBalance', inputs: [{ name: 'creator', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'event', name: 'ContentPurchased', inputs: [{ name: 'purchaseId', type: 'bytes32', indexed: true }, { name: 'buyer', type: 'address', indexed: true }, { name: 'creator', type: 'address', indexed: true }, { name: 'contentId', type: 'bytes32' }, { name: 'amount', type: 'uint256' }] },
  { type: 'event', name: 'CreatorWithdraw', inputs: [{ name: 'creator', type: 'address', indexed: true }, { name: 'amount', type: 'uint256' }] },
] as const

export const LUGHA_PAYMENT_V2_ABI = [
  { type: 'function', name: 'purchaseWithToken', inputs: [
    { name: 'purchaseId', type: 'bytes32' },
    { name: 'creator', type: 'address' },
    { name: 'contentId', type: 'bytes32' },
    { name: 'amount', type: 'uint256' },
    { name: 'token', type: 'address' }
  ], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'purchaseWithCELO', inputs: [
    { name: 'purchaseId', type: 'bytes32' },
    { name: 'creator', type: 'address' },
    { name: 'contentId', type: 'bytes32' }
  ], outputs: [], stateMutability: 'payable' },
  { type: 'function', name: 'withdrawTokenEarnings', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'withdrawCeloEarnings', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'hasPurchased', inputs: [
    { name: 'buyer', type: 'address' },
    { name: 'contentId', type: 'bytes32' }
  ], outputs: [{ type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'getCreatorTokenBalance', inputs: [{ name: 'creator', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getCreatorCeloBalance', inputs: [{ name: 'creator', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'event', name: 'ContentPurchased', inputs: [
    { name: 'purchaseId', type: 'bytes32', indexed: true },
    { name: 'buyer', type: 'address', indexed: true },
    { name: 'creator', type: 'address', indexed: true },
    { name: 'contentId', type: 'bytes32' },
    { name: 'amount', type: 'uint256' },
    { name: 'token', type: 'address' }
  ]},
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
