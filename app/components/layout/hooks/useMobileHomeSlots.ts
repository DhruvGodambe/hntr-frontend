"use client";

import { useEffect, useRef, useState } from "react";

export function useMobileHomeSlots(showMobileHomeRail: boolean, showMobileHomeActivity: boolean) {
  const profileSlotRef = useRef<HTMLDivElement | null>(null);
  const activitySlotRef = useRef<HTMLDivElement | null>(null);
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const [activityAnchor, setActivityAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!showMobileHomeRail) {
      setProfileAnchor(null);
      profileSlotRef.current?.remove();
      profileSlotRef.current = null;
      document.querySelectorAll(".mobile-profile-slot").forEach((el) => {
        if (!el.closest("#panel-home")) el.remove();
      });
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let timer: number | undefined;

    const place = () => {
      if (cancelled) return;
      const panel = document.getElementById("panel-home");
      const anchor = panel?.querySelector(".pbar") as HTMLElement | null;
      if (!anchor) {
        if (attempts++ < 20) {
          timer = window.setTimeout(place, 50);
        } else {
          setProfileAnchor(null);
        }
        return;
      }

      let slot = profileSlotRef.current;
      if (!slot) {
        slot = document.createElement("div");
        slot.className = "mobile-profile-slot";
        profileSlotRef.current = slot;
      }

      if (slot.previousElementSibling !== anchor) {
        anchor.insertAdjacentElement("afterend", slot);
      }
      setProfileAnchor(slot);
    };

    place();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [showMobileHomeRail]);

  useEffect(() => {
    if (!showMobileHomeActivity) {
      setActivityAnchor(null);
      activitySlotRef.current?.remove();
      activitySlotRef.current = null;
      document.querySelectorAll(".mobile-activity-slot").forEach((el) => {
        if (!el.closest("#panel-home")) el.remove();
      });
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let timer: number | undefined;

    const place = () => {
      if (cancelled) return;
      const feed = document.getElementById("feed-home");
      const footer = feed?.querySelector(".home-footer") as HTMLElement | null;
      if (!feed || !footer) {
        if (attempts++ < 20) {
          timer = window.setTimeout(place, 50);
        } else {
          setActivityAnchor(null);
        }
        return;
      }

      let slot = activitySlotRef.current;
      if (!slot) {
        slot = document.createElement("div");
        slot.className = "mobile-activity-slot";
        activitySlotRef.current = slot;
      }

      if (slot.nextElementSibling !== footer) {
        footer.insertAdjacentElement("beforebegin", slot);
      }
      setActivityAnchor(slot);
    };

    place();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [showMobileHomeActivity]);

  useEffect(() => {
    return () => {
      profileSlotRef.current?.remove();
      profileSlotRef.current = null;
      activitySlotRef.current?.remove();
      activitySlotRef.current = null;
    };
  }, []);

  return { profileAnchor, activityAnchor };
}
