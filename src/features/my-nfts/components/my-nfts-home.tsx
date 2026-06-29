"use client";

import * as React from "react";
import { collectionFilters } from "@/features/my-nfts/data/collection-data";
import { CollectionHero } from "./collection-hero";
import { CollectionNFTGrid } from "./collection-nft-grid";
import { CollectionSidebar } from "./collection-sidebar";
import { CollectionStatsRow } from "./collection-stats-row";
import { PositionsBreakdownTable } from "./positions-breakdown-table";

export function MyNFTsHome() {
  const [selected, setSelected] = React.useState<Set<string>>(
    () => new Set(collectionFilters.slice(0, 2).map((c) => c.id)),
  );

  const toggleCollection = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="-mx-3 -mt-4 flex flex-col pb-10 sm:-mx-4">
      <CollectionHero />
      <div className="px-3 pt-[18px] sm:px-5">
        <CollectionStatsRow />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-4">
          <CollectionSidebar selected={selected} onToggle={toggleCollection} />
          <CollectionNFTGrid selectedCollections={selected} />
        </div>
        <PositionsBreakdownTable />
      </div>
    </div>
  );
}
