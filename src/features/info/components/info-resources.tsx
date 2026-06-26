import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { infoResources } from "@/features/info/data/info-data";

export function InfoResources() {
  return (
    <section className="mb-6">
      <h2 className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.1em] text-t4">
        Quick Links
      </h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {infoResources.map((resource) => (
          <Link
            key={resource.id}
            href={resource.href}
            className="group flex items-start justify-between gap-3 rounded-md border border-border bg-e2 p-3 shadow-sh1 transition-colors hover:bg-e3"
          >
            <div className="min-w-0">
              <p className="font-display text-[11px] font-bold text-t4">
                {resource.label}
              </p>
              <p className="mt-0.5 text-[9px] text-t2">{resource.description}</p>
            </div>
            <ArrowUpRight
              className="mt-0.5 size-3.5 shrink-0 text-t1 transition-colors group-hover:text-t4"
              strokeWidth={1.75}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
