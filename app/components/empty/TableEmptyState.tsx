import EmptyOverlay from "./EmptyOverlay";

const BAR_WIDTHS = ["62%", "44%", "38%", "50%", "34%", "46%", "40%"];

type TableEmptyStateProps = {
  columns?: string[];
  rowCount?: number;
  tableClassName?: string;
  /** Overlay only, for mobile card lists that have no table markup. */
  compact?: boolean;
  title?: string;
  sub?: string;
};

export default function TableEmptyState({
  columns,
  rowCount = 5,
  tableClassName = "net-table",
  compact = false,
  title = "No results found",
  sub = "Launching soon",
}: TableEmptyStateProps) {
  const overlay = <EmptyOverlay title={title} sub={sub} variant="table" />;

  if (compact) {
    return (
      <div className="nempty nempty-compact" role="status" aria-live="polite">
        {overlay}
      </div>
    );
  }

  const colCount = columns?.length ?? 5;

  return (
    <div className="nempty" role="status" aria-live="polite">
      <table className={tableClassName} aria-hidden="true">
        {columns ? (
          <thead>
            <tr>
              {columns.map((head) => (
                <th key={head}>{head}</th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {Array.from({ length: rowCount }, (_, rowIdx) => (
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
