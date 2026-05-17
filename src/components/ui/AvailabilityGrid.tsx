"use client";

import clsx from "clsx";
import { useState } from "react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const slots = ["08:00", "10:30", "14:00", "18:00"];

export function AvailabilityGrid() {
  const [selected, setSelected] = useState("Tue-10:30");

  return (
    <div className="grid gap-3 sm:grid-cols-7">
      {days.map((day, dayIndex) => (
        <div key={day} className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-forest/10">
          <p className="text-center text-sm font-black text-forest">{day}</p>
          <div className="mt-3 grid gap-2">
            {slots.map((slot, slotIndex) => {
              const enabled = (dayIndex + slotIndex) % 3 !== 0;
              const key = `${day}-${slot}`;
              return (
                <button key={key} disabled={!enabled} onClick={() => setSelected(key)} className={clsx("rounded-full px-2 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-35", selected === key ? "bg-gold text-forest" : "bg-cream text-forest hover:bg-gold/30")}>{slot}</button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
