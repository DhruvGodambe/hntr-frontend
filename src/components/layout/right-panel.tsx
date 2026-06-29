"use client";

import * as React from "react";
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
    <div className="mb-[13px] shrink-0 border-b border-bd0 pb-[13px]">
      {children}
    </div>
  );
}

function StatBox({
  label,
  value,
  valueClassName,
  footer,
  footerClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  footer?: string;
  footerClassName?: string;
}) {
  return (
    <div className="rounded-md bg-e3 p-[9px] shadow-sh1">
      <p className="mb-[3px] text-caption uppercase tracking-[0.05em] text-t0">
        {label}
      </p>
      <p
        className={cn(
          "font-mono text-stat font-bold text-t4",
          valueClassName,
        )}
      >
        {value}
      </p>
      {footer && (
        <p className={cn("mt-0.5 font-mono text-caption", footerClassName)}>
          {footer}
        </p>
      )}
    </div>
  );
}

function RewardTierCard({
  tier,
  withDivider,
}: {
  tier: (typeof rightPanelData.rewardTiers)[number];
  withDivider?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-md bg-e2 p-[10px] shadow-[var(--sh2),var(--glow)]",
        withDivider
          ? "mb-[13px] border-b border-bd0 pb-[13px]"
          : "mb-2",
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[var(--sage-faint)] via-[var(--sage)] to-[var(--sage-faint)] opacity-60"
        aria-hidden
      />
      <div className="mb-[3px] flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-[5px]">
          <span className="shrink-0">
            {tier.icon === "referral" ? <ReferralIcon /> : <PoolIcon />}
          </span>
          <span className="truncate text-body-sm font-semibold text-t3">
            {tier.title}
          </span>
        </div>
        <span className="shrink-0 rounded-[2px] bg-[var(--sage-faint)] px-[5px] py-0.5 font-mono text-micro tracking-[0.06em] text-t4">
          {tier.tag}
        </span>
      </div>
      <p className="mb-2 text-caption leading-[1.4] text-t0">{tier.description}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 font-mono text-stat font-bold text-t4">
          {tier.amount}
        </span>
        <button
          type="button"
          className="h-[22px] shrink-0 rounded-[3px] bg-t4 px-[9px] font-mono text-caption font-bold tracking-[0.06em] text-e1 transition-colors hover:bg-[var(--olive-deep)] dark:bg-[var(--inverse-btn-bg)] dark:text-[var(--inverse-btn-text)] dark:hover:brightness-95"
        >
          CLAIM
        </button>
      </div>
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
        "right-panel block h-full min-h-0 shrink-0 overflow-x-hidden overflow-y-auto rounded-t-[10px] bg-e1 p-3 shadow-sh2 scrollbar-thin sm:p-4",
        className,
      )}
      aria-label="Account overview"
    >
      <RailDivider>
        <div className="flex items-center gap-[9px]">
          <div
            className="flex size-[34px] shrink-0 items-center justify-center rounded-[7px] bg-[var(--sage-faint)] text-heading-sm shadow-sh1"
            aria-hidden
          >
            👤
          </div>
          <div className="min-w-0">
            <div className="flex items-center">
              <span className="font-display text-body-sm font-bold text-t4">
                {data.username}
              </span>
              <span className="ml-[5px] inline-flex h-[14px] items-center rounded-[2px] bg-[var(--inverse-surface)] px-[5px] font-mono text-micro font-bold tracking-[0.08em] text-[var(--inverse-foreground)]">
                {data.badge}
              </span>
            </div>
            <p className="mt-px text-caption uppercase tracking-[0.06em] text-t1">
              {data.title}
            </p>
          </div>
        </div>

        <div className="mt-3">
          <div className="mb-[5px] flex justify-between">
            <span className="text-caption uppercase tracking-[0.06em] text-t1">
              Current Progress
            </span>
            <span className="font-mono text-label font-semibold text-t4">
              {data.progress}%
            </span>
          </div>
          <div
            className="mb-[3px] h-1 overflow-hidden rounded-[2px] bg-[var(--sage-faint)]"
            role="progressbar"
            aria-valuenow={data.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="rail-progress-fill h-full rounded-[2px] bg-[var(--olive)]"
              style={{ width: `${data.progress}%` }}
            />
          </div>
          <div className="flex justify-between font-mono text-caption text-t1">
            <span>{data.progressStart}</span>
            <span>{data.progressEnd}</span>
          </div>
        </div>
      </RailDivider>

      <RailDivider>
        <div className="grid grid-cols-2 gap-[7px]">
          <StatBox
            label="Total Rewarded"
            value={data.totalRewarded.value}
            footer={data.totalRewarded.delta}
            footerClassName="text-green"
          />
          <StatBox
            label="HNTR Points"
            value={data.hntrPoints.value}
            footer={data.hntrPoints.subtitle}
            footerClassName="text-t0"
          />
        </div>
      </RailDivider>

      <RailDivider>
        <div className="grid grid-cols-2 gap-[7px]">
          <StatBox
            label="Membership"
            value={data.membership.tier}
            valueClassName="font-display text-heading-sm"
            footer={data.membership.tierSubtitle}
            footerClassName="text-t0"
          />
          <StatBox
            label="Total Network Users"
            value={data.membership.networkUsers}
            footer={data.membership.growth}
            footerClassName="text-green"
          />
        </div>
      </RailDivider>

      <p className="mb-[9px] shrink-0 font-mono text-caption uppercase tracking-[0.08em] text-t0">
        Active Rewards Tiers
      </p>

      {data.rewardTiers.map((tier, index) => (
        <RewardTierCard
          key={tier.id}
          tier={tier}
          withDivider={index === data.rewardTiers.length - 1}
        />
      ))}

      <p className="mb-[9px] mt-1 shrink-0 font-mono text-caption uppercase tracking-[0.08em] text-t0">
        Platform Activity
      </p>

      <div
        className="mb-2 shrink-0 flex border-b border-bd0"
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
              "-mb-px border-b px-[7px] py-[3px] font-mono text-caption tracking-[0.05em] transition-colors",
              activeTab === tab
                ? "border-t4 text-t4"
                : "border-transparent text-t0",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div id="activityFeed" className="shrink-0">
        {data.activity.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-[7px] border-b border-bd0 py-[5px] last:border-b-0",
              index === 0 && "rail-activity-new",
            )}
          >
            <span
              className="flex size-[18px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--sage-faint)] text-caption"
              aria-hidden
            >
              {item.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-label text-t3">{item.name}</p>
              <p
                className="font-mono text-caption"
                style={{ color: item.positive ? "var(--green)" : "var(--red)" }}
              >
                {item.action} · {item.value}
              </p>
            </div>
            <span className="shrink-0 font-mono text-caption text-t0">
              {item.timeAgo}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="block w-full pt-[9px] text-center font-mono text-label text-t4 underline"
      >
        View Activity
      </button>
    </aside>
  );
}
