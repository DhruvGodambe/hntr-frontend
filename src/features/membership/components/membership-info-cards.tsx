import { membershipInfoCards } from "@/features/membership/data/membership-data";

function InfoShieldIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M6 1.5L2 3v3.5c0 2.2 1.7 4.3 4 4.5 2.3-.2 4-2.3 4-4.5V3L6 1.5z"
        stroke="currentColor"
        className="text-t4"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfoStarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M6 1l1.5 3h3l-2.5 2 1 3L6 7.5 3 9l1-3L1.5 4h3L6 1z"
        stroke="currentColor"
        className="text-t4"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const iconMap = {
  shield: InfoShieldIcon,
  star: InfoStarIcon,
} as const;

export function MembershipInfoCards() {
  return (
    <section className="mb-5 grid gap-3 sm:grid-cols-2">
      {membershipInfoCards.map((card, index) => {
        const Icon = iconMap[card.icon];
        return (
          <article
            key={card.id}
            className="card-reveal rounded-[var(--r)] bg-e2 p-4 shadow-[var(--sh1),var(--glow)] sm:px-[18px]"
            style={{ animationDelay: `${0.4 + index * 0.08}s` }}
          >
            <div className="mb-2 flex items-center gap-[7px]">
              <div className="flex size-[22px] shrink-0 items-center justify-center rounded-[5px] bg-[var(--sage-faint)]">
                <Icon />
              </div>
              <h3 className="font-display text-label font-bold text-t4">
                {card.title}
              </h3>
            </div>
            <p className="text-caption leading-[1.6] text-t1">{card.description}</p>
          </article>
        );
      })}
    </section>
  );
}
