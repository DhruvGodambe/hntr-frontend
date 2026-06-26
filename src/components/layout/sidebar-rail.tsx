"use client";

import { ChevronLeft, PanelLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { cn } from "@/lib/utils";

type SidebarRailContextValue = {
  expanded: boolean;
  toggle: () => void;
};

const SidebarRailContext = React.createContext<SidebarRailContextValue | null>(
  null,
);

export function useSidebarRail() {
  const context = React.useContext(SidebarRailContext);
  if (!context) {
    throw new Error("useSidebarRail must be used within SidebarRailProvider");
  }
  return context;
}

export function SidebarRailProvider({
  children,
  defaultExpanded = true,
}: {
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const toggle = React.useCallback(() => setExpanded((prev) => !prev), []);

  const value = React.useMemo(
    () => ({ expanded, toggle }),
    [expanded, toggle],
  );

  return (
    <SidebarRailContext.Provider value={value}>
      {children}
    </SidebarRailContext.Provider>
  );
}

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
  const { expanded } = useSidebarRail();

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={!expanded ? label : undefined}
      className={cn(
        "mx-[5px] flex h-[34px] w-[calc(100%-10px)] items-center overflow-hidden rounded-md text-[var(--sidebar-text)] transition-colors hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text-active)]",
        active &&
          "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-text-active)] shadow-sh1",
      )}
    >
      <span className="flex size-9 min-w-9 shrink-0 items-center justify-center [&_svg]:size-3.5">
        {icon}
      </span>
      <span
        className={cn(
          "whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.07em] transition-[opacity,width] duration-200",
          expanded
            ? "ml-0 w-auto opacity-100"
            : "pointer-events-none w-0 opacity-0",
        )}
      >
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
        "flex items-center gap-3 rounded-md px-3 py-2 font-sans text-sm text-t3 transition-colors hover:bg-e3 hover:text-t4",
        active && "bg-e4 font-medium text-t4",
      )}
      title={label}
    >
      <span className="shrink-0 [&_svg]:size-5">{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

type SidebarRailProps = React.ComponentProps<"aside"> & {
  children: React.ReactNode;
};

export function SidebarRail({ className, children, ...props }: SidebarRailProps) {
  const { expanded } = useSidebarRail();

  return (
    <aside
      data-expanded={expanded}
      className={cn(
        "hidden h-dvh shrink-0 flex-col overflow-hidden bg-[var(--sidebar-bg)] py-3.5 shadow-sh2 transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:flex",
        expanded ? "w-[162px]" : "w-[46px]",
        className,
      )}
      aria-label="Main navigation"
      {...props}
    >
      {children}
    </aside>
  );
}

function SidebarRailIconButton({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-md text-[var(--sidebar-text)] transition-colors hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text-active)]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SidebarRailHeader() {
  const { expanded, toggle } = useSidebarRail();
  const router = useRouter();

  if (!expanded) {
    return (
      <div className="mb-1 flex flex-col items-center gap-0.5">
        <Link
          href="/"
          title="HNTR"
          className="mx-[5px] flex h-[34px] w-[calc(100%-10px)] items-center justify-center rounded-md font-display text-[11px] font-bold tracking-[0.1em] text-[var(--sidebar-text-active)] transition-colors hover:bg-[var(--sidebar-hover-bg)]"
        >
          H
        </Link>
        <SidebarRailIconButton
          label="Go back"
          onClick={() => router.back()}
          className="mx-[5px]"
        >
          <ChevronLeft className="size-3.5" />
        </SidebarRailIconButton>
        <SidebarRailIconButton
          label="Expand sidebar"
          onClick={toggle}
          className="mx-[5px]"
        >
          <PanelLeft className="size-3.5 rotate-180" />
        </SidebarRailIconButton>
      </div>
    );
  }

  return (
    <div className="mx-[5px] mb-1 flex h-[34px] w-[calc(100%-10px)] items-center justify-between gap-1 overflow-hidden rounded-md px-1">
      <Link
        href="/"
        className="min-w-0 truncate font-display text-[13px] font-bold tracking-[0.1em] text-[var(--sidebar-text-active)] transition-colors hover:text-[var(--cream)]"
      >
        HNTR
      </Link>
      <div className="flex shrink-0 items-center gap-0.5">
        <SidebarRailIconButton
          label="Go back"
          onClick={() => router.back()}
        >
          <ChevronLeft className="size-3.5" />
        </SidebarRailIconButton>
        <SidebarRailIconButton
          label="Collapse sidebar"
          onClick={toggle}
        >
          <PanelLeft className="size-3.5" />
        </SidebarRailIconButton>
      </div>
    </div>
  );
}

export function SidebarRailToggle({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { expanded, toggle } = useSidebarRail();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
      aria-expanded={expanded}
      className={cn(
        "mx-[5px] mb-1 flex h-[34px] w-[calc(100%-10px)] items-center overflow-hidden rounded-md text-[var(--sidebar-text)] transition-colors hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text-active)]",
        !expanded && "justify-center",
        className,
      )}
      {...props}
    >
      <span className="flex size-9 min-w-9 shrink-0 items-center justify-center">
        <PanelLeft
          className={cn(
            "size-3.5 transition-transform duration-200",
            !expanded && "rotate-180",
          )}
        />
      </span>
      <span
        className={cn(
          "whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.07em] transition-[opacity,width] duration-200",
          expanded
            ? "ml-0 w-auto opacity-100"
            : "pointer-events-none w-0 opacity-0",
        )}
      >
        Collapse
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
    <div className={cn("mt-auto flex flex-col gap-0.5", className)} {...props} />
  );
}

export function SidebarRailSeparator() {
  return <div className="mx-3.5 my-1.5 h-px bg-[var(--sidebar-border)]" aria-hidden />;
}
