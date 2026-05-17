"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function ExpandableAbout({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-3xl bg-cream p-6">
      <button className="flex w-full items-center justify-between text-left" onClick={() => setOpen((value) => !value)}>
        <span className="font-serif text-2xl font-black text-forest">About this tutor</span>
        <ChevronDown className={`h-5 w-5 text-forest transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? <p className="mt-4 leading-7 text-forest/75">{text}</p> : null}
    </div>
  );
}

