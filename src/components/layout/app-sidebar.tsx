"use client";

import { HelpCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarThemeToggle } from "@/components/theme";
import { mainNavItems } from "@/lib/navigation";
import {
  SidebarRail,
  SidebarRailAction,
  SidebarRailContent,
  SidebarRailFooter,
  SidebarRailSeparator,
  SidebarNavItem,
} from "@/components/layout/sidebar-rail";

export function AppSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <SidebarRailContent>
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <SidebarNavItem
              key={item.label}
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
        <SidebarThemeToggle />
        <SidebarRailAction
          label="Support"
          href="mailto:support@hntr.art"
          icon={<HelpCircle strokeWidth={1.4} />}
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
  return <>{children}</>;
}
