"use client";

import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { mainNavItems } from "@/lib/navigation";
import {
  SidebarRail,
  SidebarRailContent,
  SidebarRailFooter,
  SidebarRailHeader,
  SidebarRailProvider,
  SidebarRailSeparator,
  SidebarNavItem,
} from "@/components/layout/sidebar-rail";

function AppSidebarNav({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <SidebarRailHeader />
      <SidebarRailContent>
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
              variant="rail"
              onNavigate={onNavigate}
            />
          );
        })}
      </SidebarRailContent>
      <SidebarRailSeparator />
      <SidebarRailFooter>
        <SidebarNavItem
          href="/info"
          label="Settings"
          icon={<Settings />}
          active={pathname === "/info"}
          variant="rail"
          onNavigate={onNavigate}
        />
      </SidebarRailFooter>
    </>
  );
}

export function AppSidebar() {
  return (
    <SidebarRail>
      <AppSidebarNav />
    </SidebarRail>
  );
}

export function AppSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarRailProvider defaultExpanded>{children}</SidebarRailProvider>;
}
