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
import { cn } from "@/lib/utils";

type AppNavbarProps = {
  onMobileMenuOpen?: () => void;
  onRightPanelOpen?: () => void;
  showRightPanelToggle?: boolean;
  className?: string;
};

function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle
        cx="7"
        cy="7"
        r="4.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M10.5 10.5L13.5 13.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
        <NavbarIconBtn aria-label="Search">
          <SearchIcon />
        </NavbarIconBtn>
        <NotificationsPanel />
        {showRightPanelToggle && (
          <NavbarIconBtn
            aria-label="Open account panel"
            onClick={onRightPanelOpen}
            className="lg:hidden"
          >
            <PanelRight className="size-[13px]" />
          </NavbarIconBtn>
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
