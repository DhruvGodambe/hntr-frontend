import EmptyOverlay from "./EmptyOverlay";
import SkeletonCard from "./SkeletonCard";

const LISTING_BARS = [
  ["78%", "34%"],
  ["70%", "30%"],
  ["82%", "26%"],
  ["66%", "32%"],
  ["74%", "28%"],
] as const;

export default function ListingsEmptyState() {
  return (
    <div className="lempty" role="status" aria-live="polite">
      <div className="lempty-grid" aria-hidden="true">
        {LISTING_BARS.map((bars, i) => (
          <SkeletonCard key={i} bars={bars} />
        ))}
      </div>
      <EmptyOverlay title="No items found" sub="Launching soon" />
    </div>
  );
}
