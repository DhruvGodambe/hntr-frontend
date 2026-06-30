"use client";

import * as React from "react";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { collectionFilters, networkActivity, vaultNfts } from "@/features/marketplace/data/vault-data";
import { nftPlaceholder } from "@/lib/placeholders";
import { CollectionFilters } from "./collection-filters";
import { NetworkActivityTable } from "./network-activity-table";
import { VaultNFTCard } from "./vault-nft-card";
import { cn } from "@/lib/utils";

const sortOptions = [
  { value: "floor-high", label: "Floor High to Low" },
  { value: "floor-low", label: "Floor Low to High" },
  { value: "apy-high", label: "APY High to Low" },
  { value: "newest", label: "Newest" },
] as const;

function parseEth(value: string): number {
  return parseFloat(value.replace(/[^\d.]/g, "")) || 0;
}

function parseApy(value: string): number {
  return parseFloat(value.replace(/[^\d.-]/g, "")) || 0;
}

export function VaultNFTGrid() {
  const [selectedCollections, setSelectedCollections] = React.useState<
    Set<string>
  >(() => new Set(collectionFilters.map((c) => c.id)));
  const [sort, setSort] = React.useState<(typeof sortOptions)[number]["value"]>(
    "floor-high",
  );
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [visibleCount, setVisibleCount] = React.useState(8);

  const activeView = view;

  const toggleCollection = (id: string) => {
    setSelectedCollections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filtered = React.useMemo(() => {
    let items = vaultNfts.filter((nft) =>
      selectedCollections.has(nft.collectionId),
    );

    items = [...items].sort((a, b) => {
      switch (sort) {
        case "floor-low":
          return parseEth(a.sellPrice) - parseEth(b.sellPrice);
        case "apy-high":
          return parseApy(b.apy) - parseApy(a.apy);
        case "newest":
          return Number(b.id) - Number(a.id);
        case "floor-high":
        default:
          return parseEth(b.sellPrice) - parseEth(a.sellPrice);
      }
    });

    return items;
  }, [selectedCollections, sort]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row">
      <CollectionFilters
        selected={selectedCollections}
        onToggle={toggleCollection}
        className="w-full lg:w-44"
      />

      <div className="min-w-0 flex-1">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <Select
            value={sort}
            onValueChange={(value) =>
              setSort(value as (typeof sortOptions)[number]["value"])
            }
          >
            <SelectTrigger className="h-8 w-[180px] font-mono text-label">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="font-mono text-label"
                >
                  Sort: {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 rounded-md border border-border bg-e3 p-0.5">
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              className={cn(
                "flex size-7 items-center justify-center rounded-[3px] transition-colors",
                view === "grid" ? "bg-e2 text-t4 shadow-sh1" : "text-t1",
              )}
            >
              <LayoutGrid className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="List view"
              aria-pressed={view === "list"}
              className={cn(
                "flex size-7 items-center justify-center rounded-[3px] transition-colors",
                view === "list" ? "bg-e2 text-t4 shadow-sh1" : "text-t1",
              )}
            >
              <List className="size-3.5" />
            </button>
          </div>
        </div>

        {activeView === "grid" ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((nft) => (
              <VaultNFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {visible.map((nft) => (
              <li
                key={nft.id}
                className="flex items-center gap-3 rounded-md border border-border bg-e2 p-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={nftPlaceholder(nft.imageSeed, 80)}
                  alt=""
                  className="size-12 shrink-0 rounded-sm object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-label font-bold text-t4">
                    {nft.name}
                  </p>
                  <p className="font-mono text-caption text-t2">
                    {nft.boughtPrice} → {nft.sellPrice} · {nft.apy}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {visibleCount < filtered.length && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="secondary"
              className="h-8 min-w-[140px] font-mono text-label normal-case tracking-normal"
              onClick={() => setVisibleCount((c) => c + 4)}
            >
              Show More
            </Button>
          </div>
        )}

        <NetworkActivityTable className="mt-6" rows={networkActivity} showViewAll />
      </div>
    </div>
  );
}
