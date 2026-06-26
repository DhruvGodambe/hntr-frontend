import { heroBackgroundImage } from "@/lib/images";

export function MembershipHero() {
  return (
    <section
      className="relative mb-4 h-[140px] overflow-hidden rounded-md border border-border bg-e3 shadow-sh2 sm:h-[158px]"
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={heroBackgroundImage()}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-e2/30 via-transparent to-e2/10 dark:from-e0/40 dark:to-e0/10" />
    </section>
  );
}
