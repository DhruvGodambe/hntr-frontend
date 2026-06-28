import {
  comparisonRows,
  membershipTiers,
} from "@/features/membership/data/membership-data";
import { cn } from "@/lib/utils";

const CURRENT_TIER_INDEX = 2;

export function MembershipComparison() {
  return (
    <section className="mb-5 overflow-hidden rounded-md bg-e2 shadow-[var(--sh1),var(--glow)]">
      <div className="border-b-[0.5px] border-bd0 px-[18px] py-3.5">
        <h2 className="font-display text-[13px] font-bold text-t4">
          Membership Comparison
        </h2>
        <p className="text-[10px] text-t1">
          Detailed feature breakdown across all institutional tiers.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-[28%] border-b-[0.5px] border-bd0 bg-e3 px-3.5 py-2.5 text-left font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-t0">
                Feature
              </th>
              {membershipTiers.map((tier, index) => (
                <th
                  key={tier.id}
                  className={cn(
                    "relative border-b-[0.5px] border-bd0 bg-e3 px-3.5 py-2.5 text-center font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-t1",
                    index === membershipTiers.length - 1 &&
                      "font-bold text-t4",
                    index === CURRENT_TIER_INDEX && "cmp-current-col",
                  )}
                >
                  {tier.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "group hover:[&>td]:bg-e3",
                  row.highlight &&
                    "[&>td]:bg-[rgba(94,107,85,0.04)] dark:[&>td]:bg-white/[0.03]",
                )}
              >
                <td className="border-b-[0.5px] border-bd0 px-3.5 py-2.5 text-[10px] font-semibold text-t4">
                  {row.label}
                </td>
                {row.values.map((value, index) => (
                  <td
                    key={`${row.id}-${index}`}
                    className={cn(
                      "border-b-[0.5px] border-bd0 px-3.5 py-2.5 text-center text-[10px] text-t2",
                      index === membershipTiers.length - 1 &&
                        row.type === "text" &&
                        "font-bold text-t4",
                    )}
                  >
                    {row.type === "boolean" ? (
                      <span
                        className={cn(
                          "text-[13px]",
                          value ? "text-green" : "text-t0 opacity-40",
                        )}
                      >
                        {value ? "✓" : "✕"}
                      </span>
                    ) : (
                      value
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
