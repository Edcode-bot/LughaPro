"use client";

import { useMemo, useState } from "react";
import { parseEther } from "viem";
import { isMiniPay } from "@/lib/minipay";
import { PaymentMethod } from "@/types";
import { useBookingPayment } from "@/hooks/useBookingPayment";
import { TransactionFlow } from "@/components/web3/TransactionFlow";

type BookingPanelProps = {
  hourlyRate: number;
  tutorId?: string;
  tutorWalletAddress?: string | null;
  tutorName?: string;
};

const durations = [30, 60, 90];

type BookingResult = { data: { id: string } | null; message?: string; error?: string };

export function BookingPanel({ hourlyRate, tutorId, tutorWalletAddress, tutorName = "Your tutor" }: BookingPanelProps) {
  const [duration, setDuration] = useState(60);
  const [payment, setPayment] = useState<PaymentMethod>("cusd");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [scheduledAt] = useState(() => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());
  const price = useMemo(() => ((hourlyRate * duration) / 60).toFixed(2), [duration, hourlyRate]);
  const paymentFlow = useBookingPayment({ bookingId: bookingId ?? "pending", tutorAddress: tutorWalletAddress, amount: parseEther(price), paymentMethod: payment });

  async function confirmAndPay() {
    if (!tutorId) return;
    setMessage(null);
    let activeBookingId = bookingId;

    if (!activeBookingId) {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutor_id: tutorId,
          scheduled_at: scheduledAt,
          duration_minutes: duration,
          payment_method: payment,
          notes: "Booked from tutor profile",
        }),
      });
      const result = await response.json() as BookingResult;
      if (!response.ok || !result.data?.id) {
        setMessage(result.error ?? "Unable to create booking.");
        return;
      }
      activeBookingId = result.data.id;
      setBookingId(activeBookingId);
    }

    await paymentFlow.pay();
  }

  return (
    <div className="sticky top-24 rounded-3xl border border-forest/10 bg-white p-5 shadow-luxury max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-auto max-lg:z-40 max-lg:rounded-b-none max-lg:rounded-t-3xl">
      <div className="mb-4 flex items-center justify-between">
        <div><h2 className="font-serif text-2xl font-black text-forest">Book a session</h2><p className="mt-1 text-sm text-forest/60">{isMiniPay() ? "MiniPay optimized checkout" : "Choose duration and pay securely."}</p></div>
        {isMiniPay() ? <span className="rounded-full bg-gold px-3 py-1 text-xs font-black text-forest">MiniPay</span> : null}
      </div>
      <div className="mb-5 grid grid-cols-3 gap-2">
        {durations.map((item) => <button key={item} onClick={() => setDuration(item)} className={`rounded-full border px-3 py-3 text-sm font-bold ${duration === item ? "border-gold bg-gold text-forest" : "border-forest/10 bg-off-white text-forest/70"}`}>{item}min</button>)}
      </div>
      {message ? <p className="mb-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{message}</p> : null}
      <TransactionFlow step={paymentFlow.step} tutorName={tutorName} date={new Date(scheduledAt).toLocaleString()} duration={duration} amount={parseEther(price)} paymentMethod={payment} onPaymentMethodChange={setPayment} onConfirm={() => void confirmAndPay()} onRetry={paymentFlow.reset} txHash={paymentFlow.txHash} error={paymentFlow.error} />
    </div>
  );
}
