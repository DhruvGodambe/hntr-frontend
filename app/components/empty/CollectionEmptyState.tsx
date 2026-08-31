import EmptyOverlay from "./EmptyOverlay";
import SkeletonCard from "./SkeletonCard";

const COLLECTION_BARS = [
  ["72%", "30%"],
  ["64%", "36%"],
  ["80%", "28%"],
  ["68%", "32%"],
  ["72%", "30%"],
  ["64%", "36%"],
  ["80%", "28%"],
  ["68%", "32%"],
] as const;

export default function CollectionEmptyState() {
  return (
    <div className="lempty ncempty" role="status" aria-live="polite">
      <div className="lempty-grid ncempty-grid" aria-hidden="true">
        {COLLECTION_BARS.map((bars, i) => (
          <SkeletonCard key={i} bars={bars} className="ncempty-card" imgClassName="ncempty-img">
            <div className="nc-ring-wrap">
              <svg className="nc-ring-svg" viewBox="0 0 80 80" width="70" height="70">
                <circle className="nc-ring-bg" cx="40" cy="40" r="32" />
              </svg>
            </div>
          </SkeletonCard>
        ))}
      </div>
      <EmptyOverlay title="No Items found" sub="Launching soon" />
    </div>
  );
}
