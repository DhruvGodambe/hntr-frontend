import EmptyOverlay from "./EmptyOverlay";

const BAR_WIDTHS = ["62%", "44%", "38%", "50%", "34%", "46%", "40%"];

type TableEmptyStateProps = {
  columns?: string[];
  rowCount?: number;
  tableClassName?: string;
  /** Scaled-down variant for the mobile card lists. */
  compact?: boolean;
  /** How many of `columns` the compact variant keeps before it gets too cramped. */
  compactColumns?: number;
  title?: string;
  sub?: string;
};

export default function TableEmptyState({
  columns,
  rowCount = 5,
  tableClassName = "net-table",
  compact = false,
  compactColumns = 3,
  title = "No results found",
  sub = "Launching soon",
}: TableEmptyStateProps) {
  const overlay = <EmptyOverlay title={title} sub={sub} variant="table" />;

  const heads = compact ? columns?.slice(0, compactColumns) : columns;
  const colCount = heads?.length ?? (compact ? compactColumns : 5);
  const rows = compact ? Math.min(rowCount, 4) : rowCount;

  return (
    <div className={compact ? "nempty nempty-compact" : "nempty"} role="status" aria-live="polite">
      <table className={compact ? "nempty-mini" : tableClassName} aria-hidden="true">
        {heads ? (
          <thead>
            <tr>
              {heads.map((head) => (
                <th key={head}>{head}</th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {Array.from({ length: rows }, (_, rowIdx) => (
            <tr className="nempty-row" key={rowIdx}>
              {Array.from({ length: colCount }, (_, colIdx) => (
                <td key={colIdx}>
                  <div className="ne-bar" style={{ width: BAR_WIDTHS[colIdx % BAR_WIDTHS.length] }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {overlay}
    </div>
  );
}
