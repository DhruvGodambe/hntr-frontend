"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { poolActivity } from "@/features/pools/data/pools-data";
import { cn } from "@/lib/utils";

type ActivityRow = {
  id: string;
  wallet: string;
  bidAmount: string;
  collection: string;
  collectionColor: string;
  completion: number;
  txHash: string;
  isNew?: boolean;
};

const WALLETS = [
  "0x71C...492",
  "0x3A8...12D",
  "0x9FE...88A",
  "0x12C...55B",
  "0xB4D...F31",
] as const;

const COLLECTIONS = [
  { name: "Bored Ape Yacht Club", color: "var(--olive)" },
  { name: "CryptoPunks", color: "var(--sage)" },
  { name: "Pudgy Penguins", color: "#c8b99a" },
  { name: "Azuki", color: "#9e7a6a" },
  { name: "Doodles", color: "#8a9e82" },
  { name: "Fidenza #565", color: "#9e7a6a" },
] as const;

const BID_AMOUNTS = [
  "0.50 ETH",
  "0.62 ETH",
  "0.85 ETH",
  "1.15 ETH",
  "1.25 ETH",
  "2.10 ETH",
  "2.40 ETH",
  "3.20 ETH",
  "3.40 ETH",
] as const;

const COMPLETION_LEVELS = [35, 40, 55, 62, 75, 80, 88, 91] as const;

const MAX_ROWS = 6;
const ROW_ANIMATION_MS = 350;

function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T;
}

function randomTxHash(): string {
  return `0x${Math.random().toString(16).slice(2, 10)}`;
}

function createRandomActivity(isNew = false): ActivityRow {
  const collection = randomItem(COLLECTIONS);

  return {
    id: `act-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    wallet: randomItem(WALLETS),
    bidAmount: randomItem(BID_AMOUNTS),
    collection: collection.name,
    collectionColor: collection.color,
    completion: randomItem(COMPLETION_LEVELS),
    txHash: randomTxHash(),
    isNew,
  };
}

function ActivityProgressBar({
  target,
  delay = 0,
}: {
  target: number;
  delay?: number;
}) {
  const [width, setWidth] = useState(0);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      const timer = window.setTimeout(() => {
        setWidth(target);
        hasMounted.current = true;
      }, 100 + delay);
      return () => window.clearTimeout(timer);
    }

    setWidth(target);
  }, [delay, target]);

  return (
    <div className="flex items-center gap-2">
      <div className="h-1 max-w-[88px] flex-1 overflow-hidden rounded-[2px] bg-[var(--cream-dark)] sm:max-w-[120px]">
        <div
          className="h-full rounded-[2px] bg-[var(--olive)] transition-[width] duration-700 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="whitespace-nowrap font-mono text-micro text-t1 sm:text-caption">
        {target}%
      </span>
    </div>
  );
}

export function RealtimeActivityTable() {
  const [rows, setRows] = useState<ActivityRow[]>(() =>
    poolActivity.map((row) => ({ ...row, isNew: false })),
  );
  const timeoutRef = useRef<number | null>(null);

  const scheduleNextUpdate = useCallback(() => {
    timeoutRef.current = window.setTimeout(() => {
      setRows((prev) => {
        const nextRow = createRandomActivity(true);
        const updated = prev.map((row, index) =>
          index === 0
            ? {
                ...row,
                completion: Math.min(
                  99,
                  row.completion + (Math.random() < 0.5 ? 1 : 2),
                ),
              }
            : row,
        );

        return [nextRow, ...updated].slice(0, MAX_ROWS);
      });

      scheduleNextUpdate();
    }, 2500 + Math.random() * 2500);
  }, []);

  useEffect(() => {
    scheduleNextUpdate();
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [scheduleNextUpdate]);

  useEffect(() => {
    const hasNew = rows.some((row) => row.isNew);
    if (!hasNew) {
      return;
    }

    const timer = window.setTimeout(() => {
      setRows((prev) => prev.map((row) => ({ ...row, isNew: false })));
    }, ROW_ANIMATION_MS);

    return () => window.clearTimeout(timer);
  }, [rows]);

  return (
    <section className="mb-4 overflow-hidden rounded-[var(--r)] bg-e2 shadow-[var(--sh1),var(--glow)]">
      <div className="flex items-center justify-between gap-2 border-b border-bd0 px-3 py-2 sm:px-4 sm:py-3">
        <h2 className="min-w-0 font-mono text-micro uppercase tracking-[0.08em] text-t1 sm:text-caption sm:tracking-[0.1em]">
          Real-Time Activity
        </h2>
        <span className="flex shrink-0 items-center gap-1.5 font-mono text-micro text-green sm:text-caption">
          <span
            className="size-[5px] animate-pulse rounded-full bg-green"
            aria-hidden
          />
          Real-Time
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse">
          <thead>
            <tr className="bg-e3">
              {["Wallet", "Bid Amount", "Collection", "Completion", "Action"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="border-b border-bd0 px-2 py-1.5 text-left font-mono text-micro font-medium uppercase tracking-[0.08em] text-t0 sm:px-4 sm:py-2 sm:text-caption"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id}
                className={cn(
                  "transition-colors hover:bg-e3",
                  row.isNew && "activity-row-new",
                )}
              >
                <td className="border-b border-bd0 px-2 py-2 font-mono text-caption font-medium text-t3 last:border-b-0 sm:px-4 sm:py-2.5 sm:text-label">
                  {row.wallet}
                </td>
                <td className="border-b border-bd0 px-2 py-2 font-mono text-caption font-bold text-t4 last:border-b-0 sm:px-4 sm:py-2.5 sm:text-body-sm">
                  {row.bidAmount}
                </td>
                <td className="border-b border-bd0 px-2 py-2 last:border-b-0 sm:px-4 sm:py-2.5">
                  <span className="flex min-w-[120px] items-center gap-1.5">
                    <span
                      className="size-1.5 shrink-0 rounded-[2px] sm:size-2"
                      style={{ background: row.collectionColor }}
                      aria-hidden
                    />
                    <span className="text-caption text-t2 sm:text-label">{row.collection}</span>
                  </span>
                </td>
                <td className="border-b border-bd0 px-2 py-2 last:border-b-0 sm:px-4 sm:py-2.5">
                  <ActivityProgressBar
                    target={row.completion}
                    delay={index * 100}
                  />
                </td>
                <td className="border-b border-bd0 px-2 py-2 last:border-b-0 sm:px-4 sm:py-2.5">
                  <Link
                    href={`https://etherscan.io/tx/${row.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whitespace-nowrap border-b border-[var(--sage-faint)] font-mono text-micro tracking-[0.05em] text-[var(--olive)] sm:text-caption"
                  >
                    VIEW TX
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
