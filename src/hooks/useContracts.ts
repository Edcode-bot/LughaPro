"use client";

export function useBookingEscrow() {
  return {
    createBooking: async (..._args: unknown[]) => { throw new Error('Contracts not yet deployed') },
    confirmCompletion: async (..._args: unknown[]) => { throw new Error('Contracts not yet deployed') },
    cancelBooking: async (..._args: unknown[]) => { throw new Error('Contracts not yet deployed') },
    disputeBooking: async (..._args: unknown[]) => { throw new Error('Contracts not yet deployed') },
    approveToken: async (..._args: unknown[]) => { throw new Error('Contracts not yet deployed') },
    getBooking: (..._args: unknown[]) => null,
    isLoading: false,
    error: null,
  }
}

export function useCertificates(_address?: string) {
  return {
    data: [],
    isLoading: false,
    error: null,
  }
}

export function useReferralRewards() {
  return {
    registerCode: async (..._args: unknown[]) => { throw new Error('Contracts not yet deployed') },
    claimReward: async (..._args: unknown[]) => { throw new Error('Contracts not yet deployed') },
    getEarnings: async () => BigInt(0),
    isLoading: false,
    error: null,
  }
}

export function useNativeOrCusdToken(paymentMethod: string) {
  return paymentMethod.toLowerCase() === 'cusd'
    ? '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1'
    : '0x0000000000000000000000000000000000000000'
}

export function toEscrowAmount(_price: string) {
  return BigInt(0)
}
