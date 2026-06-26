import Link from "next/link";
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
      <article className="overflow-hidden rounded-md border border-border bg-e2 shadow-sh1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={nftPlaceholder(nft.imageSeed)}
          alt=""
          className="aspect-square w-full object-cover"
        />
        <div className="p-2.5">
          <h3 className="mb-2 font-mono text-[9px] font-bold text-t4">
            {nft.name}
          </h3>
          <div className="mb-1 flex justify-between gap-2">
            <span className="text-[8px] uppercase tracking-[0.04em] text-t0">
              Bought Price
            </span>
            <span className="font-mono text-[8px] text-t2">{nft.boughtPrice}</span>
          </div>
          <div className="mb-1 flex justify-between gap-2">
            <span className="text-[8px] uppercase tracking-[0.04em] text-t0">
              Sell Price
            </span>
            <span className="font-mono text-[8px] text-t2">{nft.sellPrice}</span>
          </div>
          <div className="mb-2 flex justify-between gap-2">
            <span className="text-[8px] uppercase tracking-[0.04em] text-t0">
              APY (Est)
            </span>
            <span className="font-mono text-[8px] text-green">{nft.apy}</span>
          </div>
          <span className="inline-flex h-[22px] w-full items-center justify-center rounded-[3px] border border-border bg-secondary font-mono text-[8px] normal-case tracking-normal text-secondary-foreground group-hover:bg-e3">
            View Listing
          </span>
        </div>
      </article>
    </Link>
  );
}
