import EmptyOverlay from "./EmptyOverlay";
import SkeletonCard from "./SkeletonCard";

const VAULT_BARS = [
  ["78%", "34%"],
  ["70%", "30%"],
  ["82%", "26%"],
  ["66%", "32%"],
  ["78%", "34%"],
  ["70%", "30%"],
  ["82%", "26%"],
  ["66%", "32%"],
] as const;

export default function VaultEmptyState() {
  return (
    <div className="lempty vempty" role="status" aria-live="polite">
      <div className="lempty-grid vempty-grid" aria-hidden="true">
        {VAULT_BARS.map((bars, i) => (
          <SkeletonCard key={i} bars={bars} />
        ))}
      </div>
      <EmptyOverlay title="No items found" sub="Launching soon" />
    </div>
  );
}
