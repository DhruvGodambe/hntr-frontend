import EmptyOverlay from "./EmptyOverlay";

type ActivityEmptyStateProps = {
  rowCount?: number;
};

export default function ActivityEmptyState({ rowCount = 6 }: ActivityEmptyStateProps) {
  return (
    <div className="arow-skel-wrap" role="status" aria-live="polite">
      <div>
        {Array.from({ length: rowCount }, (_, i) => (
          <div className="arow-skel-row" key={i}>
            <div className="arow-shimmer arow-skel-icon" />
            <div className="arow-skel-lines">
              <div className="arow-shimmer arow-skel-line" />
              <div className="arow-shimmer arow-skel-line short" />
            </div>
            <div className="arow-shimmer arow-skel-value" />
          </div>
        ))}
      </div>
      <EmptyOverlay title="No results found" sub="Launching soon" variant="table" />
    </div>
  );
}
