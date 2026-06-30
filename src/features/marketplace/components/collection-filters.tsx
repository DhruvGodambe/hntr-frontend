"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  collectionFilters,
  portfolioDistribution,
} from "@/features/marketplace/data/vault-data";
import { FilterCheckbox } from "@/components/ui/filter-checkbox";
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
  const [collectionsOpen, setCollectionsOpen] = React.useState(false);

  return (
    <aside className={cn("shrink-0 space-y-4", className)}>
      <div className="rounded-md border border-border bg-e2 p-3 shadow-sh1">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-mono text-[8px] uppercase tracking-[0.08em] text-t0">
            Collections
          </h2>
          <button
            type="button"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-[3px] text-t2 transition-colors hover:text-t4 lg:hidden"
            aria-expanded={collectionsOpen}
            aria-controls="marketplace-collection-filters"
            aria-label={collectionsOpen ? "Collapse collections" : "Expand collections"}
            onClick={() => setCollectionsOpen((open) => !open)}
          >
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform duration-200",
                collectionsOpen && "rotate-180",
              )}
              strokeWidth={1.75}
            />
          </button>
        </div>
        <ul
          id="marketplace-collection-filters"
          className={cn(
            "space-y-2",
            collectionsOpen ? "block" : "hidden lg:block",
          )}
        >
          {collectionFilters.map((collection) => {
            const checked = selected.has(collection.id);
            return (
              <li key={collection.id}>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(collection.id)}
                    className="sr-only"
                  />
                  <FilterCheckbox checked={checked} />
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

      <div className="rounded-md bg-e2 p-3.5 shadow-sh1 [box-shadow:var(--sh1),var(--glow)]">
        <h2 className="mb-2.5 font-display text-caption font-bold uppercase tracking-[0.1em] text-t1">
          Portfolio Distribution
        </h2>
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
