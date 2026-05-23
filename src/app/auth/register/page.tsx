"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { UserRole } from "@/types";

type ApiResult = { error: string | null; message: string };

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>((searchParams.get("role") as UserRole) === "tutor" ? "tutor" : "student");
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, email, password, role, referral_code: referralCode || undefined }),
    });
    const result = await response.json() as ApiResult;

    setLoading(false);
    if (!response.ok) {
      setError(result.error ?? "Unable to register.");
      return;
    }

    router.push(role === "tutor" ? "/onboarding" : "/dashboard");
  }

  return (
    <Card className="w-full max-w-lg bg-white shadow-luxury">
      <Link href="/" className="inline-flex items-center">
        <Image src="/logo.png" alt="LughaPro" width={120} height={36} className="h-10 w-auto" priority />
      </Link>
      <h1 className="mt-8 font-serif text-4xl font-black text-forest">Create your account</h1>
      <p className="mt-2 text-forest/65">Join Africa&apos;s premium Web3 Kiswahili learning marketplace.</p>
      <form className="mt-8 grid gap-4" onSubmit={submit}>
        <label className="grid gap-2 text-sm font-bold text-forest">Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} className="h-12 rounded-2xl border border-forest/10 bg-white px-4 outline-none focus:ring-4 focus:ring-gold/25" required /></label>
        <label className="grid gap-2 text-sm font-bold text-forest">Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="h-12 rounded-2xl border border-forest/10 bg-white px-4 outline-none focus:ring-4 focus:ring-gold/25" required /></label>
        <label className="grid gap-2 text-sm font-bold text-forest">Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="h-12 rounded-2xl border border-forest/10 bg-white px-4 outline-none focus:ring-4 focus:ring-gold/25" required /></label>
        <div className="grid gap-3 text-sm font-bold text-forest"><span>Role</span><div className="grid gap-3 sm:grid-cols-2">{(["student", "tutor"] as UserRole[]).map((item) => <button key={item} type="button" onClick={() => setRole(item)} className={`rounded-2xl border p-4 text-left transition ${role === item ? "border-gold bg-gold/15 ring-4 ring-gold/10" : "border-forest/10 bg-white hover:border-jade"}`}><span className="block text-lg font-black capitalize">{item}</span><span className="mt-1 block text-xs text-forest/60">{item === "student" ? "Book tutors and track sessions" : "Teach learners and manage bookings"}</span></button>)}</div></div>
        <label className="grid gap-2 text-sm font-bold text-forest">Referral code optional<input value={referralCode} onChange={(event) => setReferralCode(event.target.value)} className="h-12 rounded-2xl border border-forest/10 bg-white px-4 outline-none focus:ring-4 focus:ring-gold/25" /></label>
        {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
        <Button loading={loading} size="lg" className="w-full">Register</Button>
      </form>
      <p className="mt-6 text-sm text-forest/65">Already have an account? <Link href="/auth/login" className="font-bold text-jade">Log in</Link></p>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-forest via-jade to-forest px-5 py-12">
      <Suspense fallback={<div className="text-cream">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}

