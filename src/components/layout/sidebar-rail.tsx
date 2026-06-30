"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";

type SidebarRailContextValue = {
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  toggle: () => void;
};

const SidebarRailContext = React.createContext<SidebarRailContextValue | null>(
  null,
);

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
  "data-mobile-nav"?: boolean | string;
};

export function SidebarRail({
  className,
  children,
  "data-mobile-nav": dataMobileNav,
  ...props
}: SidebarRailProps) {
  const { expanded, setExpanded } = useSidebarRail();
  const isMobileNav = dataMobileNav !== undefined;

  if (isMobileNav) {
    return (
      <aside
        data-mobile-nav={dataMobileNav}
        data-expanded={true}
        className={cn(
          "group/sidebar sb flex shrink-0 flex-col overflow-hidden bg-[var(--sidebar-bg)] py-3.5",
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

  return (
    <>
      {/* Backdrop for desktop/tablet when expanded */}
      <div
        className={cn(
          "absolute inset-0 z-20 hidden bg-black/40 transition-opacity duration-300 lg:block",
          expanded ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setExpanded(false)}
      />

      <div className="relative hidden w-[46px] shrink-0 lg:block">
        <aside
          data-expanded={expanded ? true : undefined}
          className={cn(
            "group/sidebar sb absolute left-0 top-0 z-30 flex h-full w-[46px] flex-col overflow-hidden rounded-t-[10px] bg-[var(--sidebar-bg)] py-3.5 transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            className,
          )}
          style={{ boxShadow: "var(--sidebar-shadow)" }}
          aria-label="Main navigation"
          {...props}
        >
          {children}
        </aside>
      </div>
    </>
  );
}

export function SidebarRailToggle({ className }: { className?: string }) {
  const { expanded, toggle } = useSidebarRail();
  const Icon = expanded ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
      aria-expanded={expanded}
      className={cn(
        "mx-[5px] flex h-[34px] w-[calc(100%-10px)] items-center overflow-hidden rounded-md text-[var(--sidebar-text)] transition-colors hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text-active)]",
        className,
      )}
    >
      <span className="si-icon flex size-9 min-w-9 shrink-0 items-center justify-center [&_svg]:size-3.5">
        <Icon strokeWidth={1.4} />
      </span>
      <span className="sidebar-label whitespace-nowrap font-mono text-label uppercase tracking-[0.07em]">
        {expanded ? "Collapse" : "Expand"}
      </span>
    </button>
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

export function SidebarRailProvider({
  children,
  defaultExpanded = false,
}: {
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const toggle = React.useCallback(() => setExpanded((prev) => !prev), []);

  const value = React.useMemo(
    () => ({ expanded, setExpanded, toggle }),
    [expanded, toggle],
  );

  return (
    <SidebarRailContext.Provider value={value}>
      {children}
    </SidebarRailContext.Provider>
  );
}

export function useSidebarRail(): SidebarRailContextValue {
  const context = React.useContext(SidebarRailContext);
  return (
    context ?? {
      expanded: false,
      setExpanded: () => undefined,
      toggle: () => undefined,
    }
  );
}
