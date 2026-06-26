"use client";

import * as React from "react";
import Link from "next/link";
import { rightPanelData } from "@/features/dashboard/data/home-data";
import { cn } from "@/lib/utils";

function ReferralIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="4.5" stroke="#8a9e82" strokeWidth="1.2" />
      <path
        d="M4 6l1.5 1.5L8 4"
        stroke="#8a9e82"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PoolIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
      <rect
        x="1.5"
        y="4"
        width="9"
        height="7"
        rx="1"
        stroke="#8a9e82"
        strokeWidth="1.2"
      />
      <path
        d="M4 4V3a2 2 0 0 1 4 0v1"
        stroke="#8a9e82"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RailDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-[13px] border-b border-[var(--cream-dark)] pb-[13px]">
      {children}
    </div>
  );
}

export function RightPanel({ className }: { className?: string }) {
  const data = rightPanelData;
  const [activeTab, setActiveTab] = React.useState<
    (typeof data.activityTabs)[number]
  >(data.activityTabs[0]);

  return (
    <aside
      className={cn(
        "flex w-full shrink-0 flex-col bg-e1 p-4 shadow-[-2px_0_10px_rgba(60,70,50,0.07)] xl:w-64",
        className,
      )}
      aria-label="Account overview"
    >
      <RailDivider>
        <div className="flex items-center gap-[9px]">
          <div
            className="flex size-[34px] shrink-0 items-center justify-center rounded-[7px] bg-[var(--sage-faint)] text-[15px] shadow-sh1"
            aria-hidden
          >
            👤
          </div>
          <div className="min-w-0">
            <div className="flex items-center">
              <span className="font-display text-xs font-bold text-t4">
                {data.username}
              </span>
              <span className="ml-[5px] inline-flex h-[14px] items-center rounded-[2px] bg-accent px-[5px] font-mono text-[7px] font-bold tracking-[0.08em] text-[var(--cream)]">
                {data.badge}
              </span>
            </div>
            <p className="mt-px text-[8px] uppercase tracking-[0.06em] text-t0">
              {data.title}
            </p>
          </div>
        </div>

        <div className="mt-3">
          <div className="mb-[5px] flex justify-between">
            <span className="text-[8px] uppercase tracking-[0.06em] text-t0">
              Current Progress
            </span>
            <span className="font-mono text-[9px] text-t4">{data.progress}%</span>
          </div>
          <div
            className="mb-[3px] h-[3px] overflow-hidden rounded-[2px] bg-[var(--sage-faint)]"
            role="progressbar"
            aria-valuenow={data.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-[2px] bg-accent"
              style={{ width: `${data.progress}%` }}
            />
          </div>
          <div className="flex justify-between font-mono text-[8px] text-t0">
            <span>{data.progressStart}</span>
            <span>{data.progressEnd}</span>
          </div>
        </div>
      </RailDivider>

      <RailDivider>
        <div className="grid grid-cols-2 gap-[7px]">
          <div className="rounded-md bg-e3 p-[9px] shadow-sh1">
            <p className="mb-[3px] text-[8px] uppercase tracking-[0.05em] text-t0">
              Total Rewarded
            </p>
            <p className="font-mono text-[13px] font-bold text-t4">
              {data.totalRewarded.value}
            </p>
            <p className="mt-[2px] font-mono text-[8px] text-green">
              {data.totalRewarded.delta}
            </p>
          </div>
          <div className="rounded-md bg-e3 p-[9px] shadow-sh1">
            <p className="mb-[3px] text-[8px] uppercase tracking-[0.05em] text-t0">
              HNTR Points
            </p>
            <p className="font-mono text-[13px] font-bold text-t4">
              {data.hntrPoints.value}
            </p>
            <p className="mt-[2px] font-mono text-[8px] text-t0">
              {data.hntrPoints.subtitle}
            </p>
          </div>
        </div>
      </RailDivider>

      <RailDivider>
        <div className="grid grid-cols-2 gap-[7px]">
          <div className="rounded-md bg-e3 p-[9px] shadow-sh1">
            <p className="mb-[3px] text-[8px] uppercase tracking-[0.05em] text-t0">
              Membership
            </p>
            <p className="font-display text-[13px] font-bold text-t4">
              {data.membership.tier}
            </p>
          </div>
          <div className="rounded-md bg-e3 p-[9px] shadow-sh1">
            <p className="mb-[3px] text-[8px] uppercase tracking-[0.05em] text-t0">
              Total Network Users
            </p>
            <p className="font-mono text-[13px] font-bold text-t4">
              {data.membership.networkUsers}
            </p>
            <p className="mt-[2px] font-mono text-[8px] text-green">
              {data.membership.growth}
            </p>
          </div>
        </div>
      </RailDivider>

      <p className="mb-[9px] font-mono text-[8px] uppercase tracking-[0.08em] text-t0">
        Active Rewards Tiers
      </p>

      {data.rewardTiers.map((tier, index) => (
        <div
          key={tier.id}
          className={cn(
            "relative mb-2 overflow-hidden rounded-md bg-e2 p-[10px] shadow-sh2 [box-shadow:var(--sh2),var(--glow)]",
            index === data.rewardTiers.length - 1 &&
              "mb-[13px] border-b border-[var(--cream-dark)] pb-[13px]",
          )}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[var(--sage-faint)] via-[var(--sage)] to-[var(--sage-faint)] opacity-60"
            aria-hidden
          />
          <div className="mb-[3px] flex items-center justify-between">
            <div className="flex items-center gap-[5px]">
              {tier.icon === "referral" ? <ReferralIcon /> : <PoolIcon />}
              <span className="text-[10px] font-semibold text-t3">
                {tier.title}
              </span>
            </div>
            <span className="rounded-[2px] bg-[var(--sage-faint)] px-[5px] py-0.5 font-mono text-[7px] tracking-[0.06em] text-[var(--olive-dark)] dark:bg-e5 dark:text-t2">
              {tier.tag}
            </span>
          </div>
          <p className="mb-2 text-[8px] leading-snug text-t0">{tier.description}</p>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[13px] font-bold text-t4">
              {tier.amount}
            </span>
            <button
              type="button"
              className="h-[22px] rounded-[3px] bg-accent-ui px-2.5 font-mono text-[8px] font-bold tracking-[0.06em] text-accent-ui-foreground shadow-sh1 transition-colors hover:bg-accent-h"
            >
              CLAIM
            </button>
          </div>
        </div>
      ))}

      <p className="mb-[9px] mt-1 font-mono text-[8px] uppercase tracking-[0.08em] text-t0">
        Platform Activity
      </p>

      <div
        className="mb-2 flex border-b border-[var(--cream-dark)]"
        role="tablist"
        aria-label="Activity filters"
      >
        {data.activityTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "-mb-px border-b px-[7px] py-[3px] font-mono text-[8px] tracking-[0.05em] transition-colors",
              activeTab === tab
                ? "border-accent text-accent"
                : "border-transparent text-t0",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <ul className="mb-0">
        {data.activity.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-[7px] border-b border-[var(--cream-dark)] py-[5px] last:border-b-0"
          >
            <span
              className="flex size-[18px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--sage-faint)] text-[8px]"
              aria-hidden
            >
              {item.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[9px] text-t3">{item.name}</p>
              <p
                className={cn(
                  "font-mono text-[8px]",
                  item.positive ? "text-green" : "text-red",
                )}
              >
                {item.action} · {item.value}
              </p>
            </div>
            <span className="shrink-0 font-mono text-[8px] text-t0">
              {item.timeAgo}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href="/activity"
        className="block pt-2.5 text-center font-mono text-[9px] text-accent underline"
      >
        View Activity
      </Link>
    </aside>
  );
}
