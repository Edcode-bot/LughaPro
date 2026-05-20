"use client";

import { Bell, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Notification } from "@/types";

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  booking: Bell,
};

export function NotificationToast({ notification, onDismiss }: { notification: Notification; onDismiss: () => void }) {
  const Icon = iconMap[(notification.type ?? "info") as keyof typeof iconMap] ?? Bell;
  return (
    <motion.div initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }} className="rounded-2xl border border-forest/10 bg-white p-4 shadow-luxury">
      <div className="flex gap-3">
        <Icon className="mt-1 h-5 w-5 text-gold" />
        <div className="flex-1">
          <p className="font-bold text-forest">{notification.title}</p>
          <p className="mt-1 text-sm text-forest/70">{notification.message}</p>
          <p className="mt-2 text-xs text-forest/45">{new Date(notification.created_at).toLocaleTimeString()}</p>
        </div>
        <button onClick={onDismiss} aria-label="Dismiss notification"><X className="h-4 w-4 text-forest/60" /></button>
      </div>
    </motion.div>
  );
}
