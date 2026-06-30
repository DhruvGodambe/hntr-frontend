import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const MOSAIC_CELLS = 60;

export type PageHeroProps = {
  title: string;
  subtitle: string;
  variant?: "media" | "mosaic";
  imageSrc?: string;
  action?: ReactNode;
  className?: string;
  rounded?: boolean;
};

export function PageHero({
  title,
  subtitle,
  variant = "mosaic",
  imageSrc,
  action,
  className,
  rounded = false,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "page-hero",
        variant === "media" && "page-hero--media",
        variant === "mosaic" && "page-hero--mosaic",
        rounded && "rounded-md",
        className,
      )}
    >
      {variant === "media" && imageSrc ? (
        <div className="page-hero__media" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageSrc} alt="" />
          <div className="page-hero__media-fade" />
        </div>
      ) : null}

      {variant === "mosaic" ? (
        <div className="page-hero__mosaic" aria-hidden>
          {Array.from({ length: MOSAIC_CELLS }).map((_, index) => (
            <div key={index} className="page-hero__mosaic-cell" />
          ))}
        </div>
      ) : null}

      <div className="page-hero__content">
        <h1 className="page-hero__title">{title}</h1>
        <p className="page-hero__subtitle">{subtitle}</p>
        {action ? <div className="page-hero__action">{action}</div> : null}
      </div>
    </section>
  );
}
