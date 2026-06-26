import { Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SectionHeader } from "@/features/dashboard/components/section-header";
import {
  comparisonRows,
  membershipTiers,
} from "@/features/membership/data/membership-data";

export function MembershipComparison() {
  return (
    <section className="mb-6">
      <SectionHeader
        title="Membership Comparison"
        subtitle="Detailed feature breakdown across all institutional tiers."
        className="mb-4"
      />

      <div className="overflow-hidden rounded-md border border-border bg-e2 shadow-sh1">
        <Table>
          <TableHeader>
            <TableRow className="bg-e3 hover:bg-e3">
              <TableHead className="h-9 min-w-[140px] px-3">Feature</TableHead>
              {membershipTiers.map((tier) => (
                <TableHead
                  key={tier.id}
                  className="h-9 min-w-[88px] px-2 text-center"
                >
                  {tier.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparisonRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="px-3 py-2.5 text-[9px] text-t3">
                  {row.label}
                </TableCell>
                {row.values.map((value, index) => (
                  <TableCell
                    key={`${row.id}-${index}`}
                    className="px-2 py-2.5 text-center"
                  >
                    {row.type === "boolean" ? (
                      <span className="inline-flex justify-center">
                        {value ? (
                          <Check
                            className="size-3.5 text-green"
                            strokeWidth={2.5}
                            aria-label="Included"
                          />
                        ) : (
                          <X
                            className="size-3.5 text-t0"
                            strokeWidth={2.5}
                            aria-label="Not included"
                          />
                        )}
                      </span>
                    ) : (
                      <span className="font-mono text-[8px] text-t3">
                        {value}
                      </span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
