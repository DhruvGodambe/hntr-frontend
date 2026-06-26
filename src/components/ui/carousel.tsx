"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import type { Swiper as SwiperType } from "swiper";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { cn } from "@/lib/utils";

import "swiper/css";

type CarouselLayout = "inline" | "pools" | "cards";

const layoutPresets: Record<
  Exclude<CarouselLayout, "inline">,
  {
    slidesPerView: number;
    slidesPerGroup: number;
    breakpoints: Record<number, { slidesPerView: number; slidesPerGroup?: number }>;
  }
> = {
  pools: {
    slidesPerView: 1,
    slidesPerGroup: 1,
    breakpoints: {
      640: { slidesPerView: 2, slidesPerGroup: 2 },
    },
  },
  cards: {
    slidesPerView: 1,
    slidesPerGroup: 1,
    breakpoints: {
      640: { slidesPerView: 2, slidesPerGroup: 2 },
      1024: { slidesPerView: 4, slidesPerGroup: 4 },
    },
  },
};

type CarouselProps = {
  children: React.ReactNode;
  className?: string;
  fadeRight?: boolean;
  layout?: CarouselLayout;
  spaceBetween?: number;
  slidesPerView?: number | "auto";
  slidesPerGroup?: number;
  breakpoints?: Record<
    number,
    { slidesPerView: number; slidesPerGroup?: number }
  >;
};

function NavButton({
  direction,
  disabled,
  onClick,
  className,
  label,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
  className?: string;
  label: string;
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className={cn(
        "flex size-8 items-center justify-center rounded-full border border-border bg-e2 text-t3 shadow-sh1 transition-opacity disabled:pointer-events-none disabled:opacity-30",
        className,
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

export function Carousel({
  children,
  className,
  fadeRight = false,
  layout = "inline",
  spaceBetween = 10,
  slidesPerView: slidesPerViewProp,
  slidesPerGroup: slidesPerGroupProp,
  breakpoints: breakpointsProp,
}: CarouselProps) {
  const swiperRef = React.useRef<SwiperType | null>(null);
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);
  const slides = React.Children.toArray(children);

  const preset = layout !== "inline" ? layoutPresets[layout] : undefined;

  const isFixedLayout =
    layout === "pools" || layout === "cards" || slidesPerViewProp !== undefined;
  const slidesPerView =
    slidesPerViewProp ?? preset?.slidesPerView ?? (layout === "pools" ? 1 : "auto");
  const slidesPerGroup =
    slidesPerGroupProp ?? preset?.slidesPerGroup ?? 1;
  const breakpoints =
    breakpointsProp ?? preset?.breakpoints;

  const updateNav = React.useCallback((swiper: SwiperType) => {
    setCanPrev(!swiper.isBeginning);
    setCanNext(!swiper.isEnd);
  }, []);

  const slideBy = (direction: "left" | "right") => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    if (direction === "left") {
      swiper.slidePrev();
    } else {
      swiper.slideNext();
    }
  };

  const swiperNode = (
    <Swiper
      modules={isFixedLayout ? [] : [FreeMode]}
      freeMode={
        isFixedLayout ? undefined : { enabled: true, momentumRatio: 0.4 }
      }
      spaceBetween={spaceBetween}
      slidesPerView={slidesPerView}
      slidesPerGroup={slidesPerGroup}
      breakpoints={breakpoints}
      watchOverflow
      onSwiper={(swiper) => {
        swiperRef.current = swiper;
        updateNav(swiper);
      }}
      onSlideChange={updateNav}
      onResize={updateNav}
      onReachBeginning={() => setCanPrev(false)}
      onReachEnd={() => setCanNext(false)}
      onFromEdge={updateNav}
      className="carousel-swiper !overflow-hidden"
    >
      {slides.map((child, index) => (
        <SwiperSlide
          key={index}
          className={isFixedLayout ? "!h-auto" : "!w-auto"}
        >
          {child}
        </SwiperSlide>
      ))}
    </Swiper>
  );

  if (layout === "pools") {
    return (
      <div
        className={cn(
          "flex overflow-hidden rounded-md border border-border bg-e2 shadow-sh2 [box-shadow:var(--sh2),var(--glow)]",
          className,
        )}
      >
        <div className="min-w-0 flex-1 overflow-hidden p-3">{swiperNode}</div>
        <div className="flex w-12 shrink-0 flex-col items-center justify-center gap-2 border-l border-border bg-[var(--slider-rail-bg)]">
          <NavButton
            direction="left"
            disabled={!canPrev}
            onClick={() => slideBy("left")}
            label="Previous slide"
          />
          <NavButton
            direction="right"
            disabled={!canNext}
            onClick={() => slideBy("right")}
            label="Next slide"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <NavButton
        direction="left"
        disabled={!canPrev}
        onClick={() => slideBy("left")}
        label="Previous slide"
        className={cn(
          "absolute left-1 top-1/2 z-10 hidden -translate-y-1/2 sm:inline-flex",
          !canPrev && "opacity-0",
        )}
      />

      {swiperNode}

      {fadeRight && (
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-[1] w-16 bg-gradient-to-l from-e0 to-transparent transition-opacity",
            canNext ? "opacity-100" : "opacity-0",
          )}
          aria-hidden
        />
      )}

      <NavButton
        direction="right"
        disabled={!canNext}
        onClick={() => slideBy("right")}
        label="Next slide"
        className={cn(
          "absolute right-1 top-1/2 z-10 hidden -translate-y-1/2 sm:inline-flex",
          !canNext && "opacity-0",
        )}
      />
    </div>
  );
}
