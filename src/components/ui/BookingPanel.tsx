"use client";

import clsx from "clsx";
import { useMemo, useState } from "react";
import { Button } from "./Button";

type BookingPanelProps = {
  hourlyRate: number;
};

const durations = [30, 60, 90];
const payments = ["cUSD", "CELO", "Card"];

export function BookingPanel({ hourlyRate }: BookingPanelProps) {
  const [duration, setDuration] = useState(60);
  const [payment, setPayment] = useState("cUSD");
  const price = useMemo(() => ((hourlyRate * duration) / 60).toFixed(2), [duration, hourlyRate]);

  return (
    <div className="sticky top-24 rounded-3xl border border-forest/10 bg-white p-6 shadow-luxury">
      <h2 className="font-serif text-2xl font-black text-forest">Book a session</h2>
      <p className="mt-2 text-sm text-forest/60">Choose duration and pay securely with crypto or card.</p>
      <div className="mt-6">
        <p className="text-sm font-bold text-forest">Duration</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {durations.map((item) => (
            <button key={item} onClick={() => setDuration(item)} className={clsx("rounded-full border px-3 py-2 text-sm font-bold transition", duration === item ? "border-gold bg-gold text-forest" : "border-forest/10 bg-off-white text-forest/70")}>{item}min</button>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <p className="text-sm font-bold text-forest">Payment method</p>
        <div className="mt-3 grid gap-2">
          {payments.map((item) => (
            <button key={item} onClick={() => setPayment(item)} className={clsx("rounded-2xl border px-4 py-3 text-left font-bold transition", payment === item ? "border-jade bg-jade text-cream" : "border-forest/10 bg-off-white text-forest")}>{item}</button>
          ))}
        </div>
      </div>
      <div className="mt-6 rounded-2xl bg-cream p-4">
        <div className="flex items-center justify-between"><span className="text-forest/65">Total</span><span className="text-3xl font-black text-forest">${price}</span></div>
        <p className="mt-2 text-xs font-bold text-jade">Pay with cUSD and save 10%</p>
      </div>
      <Button className="mt-6 w-full" size="lg">Book Session</Button>
    </div>
  );
}
