"use client";

import { Button } from "@/components/ui/button";

export function UserProfileCard() {
  return (
    <div className="mb-5 rounded-xl border border-bd0 bg-e2 p-3.5 sm:hidden">
      <div className="mb-3.25 flex items-center gap-2.5">
        <div className="flex size-[34px] items-center justify-center rounded-lg bg-e3 text-[16px]">
          👤
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold text-t4">
              masteraccount
            </span>
            <span className="rounded-[3px] bg-featured-badge-bg px-1.25 py-0.5 font-mono text-[7px] font-bold tracking-[0.08em] text-featured-badge-text">
              ELITE
            </span>
          </div>
          <div className="mt-0.5 font-mono text-[9px] text-t1">
            Elite Hunter
          </div>
        </div>
        <Button
          className="h-[26px] rounded-md border-0 bg-featured-badge-bg px-2.75 font-mono text-[8px] font-bold tracking-[0.07em] text-featured-badge-text shadow-none hover:brightness-95"
          size="sm"
        >
          UPGRADE
        </Button>
      </div>
      <div className="mb-1.25 flex justify-between font-mono text-[8px] text-t1">
        <span className="tracking-[0.06em]">CURRENT PROGRESS</span>
        <span className="font-bold text-t4">74%</span>
      </div>
      <div className="mb-3.25 h-[5px] overflow-hidden rounded-[3px] bg-e4">
        <div
          className="h-full w-[74%] rounded-[3px] bg-featured-badge-bg"
          style={{
            animation: "mBar 1s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-e3 p-[9px_11px]">
          <div className="mb-1 font-mono text-[7.5px] uppercase tracking-[0.06em] text-t1">
            Total Rewarded
          </div>
          <div className="font-mono text-[14px] font-bold text-t4">
            $119,551
          </div>
        </div>
        <div className="rounded-lg bg-e3 p-[9px_11px]">
          <div className="mb-1 font-mono text-[7.5px] uppercase tracking-[0.06em] text-t1">
            HNTR Points
          </div>
          <div className="font-mono text-[14px] font-bold text-t4">
            6,913,586
          </div>
        </div>
      </div>
    </div>
  );
}
