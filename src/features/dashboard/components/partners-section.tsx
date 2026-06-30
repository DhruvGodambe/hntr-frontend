import { partners } from "@/features/dashboard/data/home-data";
import { partnerLogoImage } from "@/lib/images";

const tickerItems = [...partners, ...partners];

export function PartnersSection() {
  return (
    <section className="mb-[18px]" aria-labelledby="partners-heading">
      <div className="flex h-[46px] items-center gap-3 overflow-hidden rounded-xl border border-bd0 bg-e2 pl-3.5 pr-0 shadow-sh1 sm:h-[38px] sm:gap-3.5 sm:rounded-md sm:px-4 sm:shadow-sh1 sm:[box-shadow:var(--sh1),var(--glow)]">
        <h2
          id="partners-heading"
          className="shrink-0 font-mono text-[8px] uppercase tracking-[0.12em] text-t0 sm:text-[9px]"
        >
          Partners
        </h2>

        <div className="relative h-full min-w-0 flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-9 bg-gradient-to-r from-e2 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-9 bg-gradient-to-l from-e2 to-transparent" />

          <div className="flex h-full items-center">
            <div className="animate-ticker flex w-max items-center gap-7 sm:gap-8">
              {tickerItems.map((partner, index) => (
                <span
                  key={`${partner.id}-${index}`}
                  className="flex items-center gap-1.25 whitespace-nowrap font-display text-[11px] font-semibold text-t2 sm:gap-1.5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={partnerLogoImage(index)}
                    alt=""
                    className="size-[13px] rounded-full object-cover sm:size-4"
                  />
                  {partner.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
