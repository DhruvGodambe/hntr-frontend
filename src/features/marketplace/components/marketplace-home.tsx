import { VaultHero } from "./vault-hero";
import { VaultMetricsRow } from "./vault-metrics-row";
import { VaultNFTGrid } from "./vault-nft-grid";

export function MarketplaceHome() {
  return (
    <>
      <VaultHero />
      <VaultMetricsRow />
      <VaultNFTGrid />
      <footer className="border-t border-border pt-4 font-mono text-[8px] uppercase tracking-[0.06em] text-t0">
        © 2024 HNTR INSTITUTIONAL | TERMINAL STATUS: OPTIMAL
      </footer>
    </>
  );
}
