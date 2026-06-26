"use client";

import * as React from "react";
import {
  collectionFilters,
  portfolioDistribution,
} from "@/features/marketplace/data/vault-data";
import { cn } from "@/lib/utils";

type CollectionFiltersProps = {
  selected: Set<string>;
  onToggle: (id: string) => void;
  className?: string;
};

export function CollectionFilters({
  selected,
  onToggle,
  className,
}: CollectionFiltersProps) {
  return (
    <aside className={cn("shrink-0 space-y-4", className)}>
      <div className="rounded-md border border-border bg-e2 p-3 shadow-sh1">
        <h2 className="mb-3 font-mono text-[8px] uppercase tracking-[0.08em] text-t0">
          Collections
        </h2>
        <ul className="space-y-2">
          {collectionFilters.map((collection) => {
            const checked = selected.has(collection.id);
            return (
              <li key={collection.id}>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(collection.id)}
                    className="size-3 rounded-sm border-border accent-[var(--olive)]"
                  />
                  <span className="min-w-0 flex-1 truncate text-[9px] text-t3">
                    {collection.name}
                  </span>
                  <span className="font-mono text-[8px] text-t0">
                    {collection.count}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-md border border-border bg-e2 p-3 shadow-sh1">
        <h2 className="mb-3 font-mono text-[8px] uppercase tracking-[0.08em] text-t0">
          Portfolio Distribution
        </h2>
        <div className="mb-2 flex h-2 overflow-hidden rounded-[2px] bg-e4">
          {portfolioDistribution.map((segment) => (
            <div
              key={segment.label}
              className={cn("h-full", segment.colorClass)}
              style={{ width: `${segment.percent}%` }}
              title={`${segment.label} ${segment.percent}%`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {portfolioDistribution.map((segment) => (
            <span
              key={segment.label}
              className="font-mono text-[7px] uppercase tracking-[0.06em] text-t1"
            >
              {segment.label} {segment.percent}%
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
