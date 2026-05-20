import { Abi } from 'viem'

export const CUSD_ALFAJORES_ADDRESS = '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1' as const

export const ERC20_ABI = [
  { type: 'function', name: 'approve', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'allowance', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'balanceOf', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
] as const satisfies Abi

export const BOOKING_ESCROW_ABI = [
  { type: 'constructor', inputs: [{ name: 'feeWallet', type: 'address' }, { name: 'feePercent', type: 'uint256' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'MAX_PLATFORM_FEE_PERCENT', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'cancelBooking', inputs: [{ name: 'bookingId', type: 'bytes32' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'confirmCompletion', inputs: [{ name: 'bookingId', type: 'bytes32' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'createBooking', inputs: [{ name: 'bookingId', type: 'bytes32' }, { name: 'tutor', type: 'address' }, { name: 'token', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [], stateMutability: 'payable' },
  { type: 'function', name: 'disputeBooking', inputs: [{ name: 'bookingId', type: 'bytes32' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'getBooking', inputs: [{ name: 'bookingId', type: 'bytes32' }], outputs: [{ name: '', type: 'tuple', components: [{ name: 'student', type: 'address' }, { name: 'tutor', type: 'address' }, { name: 'amount', type: 'uint256' }, { name: 'token', type: 'address' }, { name: 'status', type: 'uint8' }, { name: 'createdAt', type: 'uint256' }, { name: 'completedAt', type: 'uint256' }] }], stateMutability: 'view' },
  { type: 'function', name: 'owner', inputs: [], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'platformFeePercent', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'platformFeeWallet', inputs: [], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'renounceOwnership', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'resolveDispute', inputs: [{ name: 'bookingId', type: 'bytes32' }, { name: 'favorTutor', type: 'bool' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'setPlatformFeePercent', inputs: [{ name: 'feePercent', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'setPlatformFeeWallet', inputs: [{ name: 'feeWallet', type: 'address' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'transferOwnership', inputs: [{ name: 'newOwner', type: 'address' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'event', name: 'BookingCreated', inputs: [{ name: 'bookingId', type: 'bytes32', indexed: true }, { name: 'student', type: 'address', indexed: true }, { name: 'tutor', type: 'address', indexed: true }, { name: 'token', type: 'address', indexed: false }, { name: 'amount', type: 'uint256', indexed: false }], anonymous: false },
  { type: 'event', name: 'BookingCompleted', inputs: [{ name: 'bookingId', type: 'bytes32', indexed: true }, { name: 'student', type: 'address', indexed: true }, { name: 'tutor', type: 'address', indexed: true }, { name: 'tutorAmount', type: 'uint256', indexed: false }, { name: 'platformFee', type: 'uint256', indexed: false }], anonymous: false },
  { type: 'event', name: 'BookingCancelled', inputs: [{ name: 'bookingId', type: 'bytes32', indexed: true }, { name: 'student', type: 'address', indexed: true }, { name: 'amount', type: 'uint256', indexed: false }], anonymous: false },
  { type: 'event', name: 'BookingDisputed', inputs: [{ name: 'bookingId', type: 'bytes32', indexed: true }, { name: 'raisedBy', type: 'address', indexed: true }], anonymous: false },
  { type: 'event', name: 'DisputeResolved', inputs: [{ name: 'bookingId', type: 'bytes32', indexed: true }, { name: 'favorTutor', type: 'bool', indexed: false }], anonymous: false },
] as const satisfies Abi

export const REFERRAL_REWARDS_ABI = [
  { type: 'constructor', inputs: [{ name: 'cUSDAddress', type: 'address' }, { name: 'initialRewardAmount', type: 'uint256' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'cUSD', inputs: [], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'claimReferralReward', inputs: [{ name: 'referralCode', type: 'bytes32' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'fundRewardPool', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'getEarnings', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getReferrer', inputs: [{ name: 'code', type: 'bytes32' }], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'isReferred', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'owner', inputs: [], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'registerReferralCode', inputs: [{ name: 'code', type: 'bytes32' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'rewardAmount', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'setRewardAmount', inputs: [{ name: 'newRewardAmount', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'withdrawPool', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'event', name: 'ReferralCodeRegistered', inputs: [{ name: 'code', type: 'bytes32', indexed: true }, { name: 'referrer', type: 'address', indexed: true }], anonymous: false },
  { type: 'event', name: 'ReferralRewarded', inputs: [{ name: 'code', type: 'bytes32', indexed: true }, { name: 'referrer', type: 'address', indexed: true }, { name: 'referred', type: 'address', indexed: true }, { name: 'amount', type: 'uint256', indexed: false }], anonymous: false },
] as const satisfies Abi

export const LUGHA_CERTIFICATE_ABI = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'balanceOf', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getCertificateData', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ name: '', type: 'tuple', components: [{ name: 'studentAddress', type: 'address' }, { name: 'tutorAddress', type: 'address' }, { name: 'courseName', type: 'string' }, { name: 'completionDate', type: 'uint256' }, { name: 'hoursCompleted', type: 'uint256' }, { name: 'issuedBy', type: 'string' }] }], stateMutability: 'view' },
  { type: 'function', name: 'getCertificates', inputs: [{ name: 'student', type: 'address' }], outputs: [{ name: '', type: 'uint256[]' }], stateMutability: 'view' },
  { type: 'function', name: 'mintCertificate', inputs: [{ name: 'student', type: 'address' }, { name: 'tutor', type: 'address' }, { name: 'courseName', type: 'string' }, { name: 'hoursCompleted', type: 'uint256' }, { name: 'issuedBy', type: 'string' }, { name: 'certificateTokenURI', type: 'string' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'owner', inputs: [], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'ownerOf', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'tokenURI', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ name: '', type: 'string' }], stateMutability: 'view' },
  { type: 'event', name: 'CertificateMinted', inputs: [{ name: 'tokenId', type: 'uint256', indexed: true }, { name: 'student', type: 'address', indexed: true }, { name: 'tutor', type: 'address', indexed: true }, { name: 'courseName', type: 'string', indexed: false }, { name: 'hoursCompleted', type: 'uint256', indexed: false }], anonymous: false },
  { type: 'event', name: 'Transfer', inputs: [{ name: 'from', type: 'address', indexed: true }, { name: 'to', type: 'address', indexed: true }, { name: 'tokenId', type: 'uint256', indexed: true }], anonymous: false },
] as const satisfies Abi

export const CONTRACT_ADDRESSES = {
  alfajores: {
    BookingEscrow: '',
    ReferralRewards: '',
    LughaCertificate: '',
  },
  celo: {
    BookingEscrow: '',
    ReferralRewards: '',
    LughaCertificate: '',
  },
} as const
