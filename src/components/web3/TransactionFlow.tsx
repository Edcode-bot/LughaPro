"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { PaymentMethodSelector } from "@/components/web3/PaymentMethodSelector";
import { Button } from "@/components/ui/Button";
import { formatCELOAmount, formatCUSDAmount, shortenAddress } from "@/lib/minipay";
import { PaymentMethod } from "@/types";
import { BookingPaymentStep } from "@/hooks/useBookingPayment";

type TransactionFlowProps = {
  step: BookingPaymentStep;
  tutorName: string;
  date: string;
  duration: number;
  amount: bigint;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onConfirm: () => void;
  onRetry: () => void;
  txHash?: string | null;
  error?: string | null;
  cusdBalance?: bigint | null;
  celoBalance?: bigint | null;
};

export function TransactionFlow({ step, tutorName, date, duration, amount, paymentMethod, onPaymentMethodChange, onConfirm, onRetry, txHash, error, cusdBalance, celoBalance }: TransactionFlowProps) {
  const selectedBalance = paymentMethod === "cusd" ? cusdBalance : paymentMethod === "celo" ? celoBalance : null;
  const insufficient = selectedBalance !== null && selectedBalance !== undefined && selectedBalance < amount;
  const explorer = `https://alfajores.celoscan.io/tx/${txHash}`;

  if (step === "approving" || step === "paying") {
    return <StatePanel icon={<Loader2 className="h-10 w-10 animate-spin text-gold" />} title={step === "approving" ? "Approving cUSD spend..." : "Processing payment..."} subtitle={step === "approving" ? "Please confirm in your wallet" : "Sending to escrow contract"} txHash={txHash} />;
  }

  if (step === "confirmed") {
    return (
      <StatePanel icon={<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle2 className="h-12 w-12 text-jade" /></motion.div>} title="Payment confirmed on Celo blockchain ✓" subtitle="Your booking is secured in escrow." txHash={txHash}>
        <Link href="/dashboard" className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-gold px-6 font-bold text-forest">View Booking</Link>
      </StatePanel>
    );
  }

  if (step === "error") {
    return <StatePanel icon={<motion.div initial={{ rotate: -20, scale: 0 }} animate={{ rotate: 0, scale: 1 }}><XCircle className="h-12 w-12 text-red-600" /></motion.div>} title="Payment could not be completed" subtitle={error ?? "Transaction failed — funds were not charged"}><Button className="mt-6" onClick={onRetry}>Try Again</Button></StatePanel>;
  }

  return (
    <div className="rounded-3xl bg-white p-5 shadow-luxury">
      <h3 className="font-serif text-2xl font-black text-forest">Review booking</h3>
      <div className="mt-4 rounded-2xl bg-cream p-4 text-sm text-forest/75">
        <p><span className="font-bold text-forest">Tutor:</span> {tutorName}</p>
        <p><span className="font-bold text-forest">Date:</span> {date}</p>
        <p><span className="font-bold text-forest">Duration:</span> {duration} minutes</p>
        <p><span className="font-bold text-forest">Amount:</span> {paymentMethod === "celo" ? formatCELOAmount(amount) : `${Number(formatCUSDAmount(amount).replace(" cUSD", "")).toFixed(2)} cUSD`}</p>
      </div>
      <div className="mt-5"><PaymentMethodSelector value={paymentMethod} onChange={onPaymentMethodChange} cusdBalance={cusdBalance === null || cusdBalance === undefined ? undefined : formatCUSDAmount(cusdBalance)} celoBalance={celoBalance === null || celoBalance === undefined ? undefined : formatCELOAmount(celoBalance)} /></div>
      {insufficient ? <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">Insufficient balance. <a className="underline" href="https://faucet.celo.org/alfajores" target="_blank" rel="noreferrer">Add Funds</a></div> : null}
      <Button className="mt-6 w-full" size="lg" disabled={insufficient} onClick={onConfirm}>Confirm & Pay</Button>
    </div>
  );

  function StatePanel({ icon, title, subtitle, children, txHash: hash }: { icon: React.ReactNode; title: string; subtitle: string; children?: React.ReactNode; txHash?: string | null }) {
    return (
      <div className="rounded-3xl bg-white p-6 text-center shadow-luxury">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-cream">{icon}</div>
        <h3 className="mt-5 font-serif text-2xl font-black text-forest">{title}</h3>
        <p className="mt-2 text-forest/65">{subtitle}</p>
        {hash ? <a className="mt-4 block text-sm font-bold text-jade underline" href={explorer} target="_blank" rel="noreferrer">{shortenAddress(hash)}</a> : null}
        {children}
      </div>
    );
  }
}
