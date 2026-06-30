"use client";

import { Check } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

type ToastData = {
  id: string;
  title: string;
  sub?: string;
  link?: string;
};

type ToastContextValue = {
  showToast: (data: Omit<ToastData, "id">) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

const INITIAL_TOASTS: Omit<ToastData, "id">[] = [
  {
    title: "Referral Commission claimed successfully",
    sub: "0.25 ETH claimed to wallet: 0x71C…492",
    link: "VIEW TRANSACTION",
  },
  {
    title: "Pool Reward claimed successfully",
    sub: "1.15 ETH claimed to wallet: 0x71C…492",
    link: "VIEW TRANSACTION",
  },
  {
    title: "Pool Deposit Successful",
    sub: "1.25 ETH deposited into Fidenza #565",
    link: "VIEW TRANSACTION",
  },
];

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastData;
  onDismiss: (id: string) => void;
}) {
  const [exiting, setExiting] = React.useState(false);

  React.useEffect(() => {
    const exitTimer = window.setTimeout(() => setExiting(true), 4700);
    const removeTimer = window.setTimeout(() => onDismiss(toast.id), 5050);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, [onDismiss, toast.id]);

  return (
    <div
      className={cn(
        "toast pointer-events-auto relative flex w-[310px] items-start gap-[11px] overflow-hidden rounded-[10px] border border-bd1 bg-e2 p-[14px_16px_14px_14px] shadow-sh3",
        exiting ? "toast-out" : "toast-in",
      )}
      style={{ boxShadow: "var(--sh3), 0 0 0 0.5px var(--bd0)" }}
    >
      <div
        className="toast-progress absolute inset-x-0 top-0 h-0.5 origin-left bg-accent"
        aria-hidden
      />
      <div className="mt-px flex size-7 shrink-0 items-center justify-center rounded-full bg-accent">
        <Check className="size-3.5 text-accent-ui-foreground" strokeWidth={2.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-xs font-bold leading-snug text-t4">
          {toast.title}
        </p>
        {toast.sub ? (
          <p className="mt-0.5 text-[10px] leading-snug text-t1">{toast.sub}</p>
        ) : null}
        {toast.link ? (
          <button
            type="button"
            className="mt-2 font-mono text-[8px] font-bold tracking-[0.06em] text-accent"
          >
            {toast.link}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const showToast = React.useCallback((data: Omit<ToastData, "id">) => {
    setToasts((current) => [
      ...current,
      { ...data, id: `${Date.now()}-${Math.random()}` },
    ]);
  }, []);

  React.useEffect(() => {
    const firstDelay = 3000 + Math.random() * 2000;
    const firstTimer = window.setTimeout(() => {
      showToast(INITIAL_TOASTS[0]!);
    }, firstDelay);

    let intervalId: number | undefined;
    const scheduleNext = () => {
      const delay = 6000 + Math.random() * 8000;
      intervalId = window.setTimeout(() => {
        const pick =
          INITIAL_TOASTS[Math.floor(Math.random() * INITIAL_TOASTS.length)]!;
        showToast(pick);
        scheduleNext();
      }, delay);
    };

    const recurringTimer = window.setTimeout(scheduleNext, firstDelay + 500);

    return () => {
      window.clearTimeout(firstTimer);
      window.clearTimeout(recurringTimer);
      if (intervalId) window.clearTimeout(intervalId);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        id="toast-container"
        className="pointer-events-none fixed bottom-[72px] right-6 z-[8000] flex flex-col-reverse gap-2.5 md:bottom-6"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
