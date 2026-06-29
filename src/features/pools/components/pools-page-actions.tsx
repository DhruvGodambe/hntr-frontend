function FilterIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M1 3h10M3 6h6M5 9h2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M6 1v7M3 5l3 3 3-3M2 10h8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PoolsPageActions() {
  return (
    <div className="mb-3.5 flex items-center justify-end gap-2">
      <button
        type="button"
        className="flex h-[30px] items-center gap-1.5 rounded-[5px] bg-e2 px-3.5 font-mono text-caption tracking-[0.06em] text-t2 shadow-[var(--sh1),var(--glow)] transition-colors hover:bg-[var(--sage-faint)] hover:text-t4"
      >
        <FilterIcon />
        Filter
      </button>
      <button
        type="button"
        className="flex h-[30px] items-center gap-1.5 rounded-[5px] bg-e2 px-3.5 font-mono text-caption tracking-[0.06em] text-t2 shadow-[var(--sh1),var(--glow)] transition-colors hover:bg-[var(--sage-faint)] hover:text-t4"
      >
        <ExportIcon />
        Export
      </button>
    </div>
  );
}
