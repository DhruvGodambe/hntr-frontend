"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type SidebarThemeToggleProps = {
  className?: string;
  showLabel?: boolean;
};

export function SidebarThemeToggle({
  className,
  showLabel = false,
}: SidebarThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const label = isDark ? "Dark Mode" : "Light Mode";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title="Light / Dark"
      className={cn(
        "mx-[5px] flex h-[34px] w-[calc(100%-10px)] items-center overflow-hidden rounded-md text-[var(--sidebar-text)] transition-colors hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text-active)]",
        className,
      )}
    >
      <span className="flex size-9 min-w-9 shrink-0 items-center justify-center [&_svg]:size-3.5">
        {isDark ? (
          <Moon strokeWidth={1.4} />
        ) : (
          <Sun strokeWidth={1.4} />
        )}
      </span>
      <span
        className={cn(
          "sidebar-label whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.07em]",
          showLabel && "sidebar-label-visible",
        )}
      >
        {label}
      </span>
    </button>
  );
}
