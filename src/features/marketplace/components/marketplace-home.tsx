import { VaultHero } from "./vault-hero";
import { VaultMetricsRow } from "./vault-metrics-row";
import { VaultNFTGrid } from "./vault-nft-grid";

export function MarketplaceHome() {
  return (
    <>
      <VaultHero />
      <VaultMetricsRow />
      <VaultNFTGrid />
    </>
  );
}
