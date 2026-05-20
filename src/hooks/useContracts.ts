"use client";

import { useCallback, useMemo, useState } from "react";
import { Address, Hash, Hex, parseEther } from "viem";
import { celo, celoAlfajores } from "wagmi/chains";
import { useAccount, useChainId, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { BOOKING_ESCROW_ABI, CONTRACT_ADDRESSES, CUSD_ALFAJORES_ADDRESS, ERC20_ABI, LUGHA_CERTIFICATE_ABI, REFERRAL_REWARDS_ABI } from "@/lib/contracts";

type ContractNetwork = "alfajores" | "celo";
type BookingTuple = readonly [Address, Address, bigint, Address, number, bigint, bigint];

type CertificateData = readonly [Address, Address, string, bigint, bigint, string];

function activeNetwork(chainId?: number): ContractNetwork {
  return chainId === celo.id ? "celo" : "alfajores";
}

function asAddress(value: string): Address {
  return value as Address;
}

function getAddress(network: ContractNetwork, name: keyof typeof CONTRACT_ADDRESSES.alfajores) {
  const address = CONTRACT_ADDRESSES[network][name];
  return address ? asAddress(address) : undefined;
}

export function getConfiguredContractAddress(name: keyof typeof CONTRACT_ADDRESSES.alfajores, chainId?: number) {
  return getAddress(activeNetwork(chainId), name);
}

export function useBookingEscrow() {
  const chainId = useChainId();
  const network = activeNetwork(chainId);
  const address = getAddress(network, "BookingEscrow");
  const { writeContractAsync, isPending, error } = useWriteContract();
  const [lastHash, setLastHash] = useState<Hash | undefined>();
  const receipt = useWaitForTransactionReceipt({ hash: lastHash });

  const createBooking = useCallback(async (bookingId: Hex, tutorAddress: Address, token: Address, amount: bigint) => {
    if (!address) throw new Error("BookingEscrow contract address is not configured");
    const hash = await writeContractAsync({
      address,
      abi: BOOKING_ESCROW_ABI,
      functionName: "createBooking",
      args: [bookingId, tutorAddress, token, amount],
      value: token === "0x0000000000000000000000000000000000000000" ? amount : 0n,
    });
    setLastHash(hash);
    return hash;
  }, [address, writeContractAsync]);

  const confirmCompletion = useCallback(async (bookingId: Hex) => {
    if (!address) throw new Error("BookingEscrow contract address is not configured");
    const hash = await writeContractAsync({ address, abi: BOOKING_ESCROW_ABI, functionName: "confirmCompletion", args: [bookingId] });
    setLastHash(hash);
    return hash;
  }, [address, writeContractAsync]);

  const cancelBooking = useCallback(async (bookingId: Hex) => {
    if (!address) throw new Error("BookingEscrow contract address is not configured");
    const hash = await writeContractAsync({ address, abi: BOOKING_ESCROW_ABI, functionName: "cancelBooking", args: [bookingId] });
    setLastHash(hash);
    return hash;
  }, [address, writeContractAsync]);

  const disputeBooking = useCallback(async (bookingId: Hex) => {
    if (!address) throw new Error("BookingEscrow contract address is not configured");
    const hash = await writeContractAsync({ address, abi: BOOKING_ESCROW_ABI, functionName: "disputeBooking", args: [bookingId] });
    setLastHash(hash);
    return hash;
  }, [address, writeContractAsync]);

  const approveToken = useCallback(async (token: Address, amount: bigint) => {
    if (!address) throw new Error("BookingEscrow contract address is not configured");
    const hash = await writeContractAsync({ address: token, abi: ERC20_ABI, functionName: "approve", args: [address, amount] });
    setLastHash(hash);
    return hash;
  }, [address, writeContractAsync]);

  const getBooking = useCallback((bookingId: Hex) => ({ address, abi: BOOKING_ESCROW_ABI, functionName: "getBooking" as const, args: [bookingId] }), [address]);

  return {
    createBooking,
    approveToken,
    confirmCompletion,
    cancelBooking,
    disputeBooking,
    getBooking,
    isLoading: isPending || receipt.isLoading,
    error: error ?? receipt.error,
    transactionHash: lastHash,
    receipt: receipt.data,
  };
}

export function useReferralRewards(user?: Address) {
  const chainId = useChainId();
  const network = activeNetwork(chainId);
  const address = getAddress(network, "ReferralRewards");
  const { writeContractAsync, isPending, error } = useWriteContract();
  const earnings = useReadContract({ address, abi: REFERRAL_REWARDS_ABI, functionName: "getEarnings", args: user ? [user] : undefined, query: { enabled: Boolean(address && user) } });

  const registerCode = useCallback(async (code: Hex) => {
    if (!address) throw new Error("ReferralRewards contract address is not configured");
    return writeContractAsync({ address, abi: REFERRAL_REWARDS_ABI, functionName: "registerReferralCode", args: [code] });
  }, [address, writeContractAsync]);

  const claimReward = useCallback(async (code: Hex) => {
    if (!address) throw new Error("ReferralRewards contract address is not configured");
    return writeContractAsync({ address, abi: REFERRAL_REWARDS_ABI, functionName: "claimReferralReward", args: [code] });
  }, [address, writeContractAsync]);

  return {
    registerCode,
    claimReward,
    getEarnings: earnings.data ?? 0n,
    isLoading: isPending || earnings.isLoading,
    error: error ?? earnings.error,
  };
}

export function useCertificates(student?: Address) {
  const chainId = useChainId();
  const network = activeNetwork(chainId);
  const address = getAddress(network, "LughaCertificate");
  const { address: account } = useAccount();
  const { writeContractAsync, isPending, error } = useWriteContract();
  const certificates = useReadContract({ address, abi: LUGHA_CERTIFICATE_ABI, functionName: "getCertificates", args: student ? [student] : undefined, query: { enabled: Boolean(address && student) } });

  const mintCertificate = useCallback(async (studentAddress: Address, tutorAddress: Address, courseName: string, hours: bigint, issuedBy: string, tokenURI: string) => {
    if (!address) throw new Error("LughaCertificate contract address is not configured");
    return writeContractAsync({
      address,
      abi: LUGHA_CERTIFICATE_ABI,
      functionName: "mintCertificate",
      args: [studentAddress, tutorAddress, courseName, hours, issuedBy, tokenURI],
    });
  }, [address, writeContractAsync]);

  const getCertificates = useCallback((studentAddress: Address) => ({ address, abi: LUGHA_CERTIFICATE_ABI, functionName: "getCertificates" as const, args: [studentAddress] }), [address]);

  return {
    getCertificates,
    mintCertificate,
    isLoading: isPending || certificates.isLoading,
    certificates: (certificates.data ?? []) as readonly bigint[],
    error: error ?? certificates.error,
    account,
  };
}

export function useNativeOrCusdToken(paymentMethod: string) {
  const chainId = useChainId();
  return useMemo(() => {
    if (paymentMethod.toLowerCase() === "celo") return "0x0000000000000000000000000000000000000000" as Address;
    if (paymentMethod.toLowerCase() === "cusd" && chainId === celoAlfajores.id) return CUSD_ALFAJORES_ADDRESS as Address;
    if (paymentMethod.toLowerCase() === "cusd") return CUSD_ALFAJORES_ADDRESS as Address;
    return "0x0000000000000000000000000000000000000000" as Address;
  }, [chainId, paymentMethod]);
}

export function toEscrowAmount(price: string) {
  return parseEther(price);
}

export type { BookingTuple, CertificateData };
