import { FileText, Headphones, LayoutDashboard, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { infoTopics } from "@/features/info/data/info-data";
import { cn } from "@/lib/utils";

const iconMap = {
  platform: LayoutDashboard,
  security: Shield,
  compliance: FileText,
  support: Headphones,
} as const;

export function InfoTopics() {
  return (
    <section className="mb-6">
      <h2 className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.1em] text-t4">
        Platform Information
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {infoTopics.map((topic) => {
          const Icon = iconMap[topic.icon];
          return (
            <Card key={topic.id} className="shadow-sh1">
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
                    {topic.title}
                  </h3>
                  <p className="text-[9px] leading-relaxed text-t2">
                    {topic.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
