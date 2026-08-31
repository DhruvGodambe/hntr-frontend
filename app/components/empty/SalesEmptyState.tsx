import EmptyOverlay from "./EmptyOverlay";
import SkeletonCard from "./SkeletonCard";

const SALES_BARS = [
  ["78%", "34%"],
  ["70%", "30%"],
  ["82%", "26%"],
  ["66%", "32%"],
  ["74%", "28%"],
  ["80%", "36%"],
] as const;

export default function SalesEmptyState() {
  return (
    <div className="sempty" role="status" aria-live="polite">
      <div className="sales-marquee sempty-marquee" aria-hidden="true">
        <div className="sales-track">
          {/* Duplicated so the -50% marquee keyframe loops seamlessly */}
          {[...SALES_BARS, ...SALES_BARS].map((bars, i) => (
            <SkeletonCard key={i} bars={bars} className="sempty-card" />
          ))}
        </div>
      </div>
      <EmptyOverlay title="No Sales found" sub="Launching soon" />
    </div>
  );
}
