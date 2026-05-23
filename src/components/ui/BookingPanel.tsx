"use client";

import { CalendarDays, CheckCircle2, CreditCard } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Availability, PaymentMethod } from "@/types";
import { calculateSessionPrice, formatSessionDateTime, isSlotAvailable } from "@/lib/booking";

type BookingPanelProps = {
  hourlyRate: number;
  tutorId?: string;
  tutorName?: string;
  availability?: Availability[];
};

const durations = [30, 60, 90];
const paymentOptions: { value: PaymentMethod; label: string; description: string }[] = [
  { value: "cusd", label: "cUSD", description: "Crypto payment  coming soon, use Card for now" },
  { value: "celo", label: "CELO", description: "Crypto payment  coming soon, use Card for now" },
  { value: "fiat", label: "Card", description: "Secure card checkout for launch" },
];

type BookingResult = { data: { id: string } | null; error?: string };

function nextSlots() {
  return Array.from({ length: 5 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);
    date.setHours(index % 2 === 0 ? 15 : 10, 0, 0, 0);
    return date;
  });
}

export function BookingPanel({ hourlyRate, tutorId, tutorName = "your tutor", availability = [] }: BookingPanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [duration, setDuration] = useState(60);
  const [payment, setPayment] = useState<PaymentMethod>("fiat");
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const price = useMemo(() => calculateSessionPrice(hourlyRate, duration), [duration, hourlyRate]);
  const slots = useMemo(() => nextSlots(), []);

  async function submit() {
    if (!tutorId || !selectedDate) return;
    setLoading(true);
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tutor_id: tutorId, scheduled_at: selectedDate.toISOString(), duration_minutes: duration, payment_method: payment, notes: "Booked from tutor profile" }),
    });
    const result = await response.json() as BookingResult;
    setLoading(false);
    if (!response.ok || !result.data?.id) {
      toast({ title: "Booking not created", description: result.error ?? "Please choose another time and try again.", type: "error" });
      return;
    }
    setSuccessId(result.data.id);
    toast({ title: "Booking confirmed ", description: "Your Kiswahili session is on the calendar.", type: "success" });
    window.setTimeout(() => router.push("/dashboard"), 2000);
  }

  return (
    <div className="sticky top-24 rounded-3xl border border-forest/10 bg-white p-5 shadow-luxury max-lg:static">
      <h2 className="font-serif text-2xl font-black text-forest">Book {tutorName}</h2>
      <p className="mt-1 text-sm text-forest/60">Pick a time, choose a duration, then confirm your session.</p>
      <section className="mt-5"><Step title="1. Choose a time" /><div className="mt-3 grid gap-2">{slots.map((slot) => {
        const available = availability.length === 0 || isSlotAvailable(availability, slot, duration);
        return <button key={slot.toISOString()} disabled={!available} onClick={() => setSelectedDate(slot)} className={`rounded-2xl border p-3 text-left text-sm font-bold transition active:scale-[0.97] ${selectedDate?.toISOString() === slot.toISOString() ? "border-gold bg-gold text-forest" : "border-forest/10 bg-off-white text-forest hover:border-jade"}`}>{formatSessionDateTime(slot, duration)}{!available ? <span className="block text-xs font-semibold opacity-60">Unavailable</span> : null}</button>
      })}</div></section>
      <section className="mt-5"><Step title="2. Duration" /><div className="mt-3 grid grid-cols-3 gap-2">{durations.map((item) => <button key={item} onClick={() => setDuration(item)} className={`rounded-full border px-3 py-3 text-sm font-bold transition active:scale-[0.97] ${duration === item ? "border-gold bg-gold text-forest" : "border-forest/10 bg-off-white text-forest/70"}`}>{item}min</button>)}</div><p className="mt-3 text-2xl font-black text-jade">${price.toFixed(2)}</p></section>
      <section className="mt-5"><Step title="3. Payment" /><div className="mt-3 grid gap-2">{paymentOptions.map((option) => <button key={option.value} onClick={() => setPayment(option.value)} className={`rounded-2xl border p-3 text-left transition active:scale-[0.97] ${payment === option.value ? "border-jade bg-jade/5" : "border-forest/10 bg-white"}`}><span className="font-black text-forest">{option.label}</span><span className="block text-xs text-forest/60">{option.description}</span></button>)}</div>{payment !== "fiat" ? <p className="mt-3 rounded-2xl bg-gold/15 p-3 text-sm font-bold text-forest">Crypto payment is coming soon. Please use Card for now.</p> : null}</section>
      <Button className="mt-6 w-full" size="lg" disabled={!selectedDate || payment !== "fiat" || loading} loading={loading} onClick={() => setConfirming(true)}><CreditCard className="h-4 w-4" />Confirm Booking</Button>
      {successId ? <div className="mt-4 rounded-2xl bg-jade/10 p-4 text-sm font-bold text-jade"><CheckCircle2 className="mb-2 h-5 w-5" />Booking ID: {successId}</div> : null}
      <AnimatePresence>{confirming && selectedDate ? <motion.div className="fixed inset-0 z-[85] grid place-items-center bg-forest/70 px-5 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-luxury"><CalendarDays className="h-9 w-9 text-gold" /><h3 className="mt-4 font-serif text-3xl font-black text-forest">Confirm your booking</h3><div className="mt-4 rounded-2xl bg-cream p-4 text-sm text-forest/75"><p><strong>Tutor:</strong> {tutorName}</p><p><strong>When:</strong> {formatSessionDateTime(selectedDate, duration)}</p><p><strong>Duration:</strong> {duration} minutes</p><p><strong>Payment:</strong> Card</p><p><strong>Total:</strong> ${price.toFixed(2)}</p></div><div className="mt-6 grid grid-cols-2 gap-3"><Button variant="secondary" onClick={() => setConfirming(false)}>Back</Button><Button loading={loading} onClick={() => void submit()}>Book Now</Button></div></motion.div></motion.div> : null}</AnimatePresence>
    </div>
  );
}

function Step({ title }: { title: string }) {
  return <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">{title}</p>;
}
