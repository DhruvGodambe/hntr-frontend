"use client";

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
      <DialogContent variant="drawer-left" hideClose className="bg-[var(--sidebar-bg)]">
        <DialogTitle className="sr-only">Navigation menu</DialogTitle>
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
      <DialogContent variant="drawer-right" hideClose>
        <DialogTitle className="sr-only">Account overview</DialogTitle>
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
