"use client";

import { useCallback, useState } from "react";
import { Address, Hex, Hash, isAddress, keccak256, stringToHex } from "viem";
import { usePublicClient } from "wagmi";
import { CONTRACT_ADDRESSES, CUSD_MAINNET_ADDRESS } from "@/lib/contracts";
import { getCELOBalance, getCUSDBalance } from "@/lib/minipay";
import { PaymentMethod } from "@/types";
import { useBookingEscrow } from "@/hooks/useContracts";

export type BookingPaymentStep = "review" | "approving" | "paying" | "confirmed" | "error";

type UseBookingPaymentArgs = {
  bookingId: string;
  tutorAddress?: string | null;
  amount: bigint;
  paymentMethod: PaymentMethod;
};

function friendlyError(error: unknown, method: PaymentMethod) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("user rejected") || message.includes("denied") || message.includes("cancel")) return "You cancelled the transaction";
  if (message.includes("insufficient")) return `Not enough ${method === "celo" ? "CELO" : "cUSD"} in your wallet`;
  if (message.includes("network") || message.includes("fetch")) return "Network error — please try again";
  return "Transaction failed — funds were not charged";
}

export function useBookingPayment({ bookingId, tutorAddress, amount, paymentMethod }: UseBookingPaymentArgs) {
  const escrow = useBookingEscrow();
  const publicClient = usePublicClient();
  const [step, setStep] = useState<BookingPaymentStep>("review");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<Hash | null>(null);

  const pay = useCallback(async () => {
    setError(null);
    try {
      if (paymentMethod === "fiat") {
        await fetch(`/api/bookings/${bookingId}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "pending_fiat" }) });
        setStep("confirmed");
        return;
      }

      if (!tutorAddress || !isAddress(tutorAddress)) throw new Error("Invalid tutor wallet address");
      const accounts = await window.ethereum?.request({ method: "eth_accounts" });
      const account = Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0] : undefined;
      if (!account) throw new Error("Wallet is not connected");

      const balance = paymentMethod === "cusd" ? await getCUSDBalance(account) : await getCELOBalance(account);
      if (balance < amount) throw new Error("insufficient funds");

      const bookingBytes32 = keccak256(stringToHex(bookingId)) as Hex;
      const token = paymentMethod === "cusd" ? CUSD_MAINNET_ADDRESS : "0x0000000000000000000000000000000000000000" as Address;

      if (paymentMethod === "cusd") {
        setStep("approving");
        const approveHash = await escrow.approveToken(CUSD_MAINNET_ADDRESS, amount);
        await publicClient?.waitForTransactionReceipt({ hash: approveHash });
      }

      setStep("paying");
      const hash = await escrow.createBooking(bookingBytes32, tutorAddress, token, amount);
      setTxHash(hash);
      await publicClient?.waitForTransactionReceipt({ hash });
      await fetch(`/api/bookings/${bookingId}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "paid", tx_hash: hash }) });
      setStep("confirmed");
    } catch (caught) {
      setError(friendlyError(caught, paymentMethod));
      setStep("error");
    }
  }, [amount, bookingId, escrow, paymentMethod, publicClient, tutorAddress]);

  return { step, error, txHash, pay, reset: () => setStep("review") };
}

export function getEscrowAddress() {
  return CONTRACT_ADDRESSES.celo.BookingEscrow;
}
