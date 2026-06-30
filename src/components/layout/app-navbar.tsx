"use client";

import Link from "next/link";
import { Menu, PanelRight } from "lucide-react";
import {
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarLogo,
} from "@/components/ui/navbar";
import { useConnectWizard } from "@/features/auth";
import { NotificationsPanel } from "@/features/notifications";
import { ThemeToggle } from "@/components/theme";
import { cn } from "@/lib/utils";

type AppNavbarProps = {
  onMobileMenuOpen?: () => void;
  onRightPanelOpen?: () => void;
  showRightPanelToggle?: boolean;
  className?: string;
};

function NavbarIconBtn({
  onClick,
  "aria-label": ariaLabel,
  className,
  children,
}: {
  onClick?: () => void;
  "aria-label": string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn("nav-btn", className)}
    >
      {children}
    </button>
  );
}

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
        <NavbarIconBtn
          aria-label="Open navigation menu"
          onClick={onMobileMenuOpen}
          className="lg:hidden"
        >
          <Menu className="size-[13px]" />
        </NavbarIconBtn>
        <Link href="/" aria-label="HNTR home" className="nav-brand">
          <NavbarLogo />
        </Link>
      </NavbarBrand>

      <NavbarActions>
        <ThemeToggle className="lg:hidden" />
        <NotificationsPanel />
        {showRightPanelToggle && (
          <div className="lg:hidden">
            <NavbarIconBtn
              aria-label="Open account panel"
              onClick={onRightPanelOpen}
            >
              <PanelRight className="size-[13px]" />
            </NavbarIconBtn>
          </div>
        )}
        <button
          type="button"
          onClick={openWizard}
          className={cn("conn-pill", !isConnected && "disconnected")}
        >
          <span className="conn-dot" aria-hidden />
          {isConnected ? "0x71C...492" : "0x71C...4"}
        </button>
      </NavbarActions>
    </Navbar>
  );
}
