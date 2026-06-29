import * as React from "react";
import { cn } from "@/lib/utils";

type NavbarProps = React.ComponentProps<"header">;

export function Navbar({ className, children, ...props }: NavbarProps) {
  return (
    <header
      className={cn(
        "z-20 flex h-11 shrink-0 items-center justify-between gap-4 px-5",
        className,
      )}
      style={{
        background: "var(--navbar-bg)",
        boxShadow: "var(--navbar-shadow)",
      }}
      {...props}
    >
      {children}
    </header>
  );
}

export function NavbarBrand({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex min-w-0 items-center gap-3", className)}
      {...props}
    />
  );
}

export function NavbarLogo({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "font-display text-stat font-bold tracking-[0.2em]",
        className,
      )}
      style={{ color: "var(--navbar-text)" }}
      {...props}
    >
      HNTR
    </span>
  );
}

export function NavbarActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex shrink-0 items-center gap-2", className)}
      {...props}
    />
  );
}

export function NavbarItem({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center", className)}
      {...props}
    />
  );
}
