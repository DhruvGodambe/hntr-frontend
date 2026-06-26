"use client";

import { PanelLeft } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SidebarContextValue = {
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  toggle: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}

type SidebarProviderProps = {
  children: React.ReactNode;
  defaultExpanded?: boolean;
};

export function SidebarProvider({
  children,
  defaultExpanded = true,
}: SidebarProviderProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const toggle = React.useCallback(() => setExpanded((prev) => !prev), []);

  const value = React.useMemo(
    () => ({ expanded, setExpanded, toggle }),
    [expanded, toggle],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

type SidebarProps = React.ComponentProps<"aside"> & {
  forceVisible?: boolean;
};

export function Sidebar({
  className,
  children,
  forceVisible = false,
  ...props
}: SidebarProps) {
  const { expanded } = useSidebar();

  return (
    <aside
      data-expanded={expanded}
      className={cn(
        "shrink-0 flex-col border-r border-border bg-e1 transition-[width] duration-200",
        forceVisible ? "flex" : "hidden lg:flex",
        expanded ? "w-64" : "w-16",
        className,
      )}
      aria-label="Main navigation"
      {...props}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { expanded, toggle } = useSidebar();

  return (
    <div
      className={cn(
        "flex h-14 items-center border-b border-border px-3",
        expanded ? "justify-between" : "justify-center",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          {expanded ? (
            <span className="font-display text-lg font-semibold tracking-tight text-t4">
              HNTR
            </span>
          ) : (
            <span className="font-display text-sm font-semibold text-t4">H</span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <PanelLeft className="size-4" />
          </Button>
        </>
      )}
    </div>
  );
}

export function SidebarContent({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      className={cn("flex flex-1 flex-col gap-1 overflow-y-auto p-2", className)}
      {...props}
    />
  );
}

export function SidebarFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("border-t border-border p-2", className)}
      {...props}
    />
  );
}

export function SidebarGroup({
  className,
  title = "Nav",
  children,
  ...props
}: React.ComponentProps<"div"> & { title?: string }) {
  const { expanded } = useSidebar();

  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      {expanded && (
        <span className="px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-t1">
          {title}
        </span>
      )}
      {children}
    </div>
  );
}

type SidebarNavItemProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onNavigate?: () => void;
};

export function SidebarNavItem({
  href,
  label,
  icon,
  active = false,
  onNavigate,
}: SidebarNavItemProps) {
  const { expanded } = useSidebar();

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 font-sans text-sm text-t3 transition-colors hover:bg-e3 hover:text-t4",
        active && "bg-e4 font-medium text-t4",
        !expanded && "justify-center px-2",
      )}
      title={!expanded ? label : undefined}
    >
      <span className="shrink-0 [&_svg]:size-5">{icon}</span>
      {expanded && <span className="truncate">{label}</span>}
    </Link>
  );
}

export function SidebarToggle({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { expanded, toggle } = useSidebar();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      onClick={toggle}
      aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
      {...props}
    >
      <PanelLeft className="size-4" />
    </Button>
  );
}
