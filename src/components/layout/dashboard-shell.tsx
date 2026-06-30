"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { AppFooter } from "@/components/layout/app-footer";
import { AppNavbar } from "@/components/layout/app-navbar";
import { AppSidebar, AppSidebarNav } from "@/components/layout/app-sidebar";
import { MainContent } from "@/components/layout/main-content";
import { PageLoader } from "@/components/layout/page-loader";
import { RightPanel } from "@/components/layout/right-panel";
import {
  SidebarRail,
  SidebarRailProvider,
} from "@/components/layout/sidebar-rail";
import { ToastProvider } from "@/components/toast/toast-provider";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { mainNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function DrawerCloseButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className={cn(
        "absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-md transition-colors",
        className,
      )}
    >
      <X className="size-4" strokeWidth={2} />
    </button>
  );
}

type DashboardShellProps = {
  children: React.ReactNode;
  showRightPanel?: boolean;
};

function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex shrink-0 border-t border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] md:hidden"
      aria-label="Mobile navigation"
    >
      {mainNavItems.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={active ? "page" : undefined}
            aria-label={item.label}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-[3px] py-3 text-[var(--sidebar-text)] transition-colors hover:text-[var(--sidebar-text-active)]",
              active && "text-[var(--sidebar-text-active)]",
            )}
          >
            <span className="flex items-center justify-center [&_svg]:size-[18px]">
              <Icon strokeWidth={1.4} />
            </span>
            <span className="w-full text-center font-mono text-[8px] uppercase leading-none tracking-[0.06em]">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function TabletSidebar({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <>
      {/* Dark overlay — no blur, just a translucent shadow */}
      <div
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => onOpenChange(false)}
      />
      {/* Sliding sidebar panel */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-[var(--sidebar-bg)] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ boxShadow: "var(--sidebar-shadow)" }}
        aria-label="Navigation menu"
      >
        <DrawerCloseButton
          onClick={() => onOpenChange(false)}
          className="text-white/75 hover:bg-white/15 hover:text-white"
        />
        <SidebarRailProvider defaultExpanded>
          <SidebarRail
            data-mobile-nav
            className="mt-0 ml-0 !flex h-full w-full min-w-0 rounded-none"
          >
            <AppSidebarNav onNavigate={() => onOpenChange(false)} />
          </SidebarRail>
        </SidebarRailProvider>
      </div>
    </>
  );
}

function MobileRightPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="drawer-right" hideClose className="relative">
        <DialogTitle className="sr-only">Account overview</DialogTitle>
        <DrawerCloseButton
          onClick={() => onOpenChange(false)}
          className="text-t2 hover:bg-e3 hover:text-t4"
        />
        <RightPanel className="right-panel--drawer h-full min-h-0 w-full min-w-0 max-w-none shrink rounded-none border-0 p-3 shadow-none sm:p-4" />
      </DialogContent>
    </Dialog>
  );
}

export function DashboardShell({
  children,
  showRightPanel = true,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [rightPanelOpen, setRightPanelOpen] = React.useState(false);

  return (
    <>
      <PageLoader />
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-e0">
        <AppNavbar
          onMobileMenuOpen={() => setMobileOpen(true)}
          onRightPanelOpen={() => setRightPanelOpen(true)}
          showRightPanelToggle={showRightPanel}
        />

        <div className="shell">
          <AppSidebar />
          <TabletSidebar open={mobileOpen} onOpenChange={setMobileOpen} />

          <div className="content">
            <div className="page-panel">
              <MainContent className="feed bg-e0">
                {children}
              </MainContent>

              {showRightPanel && (
                <>
                  <MobileRightPanel
                    open={rightPanelOpen}
                    onOpenChange={setRightPanelOpen}
                  />
                  <RightPanel className="hidden h-full min-h-0 shrink-0 lg:block" />
                </>
              )}
            </div>
          </div>
        </div>

        <MobileBottomNav />
        <div className="hidden md:block">
          <AppFooter />
        </div>
      </div>
      <ToastProvider />
    </>
  );
}
