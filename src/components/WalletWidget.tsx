"use client";

import { Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectWalletModal } from "@/components/ConnectWalletModal";
import { formatCELOAmount, formatCUSDAmount, getCELOBalance, getCUSDBalance, shortenAddress } from "@/lib/minipay";

export function WalletWidget() {
  const { address, isConnected } = useAccount();
  const [cusd, setCusd] = useState<string | null>(null);
  const [celo, setCelo] = useState<string | null>(null);
  const [walletOpen, setWalletOpen] = useState(false);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(async () => {
    if (!address) return;
    setFailed(false);
    try {
      const [cusdBalance, celoBalance] = await Promise.all([
        getCUSDBalance(address),
        getCELOBalance(address),
      ]);
      setCusd(formatCUSDAmount(cusdBalance));
      setCelo(formatCELOAmount(celoBalance));
    } catch {
      setFailed(true);
      setCusd(null);
      setCelo(null);
    }
  }, [address]);

  useEffect(() => {
    window.setTimeout(() => void refresh(), 0);
    const interval = window.setInterval(() => void refresh(), 30000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  if (!isConnected || !address) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
        <Wallet className="mx-auto h-10 w-10 text-gold" />
        <h3 className="mt-4 font-serif text-2xl font-black text-forest">Connect your wallet</h3>
        <p className="mt-2 text-foreground/65">Connect your wallet to view balances and pay with crypto.</p>
        <button
          type="button"
          onClick={() => setWalletOpen(true)}
          className="mt-6 rounded-full bg-gold px-6 py-3 font-bold text-foreground hover:bg-[#e6ac00]"
        >
          Connect Wallet
        </button>
        <ConnectWalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="bg-forest px-5 py-4">
        <h3 className="font-serif text-xl font-bold text-cream">Wallet</h3>
        <p className="mt-1 text-sm text-cream/70">{shortenAddress(address)}</p>
      </div>
      <div className="p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <BalanceCard label="cUSD" value={failed ? "—" : cusd} loading={!failed && cusd === null} />
          <BalanceCard label="CELO" value={failed ? "—" : celo} loading={!failed && celo === null} />
        </div>
        <a
          href="https://minipay.opera.com/"
          target="_blank"
          rel="noreferrer"
          className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-gold font-bold text-foreground transition hover:bg-[#e6ac00]"
        >
          Add Funds
        </a>
      </div>
    </div>
  );
}

function BalanceCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: string | null;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl bg-off-white p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-jade text-xs font-black text-white">
          {label.slice(0, 1)}
        </span>
        <p className="text-sm font-bold text-foreground/60">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-black text-forest">
        {loading ? (
          <span className="inline-block h-7 w-24 animate-pulse rounded bg-forest/10" />
        ) : (
          value ?? "—"
        )}
      </p>
    </div>
  );
}
