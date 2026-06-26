import Link from "next/link";
import { infoLegalLinks } from "@/features/info/data/info-data";
import { InfoHero } from "./info-hero";
import { InfoResources } from "./info-resources";
import { InfoTopics } from "./info-topics";

export function InfoHome() {
  return (
    <>
      <InfoHero />
      <InfoTopics />
      <InfoResources />
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 font-mono text-[8px] uppercase tracking-[0.06em] text-t0">
        <span>© 2024 HNTR INSTITUTIONAL | TERMINAL STATUS: OPTIMAL</span>
        <div className="flex flex-wrap gap-4">
          {infoLegalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-t3"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </footer>
    </>
  );
}
