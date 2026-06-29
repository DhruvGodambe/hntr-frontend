"use client";

import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";

type SidebarNavItemProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onNavigate?: () => void;
  variant?: "default" | "rail";
};

function SidebarRailNavItem({
  href,
  label,
  icon,
  active = false,
  onNavigate,
}: Omit<SidebarNavItemProps, "variant">) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={label}
      className={cn(
        "mx-[5px] flex h-[34px] w-[calc(100%-10px)] items-center overflow-hidden rounded-md text-[var(--sidebar-text)] transition-colors hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text-active)]",
        active &&
          "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-text-active)]",
      )}
    >
      <span className="si-icon flex size-9 min-w-9 shrink-0 items-center justify-center [&_svg]:size-3.5">
        {icon}
      </span>
      <span className="sidebar-label whitespace-nowrap font-mono text-label uppercase tracking-[0.07em]">
        {label}
      </span>
    </Link>
  );
}

export function SidebarNavItem({
  href,
  label,
  icon,
  active = false,
  onNavigate,
  variant = "default",
}: SidebarNavItemProps) {
  if (variant === "rail") {
    return (
      <SidebarRailNavItem
        href={href}
        label={label}
        icon={icon}
        active={active}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-xs text-t3 transition-colors hover:bg-e3 hover:text-t4",
        active && "bg-e4 font-medium text-t4",
      )}
      title={label}
    >
      <span className="shrink-0 [&_svg]:size-5">{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function SidebarRailAction({
  label,
  icon,
  onClick,
  href,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  href?: string;
}) {
  const className =
    "mx-[5px] flex h-[34px] w-[calc(100%-10px)] items-center overflow-hidden rounded-md text-[var(--sidebar-text)] transition-colors hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text-active)]";

  const inner = (
    <>
      <span className="si-icon flex size-9 min-w-9 shrink-0 items-center justify-center [&_svg]:size-3.5">
        {icon}
      </span>
      <span className="sidebar-label whitespace-nowrap font-mono text-label uppercase tracking-[0.07em]">
        {label}
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={className} title={label}>
        {inner}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className} title={label}>
      {inner}
    </button>
  );
}

type SidebarRailProps = React.ComponentProps<"aside"> & {
  children: React.ReactNode;
};

export function SidebarRail({ className, children, ...props }: SidebarRailProps) {
  return (
    <aside
      className={cn(
        "group/sidebar sb mt-2 ml-2 hidden w-[46px] min-w-[46px] shrink-0 flex-col overflow-hidden rounded-t-[10px] bg-[var(--sidebar-bg)] py-3.5 transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:w-[162px] lg:flex",
        className,
      )}
      style={{ boxShadow: "var(--sidebar-shadow)" }}
      aria-label="Main navigation"
      {...props}
    >
      {children}
    </aside>
  );
}

export function SidebarRailContent({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      className={cn("flex flex-1 flex-col gap-0.5 overflow-hidden", className)}
      {...props}
    />
  );
}

export function SidebarRailFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("si-bot mt-auto flex flex-col gap-0.5", className)} {...props} />
  );
}

export function SidebarRailSeparator() {
  return (
    <div
      className="si-sep mx-3.5 my-1.5 h-px bg-[var(--sidebar-border)]"
      aria-hidden
    />
  );
}

/* Keep provider for mobile sidebar compatibility */
export function SidebarRailProvider({
  children,
}: {
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  return <>{children}</>;
}

export function useSidebarRail() {
  return { expanded: true, toggle: () => undefined };
}
