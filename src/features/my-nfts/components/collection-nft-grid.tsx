"use client";

import * as React from "react";
import { ownedNfts } from "@/features/my-nfts/data/collection-data";
import { CollectionNFTCard } from "./collection-nft-card";

type CollectionNFTGridProps = {
  selectedCollections: Set<string>;
};

export function CollectionNFTGrid({ selectedCollections }: CollectionNFTGridProps) {
  const [visibleCount, setVisibleCount] = React.useState(8);

  const filtered = React.useMemo(
    () => ownedNfts.filter((nft) => selectedCollections.has(nft.collectionId)),
    [selectedCollections],
  );
  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-caption font-bold tracking-[0.01em] text-t4 sm:text-body-sm">
          Current Co-Owned NFTs
        </h2>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3">
        {visible.map((nft, index) => (
          <CollectionNFTCard key={nft.id} nft={nft} index={index} />
        ))}
      </div>

      {visibleCount < filtered.length && (
        <div className="mb-5 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + 3)}
            className="h-8 min-w-[140px] rounded-[5px] border border-[var(--cream-dark)] bg-transparent px-7 font-mono text-caption text-t2 transition-colors hover:bg-e3 hover:text-t4"
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
}
