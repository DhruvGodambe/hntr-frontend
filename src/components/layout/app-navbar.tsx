"use client";

import { Menu, PanelRight, Search } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme";
import { Button } from "@/components/ui/button";
import {
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarItem,
  NavbarLogo,
} from "@/components/ui/navbar";
import { useConnectWizard } from "@/features/auth";
import { NotificationsPanel } from "@/features/notifications";

type AppNavbarProps = {
  onMobileMenuOpen?: () => void;
  onRightPanelOpen?: () => void;
  showRightPanelToggle?: boolean;
  className?: string;
};

export function AppNavbar({
  onMobileMenuOpen,
  onRightPanelOpen,
  showRightPanelToggle = false,
  className,
}: AppNavbarProps) {
  const { isConnected, openWizard } = useConnectWizard();

  return (
    <Navbar className={className}>
      <NavbarBrand>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMobileMenuOpen}
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </Button>
        <NavbarItem className="flex">
          <Link href="/" aria-label="HNTR home">
            <NavbarLogo />
          </Link>
        </NavbarItem>
      </NavbarBrand>

      <NavbarActions>
        <Button type="button" variant="ghost" size="icon" aria-label="Search">
          <Search className="size-4" />
        </Button>
        <NotificationsPanel />
        <ThemeToggle />
        {showRightPanelToggle && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="xl:hidden"
            onClick={onRightPanelOpen}
            aria-label="Open account panel"
          >
            <PanelRight className="size-4" />
          </Button>
        )}
        <Button size="sm" onClick={openWizard}>
          {isConnected ? "Connected" : "Connect Wallet"}
        </Button>
      </NavbarActions>
    </Navbar>
  );
}
