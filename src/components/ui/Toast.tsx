"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X, XCircle, AlertTriangle } from "lucide-react";
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import clsx from "clsx";

type ToastType = "success" | "error" | "info" | "warning";
type ToastInput = { title: string; description?: string; type?: ToastType; duration?: number };
type ToastItem = ToastInput & { id: string; type: ToastType };
type ToastContextValue = { toast: (input: ToastInput) => string; dismiss: (id: string) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

const styles: Record<ToastType, string> = {
  success: "border-jade bg-white text-forest",
  error: "border-red-300 bg-white text-red-800",
  info: "border-forest/20 bg-white text-forest",
  warning: "border-gold bg-white text-forest",
};

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => setItems((current) => current.filter((item) => item.id !== id)), []);

  const toast = useCallback((input: ToastInput) => {
    const id = crypto.randomUUID();
    const item: ToastItem = { ...input, id, type: input.type ?? "info" };
    setItems((current) => [item, ...current]);
    window.setTimeout(() => dismiss(id), input.duration ?? 5000);
    return id;
  }, [dismiss]);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer items={items} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}

function ToastContainer({ items, dismiss }: { items: ToastItem[]; dismiss: (id: string) => void }) {
  return (
    <div className="fixed right-4 top-4 z-[80] grid w-[calc(100vw-2rem)] max-w-sm gap-3">
      <AnimatePresence initial={false}>
        {items.map((item) => {
          const Icon = icons[item.type];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className={clsx("rounded-2xl border p-4 shadow-sm", styles[item.type])}
            >
              <div className="flex gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{item.title}</p>
                  {item.description ? <p className="mt-1 text-sm opacity-75">{item.description}</p> : null}
                </div>
                <button onClick={() => dismiss(item.id)} aria-label="Dismiss toast"><X className="h-4 w-4" /></button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
