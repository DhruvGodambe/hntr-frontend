"use client";

import * as React from "react";
import { AppNavbar } from "@/components/layout/app-navbar";
import { AppSidebar, AppSidebarProvider } from "@/components/layout/app-sidebar";
import { MainContent } from "@/components/layout/main-content";
import { RightPanel } from "@/components/layout/right-panel";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarNavItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { mainNavItems } from "@/lib/navigation";
import { Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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
  const pathname = usePathname();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-0 top-0 flex h-dvh max-h-dvh w-[min(100%,280px)] max-w-[280px] translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-r p-0 sm:rounded-none">
        <DialogTitle className="sr-only">Navigation menu</DialogTitle>
        <SidebarProvider defaultExpanded>
          <Sidebar forceVisible className="h-full w-full border-0">
            <SidebarHeader />
            <SidebarContent>
              <SidebarGroup>
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return (
                    <SidebarNavItem
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      icon={<Icon />}
                      active={active}
                      onNavigate={() => onOpenChange(false)}
                    />
                  );
                })}
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarNavItem
                href="/info"
                label="Settings"
                icon={<Settings />}
                active={pathname === "/info"}
                onNavigate={() => onOpenChange(false)}
              />
            </SidebarFooter>
          </Sidebar>
        </SidebarProvider>
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
      <DialogContent className="left-auto right-0 top-0 flex h-dvh max-h-dvh w-[min(100%,320px)] max-w-[320px] translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-l p-0 sm:rounded-none">
        <DialogTitle className="sr-only">Account overview</DialogTitle>
        <RightPanel className="h-full w-full overflow-y-auto border-0 shadow-none" />
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
    <AppSidebarProvider>
      <div className="flex h-dvh overflow-hidden bg-e0">
        <AppSidebar />
        <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppNavbar
          onMobileMenuOpen={() => setMobileOpen(true)}
          onRightPanelOpen={() => setRightPanelOpen(true)}
          showRightPanelToggle={showRightPanel}
        />

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <MainContent className="min-w-0 flex-1">
            <div className="overflow-x-hidden px-[18px] pb-10 pt-[18px]">{children}</div>
          </MainContent>

          {showRightPanel && (
            <>
              <MobileRightPanel
                open={rightPanelOpen}
                onOpenChange={setRightPanelOpen}
              />
              <RightPanel
                className={cn(
                  "hidden h-full shrink-0 overflow-y-auto border-t border-border xl:flex xl:border-t-0 xl:border-l",
                )}
              />
            </>
          )}
        </div>
      </div>
      </div>
    </AppSidebarProvider>
  );
}
