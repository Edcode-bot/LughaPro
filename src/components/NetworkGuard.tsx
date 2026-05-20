"use client";

import { ReactNode } from "react";
import { useAccount, useChainId } from "wagmi";
import { Button } from "@/components/ui/Button";
import { switchToCeloNetwork, CELO_ALFAJORES_CHAIN_ID, CELO_MAINNET_CHAIN_ID } from "@/lib/minipay";

export function NetworkGuard({ children }: { children: ReactNode }) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const valid = chainId === CELO_MAINNET_CHAIN_ID || chainId === CELO_ALFAJORES_CHAIN_ID;

  if (!isConnected || valid) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-30">{children}</div>
      <div className="fixed inset-0 z-[75] grid place-items-center bg-forest/70 px-5 backdrop-blur-sm">
        <div className="max-w-md rounded-3xl bg-white p-6 text-center shadow-luxury">
          <h2 className="font-serif text-3xl font-black text-forest">You&apos;re on the wrong network</h2>
          <p className="mt-3 text-forest/70">LughaPro runs on Celo. Please switch to continue.</p>
          <Button className="mt-6" onClick={() => void switchToCeloNetwork(CELO_ALFAJORES_CHAIN_ID)}>Switch to Celo</Button>
        </div>
      </div>
    </div>
  );
}
