type EmptyOverlayProps = {
  title: string;
  sub: string;
  variant?: "grid" | "table";
};

export default function EmptyOverlay({ title, sub, variant = "grid" }: EmptyOverlayProps) {
  const prefix = variant === "table" ? "nempty" : "lempty";

  return (
    <>
      <div className={`${prefix}-fade`} />
      <div className={`${prefix}-msg`}>
        <div className="lempty-title">{title}</div>
        <div className="lempty-sub">{sub}</div>
      </div>
    </>
  );
}
