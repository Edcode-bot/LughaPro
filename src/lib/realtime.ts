import { RealtimeChannel } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { Booking, Notification } from "@/types";

type RealtimePayload<T> = {
  new: T;
}

function unsubscribe(channel: RealtimeChannel) {
  void createBrowserSupabaseClient().removeChannel(channel);
}

export function subscribeToBookings(userId: string, onUpdate: (booking: Booking) => void) {
  const supabase = createBrowserSupabaseClient();
  const channel = supabase
    .channel(`bookings:${userId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `student_id=eq.${userId}` }, (payload: RealtimePayload<Booking>) => onUpdate(payload.new))
    .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `tutor_id=eq.${userId}` }, (payload: RealtimePayload<Booking>) => onUpdate(payload.new))
    .subscribe();

  return () => unsubscribe(channel);
}

export function subscribeToNotifications(userId: string, onNew: (notification: Notification) => void) {
  const supabase = createBrowserSupabaseClient();
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, (payload: RealtimePayload<Notification>) => onNew(payload.new))
    .subscribe();

  return () => unsubscribe(channel);
}
