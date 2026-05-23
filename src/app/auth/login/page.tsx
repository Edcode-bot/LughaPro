"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type ApiResult = { error: string | null; message: string };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json() as ApiResult;

    setLoading(false);
    if (!response.ok) {
      setError(result.error ?? "Unable to log in.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-forest via-jade to-forest px-5 py-12">
      <Card className="w-full max-w-md bg-white shadow-luxury">
        <Link href="/" className="inline-flex items-center">
          <Image src="/logo.png" alt="LughaPro" width={120} height={36} className="h-10 w-auto" priority />
        </Link>
        <h1 className="mt-8 font-serif text-4xl font-black text-forest">Welcome back</h1>
        <p className="mt-2 text-forest/65">Log in to continue your Kiswahili learning journey.</p>
        <form className="mt-8 grid gap-4" onSubmit={submit}>
          <label className="grid gap-2 text-sm font-bold text-forest">
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="h-12 rounded-2xl border border-forest/10 bg-white px-4 outline-none focus:ring-4 focus:ring-gold/25" required />
          </label>
          <label className="grid gap-2 text-sm font-bold text-forest">
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="h-12 rounded-2xl border border-forest/10 bg-white px-4 outline-none focus:ring-4 focus:ring-gold/25" required />
          </label>
          {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
          <Button loading={loading} size="lg" className="w-full">Log In</Button>
        </form>
        <div className="mt-6 rounded-2xl bg-white p-4">
          <p className="mb-3 text-sm font-bold text-forest">Connect Wallet Instead</p>
          <ConnectButton />
        </div>
        <p className="mt-6 text-sm text-forest/65">
          New to LughaPro? <Link href="/auth/register" className="font-bold text-jade">Create an account</Link>
        </p>
      </Card>
    </main>
  );
}

