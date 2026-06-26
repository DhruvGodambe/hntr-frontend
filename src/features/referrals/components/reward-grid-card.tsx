import {
  Award,
  Briefcase,
  Droplets,
  ImageIcon,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActiveReward } from "@/features/referrals/data/referrals-data";
import { cn } from "@/lib/utils";

const iconMap = {
  referral: Users,
  leadership: TrendingUp,
  rank: Award,
  nft: ImageIcon,
  otc: Briefcase,
  liquidity: Droplets,
} as const;

type RewardGridCardProps = {
  reward: ActiveReward;
};

export function RewardGridCard({ reward }: RewardGridCardProps) {
  const Icon = iconMap[reward.icon];

  return (
    <article className="flex flex-col rounded-md border border-border bg-e2 p-3 shadow-sh1">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md",
            "border border-border bg-e3 text-t3",
          )}
          aria-hidden
        >
          <Icon className="size-3.5" strokeWidth={1.75} />
        </div>
        <span className="font-mono text-[7px] uppercase tracking-[0.06em] text-t0">
          {reward.tag}
        </span>
      </div>

      <h3 className="mb-0.5 font-display text-[11px] font-bold text-t4">
        {reward.title}
      </h3>
      <p className="mb-3 flex-1 text-[9px] leading-snug text-t2">
        {reward.description}
      </p>

      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-bold text-t4">
          {reward.amount}
        </span>
        <Button className="h-6 px-3 font-mono text-[7px] uppercase tracking-[0.04em]">
          Claim
        </Button>
      </div>
    </article>
  );
}
