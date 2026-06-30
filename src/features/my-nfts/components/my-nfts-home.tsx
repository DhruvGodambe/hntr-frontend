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
    <div className="-mx-2 -mt-3 flex flex-col pb-8 sm:-mx-4 sm:-mt-4 sm:pb-10">
      <CollectionHero />
      <div className="px-2 pt-4 sm:px-5 sm:pt-[18px]">
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
