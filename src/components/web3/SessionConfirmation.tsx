"use client";

import { motion } from "framer-motion";
import { Award, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Hex, keccak256, stringToHex } from "viem";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useBookingEscrow } from "@/hooks/useContracts";
import { BookingWithDetails } from "@/types";

export function SessionConfirmation({ booking, isStudent }: { booking: BookingWithDetails; isStudent: boolean }) {
  const escrow = useBookingEscrow();
  const { toast } = useToast();
  const [confirmed, setConfirmed] = useState(false);
  const [minting, setMinting] = useState(false);
  const [tokenId, setTokenId] = useState<string | null>(null);
  const hours = booking.duration_minutes / 60;

  if (!isStudent || booking.status !== "active") return null;

  async function confirm() {
    const hash = await escrow.confirmCompletion(keccak256(stringToHex(booking.id)) as Hex);
    await fetch(`/api/bookings/${booking.id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "completed", tx_hash: hash }) });
    setConfirmed(true);
    toast({ title: "Session completed", description: "Leave a review for your tutor.", type: "success" });
  }

  async function mintCertificate() {
    setMinting(true);
    try {
      const response = await fetch("/api/certificates/mint", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ booking_id: booking.id }) });
      const result = await response.json() as { data?: { tokenId?: string } };
      setTokenId(result.data?.tokenId ?? "pending");
    } finally {
      setMinting(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <Button loading={escrow.isLoading} onClick={() => void confirm()}>Confirm Session Completed</Button>
      {confirmed ? <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-5 rounded-2xl bg-cream p-4"><CheckCircle2 className="h-8 w-8 text-jade" /><p className="mt-2 font-bold text-forest">Great work! Leave a review to help your tutor grow.</p></motion.div> : null}
      {confirmed && hours >= 10 ? <div className="mt-4 rounded-2xl border border-gold bg-gold/10 p-4"><Award className="h-8 w-8 text-gold" /><p className="mt-2 font-black text-forest">You&apos;ve earned a certificate!</p><Button className="mt-3" loading={minting} onClick={() => void mintCertificate()}>Mint My Certificate</Button></div> : null}
      {tokenId ? <div className="mt-4 rounded-2xl bg-forest p-4 text-cream"><p className="font-serif text-xl font-black">LughaPro Certificate</p><p className="mt-2 text-sm text-cream/75">Kiswahili · {booking.tutor.profile.full_name} · {hours.toFixed(1)} hours</p><p className="mt-3 text-xs text-gold">NFT token #{tokenId}</p></div> : null}
    </div>
  );
}
