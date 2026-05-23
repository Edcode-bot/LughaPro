"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Notification } from "@/types";

export function NotificationBell() {
  const { profile } = useAuth()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>([])

  useEffect(() => {
    if (!profile?.id) return
    fetch("/api/notifications")
      .then((response) => response.json())
      .then((result: { data?: Notification[] }) => setItems(result.data ?? []))
      .catch(() => setItems([]))
  }, [profile?.id])

  const unread = items.filter((item) => !item.read).length

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "PATCH" })
    setItems((current) => current.map((item) => ({ ...item, read: true })))
  }

  if (!profile?.id) return null

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-full p-2 text-forest hover:bg-off-white"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-foreground">
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-forest/10 bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="font-bold text-forest">Notifications</p>
            <button type="button" onClick={() => void markAllRead()} className="text-xs font-semibold text-jade">
              Mark all read
            </button>
          </div>
          <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
            {items.length === 0 ? (
              <p className="py-6 text-center text-sm text-foreground/60">No notifications yet</p>
            ) : (
              items.slice(0, 5).map((item) => (
                <div key={item.id} className={`rounded-xl p-3 text-sm ${item.read ? "bg-off-white" : "bg-cream"}`}>
                  <p className="font-bold text-forest">{item.title}</p>
                  <p className="mt-1 text-foreground/65">{item.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
