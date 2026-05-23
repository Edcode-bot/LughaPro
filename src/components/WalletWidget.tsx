"use client";

import { Copy, ExternalLink, QrCode, Send, Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ConnectWalletModal } from "@/components/ConnectWalletModal";
import { SkeletonText } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { CELO_ALFAJORES_CHAIN_ID, CELO_MAINNET_CHAIN_ID, formatCELOAmount, formatCUSDAmount, getCELOBalance, getCUSDBalance, shortenAddress } from "@/lib/minipay";

export function WalletWidget() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { toast } = useToast();
  const [cusd, setCusd] = useState<bigint | null>(null);
  const [celo, setCelo] = useState<bigint | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!address) return;
    const [cusdBalance, celoBalance] = await Promise.all([getCUSDBalance(address), getCELOBalance(address)]);
    setCusd(cusdBalance);
    setCelo(celoBalance);
  }, [address]);

  useEffect(() => {
    window.setTimeout(() => void refresh(), 0);
    const interval = window.setInterval(() => void refresh(), 30000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  if (!isConnected || !address) {
    return (
      <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
        <Wallet className="mx-auto h-10 w-10 text-gold" />
        <h3 className="mt-4 font-serif text-2xl font-black text-forest">Connect your wallet</h3>
        <p className="mt-2 text-forest/65">Connect your wallet to enable crypto payments.</p>
        <div className="mt-6 flex justify-center"><Button onClick={() => setWalletOpen(true)}>Connect Wallet</Button></div>
        <ConnectWalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
      </div>
    );
  }

  const network = chainId === CELO_MAINNET_CHAIN_ID ? "Celo Mainnet" : chainId === CELO_ALFAJORES_CHAIN_ID ? "Alfajores Testnet" : "Wrong Network";
  const networkClass = chainId === CELO_MAINNET_CHAIN_ID ? "bg-jade text-cream" : "bg-gold text-forest";
  const explorer = chainId === CELO_MAINNET_CHAIN_ID ? "https://celoscan.io/address" : "https://alfajores.celoscan.io/address";
  const fundsLink = chainId === CELO_ALFAJORES_CHAIN_ID ? "https://faucet.celo.org/alfajores" : "https://minipay.opera.com/";

  async function copy() {
    await navigator.clipboard.writeText(address ?? "");
    toast({ title: "Copied to clipboard", description: shortenAddress(address ?? ""), type: "success" });
  }

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar name={address} online />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-forest">{shortenAddress(address)}</p>
          <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-black ${networkClass}`}>{network}</span>
        </div>
        <button onClick={copy} aria-label="Copy address" className="rounded-full bg-cream p-2 text-forest"><Copy className="h-4 w-4" /></button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <BalanceCard logo="$" label="cUSD" value={cusd === null ? null : formatCUSDAmount(cusd)} />
        <BalanceCard logo="◇" label="CELO" value={celo === null ? null : formatCELOAmount(celo)} />
      </div>
      {showQr ? <div className="mt-5 rounded-2xl bg-cream p-4 text-center"><QrCode className="mx-auto h-24 w-24 text-forest" /><p className="mt-3 break-all text-xs font-semibold text-forest/70">{address}</p></div> : null}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button size="sm" variant="secondary"><Send className="h-4 w-4" />Send</Button>
        <Button size="sm" variant="secondary" onClick={() => setShowQr((current) => !current)}>Receive</Button>
        <a href={fundsLink} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-forest">Add Funds</a>
        <a href={`${explorer}/${address}`} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center justify-center gap-1 rounded-full border border-jade/30 px-4 text-sm font-semibold text-jade">History<ExternalLink className="h-3 w-3" /></a>
      </div>
    </div>
  );
}

function BalanceCard({ logo, label, value }: { logo: string; label: string; value: string | null }) {
  return (
    <div className="rounded-2xl bg-cream p-4">
      <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-jade text-sm font-black text-cream">{logo}</span><p className="text-sm font-bold text-forest/60">{label}</p></div>
      <div className="mt-3 text-2xl font-black text-forest">{value ?? <SkeletonText className="h-7 w-28" />}</div>
    </div>
  );
}
