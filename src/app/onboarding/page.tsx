"use client";

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

const steps = ['Welcome to LughaPro!', 'Are you here to learn or teach?', 'Shape your Kiswahili journey', 'You are ready to begin']

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  return <main className="grid min-h-screen place-items-center bg-off-white px-5 text-forest"><motion.section key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-2xl rounded-3xl bg-white p-8 text-center shadow-sm"><p className="text-sm font-black uppercase tracking-[0.25em] text-gold">Step {step + 1} of 4</p><h1 className="mt-4 font-serif text-4xl font-black">{steps[step]}</h1><p className="mt-3 text-forest/65">We&apos;ll personalize your LughaPro experience so every lesson feels encouraging and useful.</p><div className="mt-8 flex justify-center gap-3"><Button variant="secondary" onClick={() => setStep(3)}>Skip</Button><Button onClick={() => step < 3 ? setStep(step + 1) : window.location.assign('/dashboard')}>{step < 3 ? 'Continue' : 'Go to dashboard'}</Button></div></motion.section></main>
}
