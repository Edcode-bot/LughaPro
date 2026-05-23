import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarDays } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getBookingStatusColor, formatSessionDateTime } from '@/lib/booking'
import { BookingWithDetails } from '@/types'

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('bookings').select('*, student:profiles(*), tutor:tutors(*, profile:profiles(*))').eq('id', id).maybeSingle()
  if (!data) notFound()
  const booking = data as BookingWithDetails

  return (
    <main className="min-h-screen bg-off-white px-5 py-10 text-forest">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard" className="text-sm font-bold text-jade hover:underline">← Back to dashboard</Link>
        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <CalendarDays className="h-10 w-10 text-gold" />
          <div className="mt-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div><h1 className="font-serif text-4xl font-black">Booking with {booking.tutor.profile.full_name}</h1><p className="mt-2 text-forest/65">Booking ID: {booking.id}</p></div>
            <span className={`rounded-full border px-4 py-2 text-sm font-black ${getBookingStatusColor(booking.status)}`}>{booking.status}</span>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Info label="Student" value={booking.student.full_name} />
            <Info label="Tutor" value={booking.tutor.profile.full_name} />
            <Info label="Date & time" value={formatSessionDateTime(new Date(booking.scheduled_at), booking.duration_minutes)} />
            <Info label="Duration" value={`${booking.duration_minutes} minutes`} />
            <Info label="Amount" value={`$${Number(booking.amount ?? 0).toFixed(2)}`} />
            <Info label="Payment method" value={booking.payment_method === 'fiat' ? 'Card' : booking.payment_method.toUpperCase()} />
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {booking.status === 'pending' ? <form action={`/api/bookings/${booking.id}/status`}><button className="rounded-full border border-red-200 px-5 py-3 font-bold text-red-700">Cancel Booking</button></form> : null}
            <button className="rounded-full bg-gold px-5 py-3 font-bold text-forest">Join Session</button>
            {booking.status === 'completed' ? <button className="rounded-full bg-jade px-5 py-3 font-bold text-cream">Leave Review</button> : null}
          </div>
          <p className="mt-4 rounded-2xl bg-cream p-4 text-sm font-semibold text-forest/70">Session link will appear here 15 min before start.</p>
        </section>
      </div>
    </main>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-cream p-4"><p className="text-xs font-black uppercase tracking-[0.2em] text-gold">{label}</p><p className="mt-2 font-bold text-forest">{value}</p></div>
}
