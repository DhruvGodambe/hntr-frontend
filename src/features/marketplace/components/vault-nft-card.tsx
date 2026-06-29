import Link from "next/link";
import { MarketplaceSourceLogo } from "@/features/dashboard/components/marketplace-source-logo";
import type { VaultNFT } from "@/features/marketplace/data/vault-data";
import { nftPlaceholder } from "@/lib/placeholders";

type VaultNFTCardProps = {
  nft: VaultNFT;
};

export function VaultNFTCard({ nft }: VaultNFTCardProps) {
  return (
    <Link
      href={`/pools/${nft.poolId}`}
      className="group block transition-opacity hover:opacity-95"
    >
      <article className="relative overflow-hidden rounded-md bg-e2 shadow-sh2 transition-transform duration-200 [box-shadow:var(--sh2),var(--glow)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-sh3">
        <div className="relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={nftPlaceholder(nft.imageSeed)}
            alt=""
            className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
          <MarketplaceSourceLogo source={nft.source} />
          <div
            className="absolute inset-0 z-[2] flex items-center justify-center bg-[rgba(94,107,85,0.45)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            aria-hidden
          >
            <span className="rounded-[3px] border border-[rgba(242,239,234,0.6)] px-2.5 py-1 font-mono text-caption font-bold tracking-[0.1em] text-[var(--cream)]">
              VIEW
            </span>
          </div>
        </div>
        <div className="p-2.5 sm:p-3">
          <h3 className="mb-2 font-mono text-label font-bold text-t4">
            {nft.name}
          </h3>
          <div className="mb-1 flex justify-between gap-2">
            <span className="text-caption uppercase tracking-[0.04em] text-t1">
              Bought Price
            </span>
            <span className="font-mono text-caption text-t3">{nft.boughtPrice}</span>
          </div>
          <div className="mb-1 flex justify-between gap-2">
            <span className="text-caption uppercase tracking-[0.04em] text-t1">
              Sell Price
            </span>
            <span className="font-mono text-caption text-t3">{nft.sellPrice}</span>
          </div>
          <div className="mb-2 flex justify-between gap-2">
            <span className="text-caption uppercase tracking-[0.04em] text-t1">
              APY (Est)
            </span>
            <span className="font-mono text-caption font-semibold text-green">
              {nft.apy}
            </span>
          </div>
          <span className="inline-flex h-7 w-full items-center justify-center rounded-[3px] bg-e3 font-mono text-caption normal-case tracking-normal text-t1 transition-colors group-hover:bg-[var(--sage-faint)] group-hover:text-t4">
            View Listing
          </span>
        </div>
      </article>
    </Link>
  );
}
