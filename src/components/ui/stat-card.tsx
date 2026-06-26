import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  delta?: string;
  deltaVariant?: "success" | "danger" | "default";
  className?: string;
};

export function StatCard({
  label,
  value,
  delta,
  deltaVariant = "default",
  className,
}: StatCardProps) {
  const badgeVariant =
    deltaVariant === "success"
      ? "success"
      : deltaVariant === "danger"
        ? "danger"
        : "default";

  return (
    <Card className={cn("shadow-sh1", className)}>
      <CardContent className="flex flex-col gap-2 p-4">
        <span className="font-mono text-[10px] uppercase tracking-wider text-t1">
          {label}
        </span>
        <div className="flex items-end justify-between gap-2">
          <span className="font-display text-xl font-semibold text-t4">
            {value}
          </span>
          {delta && <Badge variant={badgeVariant}>{delta}</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}
