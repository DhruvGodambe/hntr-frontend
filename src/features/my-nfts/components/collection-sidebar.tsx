"use client";

import { ChevronDown } from "lucide-react";
import {
  collectionFilters,
  portfolioDistribution,
} from "@/features/my-nfts/data/collection-data";
import { cn } from "@/lib/utils";

type CollectionSidebarProps = {
  selected: Set<string>;
  onToggle: (id: string) => void;
  className?: string;
};

export function CollectionSidebar({
  selected,
  onToggle,
  className,
}: CollectionSidebarProps) {
  return (
    <aside
      className={cn(
        "flex w-full shrink-0 flex-col gap-2.5 sm:grid sm:grid-cols-2 sm:gap-2.5 lg:flex lg:w-[180px] lg:flex-col",
        className,
      )}
    >
      <div className="rounded-[var(--r)] bg-e2 p-3.5 shadow-[var(--sh1),var(--glow)]">
        <div className="mb-2.5 flex items-center justify-between font-display text-label font-bold text-t4">
          Collections
          <ChevronDown className="size-3.5 text-t2" aria-hidden />
        </div>
        <div className="space-y-1.5">
          {collectionFilters.map((filter) => {
            const checked = selected.has(filter.id);
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onToggle(filter.id)}
                className="flex w-full items-center gap-2 rounded px-0.5 py-1 text-left transition-colors hover:bg-e3"
              >
                <span
                  className={cn(
                    "flex size-3.5 shrink-0 items-center justify-center rounded-[2px] border-[1.5px] border-[var(--sage-faint)] transition-colors",
                    checked && "border-[var(--olive)] bg-[var(--olive)] text-[var(--cream)]",
                  )}
                  aria-hidden
                >
                  {checked && (
                    <span className="text-[8px] leading-none">✓</span>
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-caption text-t3">
                  {filter.name}
                </span>
                <span className="font-mono text-caption text-t0">{filter.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[var(--r)] bg-e2 p-3.5 shadow-[var(--sh1),var(--glow)]">
        <p className="mb-2.5 font-display text-caption font-bold uppercase tracking-[0.1em] text-t1">
          My NFT Distribution
        </p>
        <div className="mb-2 mt-1 flex h-1.5 overflow-hidden rounded-[3px] bg-[var(--cream-dark)]">
          {portfolioDistribution.map((segment) => (
            <div
              key={segment.label}
              className="h-full transition-[width] duration-300"
              style={{
                width: `${segment.percent}%`,
                background: segment.color,
              }}
              title={`${segment.label} ${segment.percent}%`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {portfolioDistribution.map((segment) => (
            <div
              key={segment.label}
              className="flex items-center gap-1 font-mono text-caption text-t1"
            >
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ background: segment.color }}
                aria-hidden
              />
              {segment.label.toUpperCase()}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
