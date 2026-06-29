import Link from "next/link";
import type { OwnedNFT } from "@/features/my-nfts/data/collection-data";
import { nftPlaceholder } from "@/lib/placeholders";
import { cn } from "@/lib/utils";
import { OwnershipRing } from "./ownership-ring";

type CollectionNFTCardProps = {
  nft: OwnedNFT;
  index?: number;
};

export function CollectionNFTCard({ nft, index = 0 }: CollectionNFTCardProps) {
  const profitPositive = nft.profit.startsWith("+");

  return (
    <article
      className="nc-reveal flex flex-col overflow-hidden rounded-[var(--r)] border border-bd1 bg-e2 shadow-[var(--sh2),var(--glow)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-sh3"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="relative aspect-square overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={nftPlaceholder(nft.imageSeed)}
          alt=""
          className="h-full w-full object-cover"
        />
        <span className="absolute left-2 top-2 rounded-[3px] bg-black/55 px-1.5 py-0.5 font-mono text-caption tracking-[0.08em] text-white/85 backdrop-blur-sm">
          {nft.poolTag}
        </span>
        <OwnershipRing percent={nft.sharePercent} />
      </div>

      <div className="flex flex-1 flex-col px-2.5 pb-0 pt-2.5">
        <h3 className="font-display text-label font-bold leading-tight text-t4">
          {nft.name}
        </h3>
        <p className="mb-2 font-mono text-caption tracking-[0.05em] text-t0">
          {nft.tokenId}
        </p>

        <div className="mb-2 flex justify-between gap-2">
          <div>
            <p className="mb-0.5 font-mono text-caption uppercase tracking-[0.06em] text-t0">
              Listed Price
            </p>
            <p className="font-mono text-label font-bold text-t4">
              {nft.listedPriceEth}{" "}
              <span className="text-caption font-normal text-t2">ETH</span>
            </p>
            <p className="mt-1 font-mono text-caption text-t1">{nft.listedPriceUsd}</p>
          </div>
          <div className="text-right">
            <p className="mb-0.5 font-mono text-caption uppercase tracking-[0.06em] text-t0">
              My Share
            </p>
            <p className="font-mono text-label font-bold text-t4">
              {nft.shareValueEth}{" "}
              <span className="text-caption font-normal text-t2">ETH</span>
            </p>
          </div>
        </div>

        <div className="mb-1.5 h-px bg-bd0" />

        <div className="flex items-center justify-between pb-2">
          <p
            className={cn(
              "font-mono text-label font-bold",
              profitPositive ? "text-green" : "text-red",
            )}
          >
            {nft.profit}
          </p>
          <span
            className={cn(
              "size-1.5 rounded-full",
              nft.status === "listed"
                ? "bg-green shadow-[0_0_5px_rgba(26,157,95,0.5)]"
                : "bg-red",
            )}
            aria-hidden
          />
        </div>
      </div>

      <Link
        href={`/pools/${nft.poolId}`}
        className="flex h-7 w-full items-center justify-center border-t border-bd0 bg-e3 font-mono text-caption tracking-[0.08em] text-t2 transition-colors hover:bg-[var(--sage-faint)] hover:text-t4"
      >
        View NFT
      </Link>
    </article>
  );
}
