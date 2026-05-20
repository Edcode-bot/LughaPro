"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import { subscribeToNotifications } from "@/lib/realtime";

export function NotificationRealtimeBridge({ userId }: { userId?: string | null }) {
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return undefined;
    return subscribeToNotifications(userId, (notification) => {
      toast({ title: notification.title, description: notification.message, type: "info" });
    });
  }, [toast, userId]);

  return null;
}
