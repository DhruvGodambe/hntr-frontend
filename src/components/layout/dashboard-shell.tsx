"use client";

import { X } from "lucide-react";
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

function MobileSidebar({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="drawer-left" hideClose className="relative bg-[var(--sidebar-bg)]">
        <DialogTitle className="sr-only">Navigation menu</DialogTitle>
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
      </DialogContent>
    </Dialog>
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
          <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />

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

        <AppFooter />
      </div>
      <ToastProvider />
    </>
  );
}
