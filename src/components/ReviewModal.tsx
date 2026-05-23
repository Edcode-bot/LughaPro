"use client";

import { AnimatePresence, motion } from 'framer-motion'
import { Star, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

type ReviewModalProps = {
  open: boolean
  bookingId: string
  tutorId: string
  onClose: () => void
}

export function ReviewModal({ open, bookingId, tutorId, onClose }: ReviewModalProps) {
  const { toast } = useToast()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (comment.trim().length < 20) {
      toast({ title: 'Tell us a little more', description: 'Reviews need at least 20 characters.', type: 'warning' })
      return
    }
    setLoading(true)
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bookingId, tutor_id: tutorId, rating, comment }),
    })
    setLoading(false)
    if (!response.ok) {
      toast({ title: 'Review not submitted', description: 'Please try again in a moment.', type: 'error' })
      return
    }
    toast({ title: 'Thank you for your review!', description: 'Your feedback helps the LughaPro community grow.', type: 'success' })
    onClose()
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[90] grid place-items-center bg-forest/70 px-5 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div><h2 className="font-serif text-3xl font-black text-forest">How was your session?</h2><p className="mt-2 text-forest/65">Share your experience to help future learners.</p></div>
              <button onClick={onClose} aria-label="Close review modal"><X className="h-5 w-5 text-forest" /></button>
            </div>
            <div className="mt-6 flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => <button key={value} onClick={() => setRating(value)} aria-label={`${value} stars`}><Star className={`h-9 w-9 ${value <= rating ? 'fill-gold text-gold' : 'text-forest/20'}`} /></button>)}
            </div>
            <textarea value={comment} onChange={(event) => setComment(event.target.value)} className="mt-5 min-h-36 w-full rounded-2xl border border-forest/10 p-4 outline-none ring-gold/30 focus:ring-4" placeholder="Share your experience" />
            <p className="mt-2 text-right text-sm text-forest/50">{comment.length}/500</p>
            <Button className="mt-5 w-full" loading={loading} onClick={() => void submit()}>Submit Review</Button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
