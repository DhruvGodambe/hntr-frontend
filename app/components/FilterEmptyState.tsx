"use client";

type FilterEmptyStateProps = {
  ghostCount?: number;
  variant?: "vault" | "nc";
  title?: string;
  sub?: string;
};

export default function FilterEmptyState({
  ghostCount = 4,
  variant = "vault",
  title = "No items found",
  sub = "Launchpad soon",
}: FilterEmptyStateProps) {
  const ghostClass =
    variant === "nc" ? "filter-empty-ghost filter-empty-ghost-nc" : "filter-empty-ghost";

  return (
    <div className="filter-empty" role="status" aria-live="polite">
      <div className="filter-empty-ghosts" aria-hidden="true">
        {Array.from({ length: ghostCount }, (_, i) => (
          <div key={i} className={ghostClass} />
        ))}
      </div>
      <div className="filter-empty-content">
        <div className="filter-empty-title">{title}</div>
        <div className="filter-empty-sub">{sub}</div>
      </div>
    </div>
  );
}
