"use client";

import * as React from "react";
import { AppFooter } from "@/components/layout/app-footer";
import { AppNavbar } from "@/components/layout/app-navbar";
import { AppSidebar, AppSidebarNav } from "@/components/layout/app-sidebar";
import { MainContent } from "@/components/layout/main-content";
import { PageLoader } from "@/components/layout/page-loader";
import { RightPanel } from "@/components/layout/right-panel";
import { SidebarRail } from "@/components/layout/sidebar-rail";
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
      <DialogContent className="left-0 top-0 flex h-dvh max-h-dvh w-[min(100%,280px)] max-w-[280px] translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-r border-bd1 bg-[var(--sidebar-bg)] p-0 sm:rounded-none">
        <DialogTitle className="sr-only">Navigation menu</DialogTitle>
        <SidebarRail
          data-mobile-nav
          className="mt-0 ml-0 !flex h-full w-full min-w-0 rounded-none hover:w-full"
        >
          <AppSidebarNav onNavigate={() => onOpenChange(false)} />
        </SidebarRail>
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
      <DialogContent className="left-auto right-0 top-0 flex h-dvh max-h-dvh w-[min(100%,320px)] max-w-[320px] translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-l border-bd1 p-0 sm:rounded-none">
        <DialogTitle className="sr-only">Account overview</DialogTitle>
        <RightPanel className="h-full min-h-0 w-full max-w-none border-0 shadow-none" />
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
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-e0">
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
              <MainContent className="feed min-w-0 flex-1 bg-e0 px-4 pb-10 pt-4">
                {children}
              </MainContent>

              {showRightPanel && (
                <>
                  <MobileRightPanel
                    open={rightPanelOpen}
                    onOpenChange={setRightPanelOpen}
                  />
                  <RightPanel className="hidden h-full min-h-0 shrink-0 xl:block" />
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
