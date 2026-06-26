import * as React from "react";
import { cn } from "@/lib/utils";

type NavbarProps = React.ComponentProps<"header">;

export function Navbar({ className, children, ...props }: NavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-e1 px-4 shadow-sh1 sm:px-6",
        className,
      )}
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
        "font-display text-lg font-semibold tracking-tight text-t4",
        className,
      )}
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
      className={cn("flex shrink-0 items-center gap-2 sm:gap-3", className)}
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
