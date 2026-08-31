type SkeletonCardProps = {
  bars: readonly [string, string];
  className?: string;
  imgClassName?: string;
  children?: React.ReactNode;
};

export default function SkeletonCard({
  bars,
  className = "lempty-card",
  imgClassName = "lempty-img",
  children,
}: SkeletonCardProps) {
  return (
    <div className={className}>
      <div className={imgClassName}>{children}</div>
      <div className="lempty-meta">
        <div className="lempty-bar" style={{ width: bars[0] }} />
        <div className="lempty-bar" style={{ width: bars[1] }} />
      </div>
    </div>
  );
}
