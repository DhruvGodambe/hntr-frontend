import Link from "next/link";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
};

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  actionHref = "#",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-[11px] flex flex-wrap items-baseline justify-between gap-3",
        className,
      )}
    >
      <div>
        <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.1em] text-t4">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-[9px] text-t0">{subtitle}</p>
        )}
      </div>
      {actionLabel && (
        <Link
          href={actionHref}
          className="border-b border-[var(--sage-faint)] pb-px font-mono text-[9px] tracking-[0.04em] text-accent transition-colors hover:text-[var(--olive-dark)]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
