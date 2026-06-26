import { FileText, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { membershipInfoCards } from "@/features/membership/data/membership-data";
import { cn } from "@/lib/utils";

const iconMap = {
  shield: Shield,
  file: FileText,
} as const;

export function MembershipInfoCards() {
  return (
    <section
      className="mb-6 grid gap-3 sm:grid-cols-2"
      aria-labelledby="membership-info-heading"
    >
      <h2 id="membership-info-heading" className="sr-only">
        Membership information
      </h2>
      {membershipInfoCards.map((card) => {
        const Icon = iconMap[card.icon];
        return (
          <Card key={card.id} className="shadow-sh1">
            <CardContent className="flex gap-3 p-4">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-md",
                  "border border-border bg-e3 text-accent",
                )}
                aria-hidden
              >
                <Icon className="size-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <h3 className="mb-1 font-display text-[11px] font-bold text-t4">
                  {card.title}
                </h3>
                <p className="text-[9px] leading-relaxed text-t2">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
