"use client";

import clsx from "clsx";
import { CheckCircle2, CreditCard } from "lucide-react";
import { PaymentMethod } from "@/types";

type Option = { id: PaymentMethod; name: string; logo: string; balance?: string; subtitle: string; recommended?: boolean };

export function PaymentMethodSelector({ value, onChange, cusdBalance, celoBalance }: { value: PaymentMethod; onChange: (value: PaymentMethod) => void; cusdBalance?: string; celoBalance?: string }) {
  const options: Option[] = [
    { id: "cusd", name: "cUSD", logo: "$", balance: cusdBalance, subtitle: "Stable Celo payment", recommended: true },
    { id: "celo", name: "CELO", logo: "◇", balance: celoBalance, subtitle: "Native Celo token" },
    { id: "fiat", name: "Card", logo: "", subtitle: "Processed via Stripe" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {options.map((option) => (
        <button key={option.id} onClick={() => onChange(option.id)} className={clsx("relative rounded-2xl border bg-white p-4 text-left transition", value === option.id ? "border-jade ring-4 ring-jade/10" : "border-forest/10 hover:border-gold")}> 
          {value === option.id ? <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-jade" /> : null}
          {option.recommended ? <span className="mb-3 inline-flex rounded-full bg-gold px-2 py-1 text-[10px] font-black text-forest">Recommended</span> : null}
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-cream text-lg font-black text-jade">{option.logo || <CreditCard className="h-5 w-5" />}</span>
            <div><p className="font-black text-forest">{option.name}</p><p className="text-xs text-forest/55">{option.subtitle}</p></div>
          </div>
          {option.balance ? <p className="mt-3 text-sm font-bold text-forest/70">Balance: {option.balance}</p> : null}
        </button>
      ))}
    </div>
  );
}
