"use client";

import { useEffect } from "react";
import { initPresentationVoiceOver } from "./presentationVoiceOver";

const EASE = "cubic-bezier(.22,1,.36,1)";
const REVEAL = 26;
const ACCENT = "#b64a09";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatCount(el: HTMLElement, value: number) {
  const dec = parseInt(el.getAttribute("data-dec") || "0", 10);
  const n = dec ? value.toFixed(dec) : Math.round(value).toLocaleString("en-US");
  return (el.getAttribute("data-fmt") || "#").replace("#", n);
}

function runCount(el: HTMLElement, replay = false) {
  if (!replay && el.dataset.countDone === "1") return;
  const token = String((Number(el.dataset.countToken) || 0) + 1);
  el.dataset.countToken = token;
  el.dataset.countDone = "1";
  const target = parseFloat(el.getAttribute("data-count") || "0");
  el.textContent = formatCount(el, 0);
  if (prefersReducedMotion()) {
    el.textContent = formatCount(el, target);
    return;
  }
  const dur = 1100;
  const t0 = performance.now();
  const step = (now: number) => {
    if (el.dataset.countToken !== token) return;
    const p = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = formatCount(el, target * e);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = formatCount(el, target);
  };
  requestAnimationFrame(step);
}

function sectionTop(root: HTMLElement, section: HTMLElement) {
  return section.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop;
}

export function usePresentationRuntime(ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    const root = document.getElementById("au-scroll");
    if (!root) return;

    root.style.setProperty("--ac", ACCENT);
    const reduce = prefersReducedMotion();
    const secs = Array.from(root.querySelectorAll<HTMLElement>("[data-au]"));

    const hostsMotion = (el: HTMLElement) =>
      Boolean(el.querySelector("[style*='auMarquee'], [style*='animation:'], [data-anim]"));

    secs.forEach((section) => {
      Array.from(section.querySelectorAll<HTMLElement>("[data-r]")).forEach((el) => {
        el.style.opacity = "0";
        const skipMove = reduce || hostsMotion(el);
        el.style.transform = skipMove ? "none" : `translate3d(0,${REVEAL}px,0)`;
        el.style.transition = skipMove
          ? `opacity .72s ${EASE}`
          : `opacity .72s ${EASE}, transform .78s ${EASE}`;
        el.style.willChange = skipMove ? "opacity" : "opacity,transform";
      });
      Array.from(section.querySelectorAll<HTMLElement>("[data-count]")).forEach((el) => {
        el.textContent = formatCount(el, 0);
      });
    });

    const playCounts = (section: HTMLElement, replay = false) => {
      const reveals = Array.from(section.querySelectorAll<HTMLElement>("[data-r]"));
      Array.from(section.querySelectorAll<HTMLElement>("[data-count]")).forEach((el, i) => {
        const fadeIdx = reveals.indexOf(el);
        const fadeDelay = reduce || fadeIdx < 0 ? 0 : Math.min(fadeIdx * 85, 620);
        window.setTimeout(() => runCount(el, replay), fadeDelay + 80 + i * 70);
      });
    };

    const layoutCollectionMosaic = (section: HTMLElement) => {
      const mosaic = section.querySelector<HTMLElement>("[style*='grid-template-rows:repeat(4']");
      if (!mosaic) return;
      const rows = Array.from(mosaic.children).filter((el) => {
        const pos = (el as HTMLElement).style.position || getComputedStyle(el).position;
        return pos !== "absolute";
      }) as HTMLElement[];
      if (!rows.length) return;
      const gap = parseFloat(getComputedStyle(mosaic).gap) || 7;
      const padTop = parseFloat(getComputedStyle(mosaic).paddingTop) || 7;
      const padBot = parseFloat(getComputedStyle(mosaic).paddingBottom) || 7;
      const inner = mosaic.clientHeight - padTop - padBot - gap * Math.max(0, rows.length - 1);
      const rowH = Math.max(36, Math.floor(inner / rows.length));
      rows.forEach((row) => {
        row.style.height = `${rowH}px`;
        row.style.minHeight = `${rowH}px`;
        row.style.flex = `0 0 ${rowH}px`;
        row.style.position = "relative";
        row.style.overflow = "hidden";
        const track = row.querySelector<HTMLElement>("[style*='auMarquee']");
        if (!track) return;
        track.style.position = "absolute";
        track.style.top = "0";
        track.style.left = "0";
        track.style.height = `${rowH}px`;
        Array.from(track.querySelectorAll("img")).forEach((img) => {
          img.style.height = `${rowH}px`;
          img.style.width = `${rowH}px`;
          img.style.flex = "0 0 auto";
        });
      });
    };

    const kickMarquees = (section: HTMLElement) => {
      const tracks = Array.from(
        section.querySelectorAll<HTMLElement>("[style*='auMarquee']"),
      );
      if (!tracks.length) return;
      layoutCollectionMosaic(section);
      const restart = () => {
        layoutCollectionMosaic(section);
        tracks.forEach((el) => {
          const prev = el.style.animation;
          el.style.animation = "none";
          void el.offsetWidth;
          el.style.animation = prev;
          el.style.animationPlayState = "running";
          (el.style as CSSStyleDeclaration & { webkitAnimationPlayState?: string }).webkitAnimationPlayState =
            "running";
        });
      };
      const imgs = Array.from(section.querySelectorAll("img"));
      const pending = imgs.filter((img) => !img.complete);
      if (!pending.length) {
        requestAnimationFrame(restart);
        return;
      }
      let left = pending.length;
      const done = () => {
        left -= 1;
        if (left <= 0) requestAnimationFrame(restart);
      };
      pending.forEach((img) => {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });
    };

    const showSection = (section: HTMLElement) => {
      if (section.dataset.shown === "1") return;
      section.dataset.shown = "1";
      Array.from(section.querySelectorAll<HTMLElement>("[data-r]")).forEach((el, i) => {
        const delay = reduce ? 0 : Math.min(i * 85, 620);
        window.setTimeout(() => {
          el.style.opacity = "1";
          el.style.transform = "none";
          el.style.willChange = "auto";
        }, delay);
      });
      Array.from(section.querySelectorAll<HTMLElement>("[data-bar]")).forEach((el, i) => {
        window.setTimeout(() => {
          el.style.width = `${el.getAttribute("data-bar")}%`;
        }, 260 + i * 55);
      });
      kickMarquees(section);
    };

    const rail = document.getElementById("au-rail") || document.createElement("div");
    rail.id = "au-rail";
    rail.replaceChildren();
    if (!rail.isConnected) document.body.appendChild(rail);
    const goTo = (section: HTMLElement) => {
      showSection(section);
      playCounts(section, true);
      root.scrollTo({ top: sectionTop(root, section), behavior: "smooth" });
    };
    const onRailWheel = (e: WheelEvent) => {
      root.scrollTop += e.deltaY;
      e.preventDefault();
    };
    rail.addEventListener("wheel", onRailWheel, { passive: false });
    const dots: HTMLElement[] = [];
    secs.forEach((section, i) => {
      const wrap = document.createElement("button");
      wrap.type = "button";
      wrap.setAttribute("aria-label", section.getAttribute("data-label") || `Section ${i + 1}`);
      wrap.style.cssText =
        "all:unset;cursor:pointer;display:flex;align-items:center;justify-content:flex-end;gap:9px;height:12px;min-width:12px;position:relative";
      const lab = document.createElement("span");
      lab.textContent = section.getAttribute("data-label") || "";
      lab.style.cssText =
        "font:500 15px/1 inherit;letter-spacing:-.01em;color:#6e6e73;opacity:0;transform:translateX(6px);transition:opacity .25s,transform .25s;white-space:nowrap;background:rgba(251,251,253,.86);padding:5px 9px;border-radius:9px";
      const dot = document.createElement("span");
      dot.style.cssText =
        "width:7px;height:7px;border-radius:50%;background:rgba(29,29,31,.2);transition:background .3s,transform .3s;flex:0 0 auto;display:block";
      wrap.appendChild(lab);
      wrap.appendChild(dot);
      wrap.addEventListener("mouseenter", () => {
        lab.style.opacity = "1";
        lab.style.transform = "translateX(0)";
      });
      wrap.addEventListener("mouseleave", () => {
        lab.style.opacity = "0";
        lab.style.transform = "translateX(6px)";
      });
      wrap.addEventListener("click", () => goTo(section));
      wrap.addEventListener("focus", () => {
        lab.style.opacity = "1";
        lab.style.transform = "translateX(0)";
      });
      wrap.addEventListener("blur", () => {
        lab.style.opacity = "0";
        lab.style.transform = "translateX(6px)";
      });
      rail.appendChild(wrap);
      dots.push(dot);
    });

    const counter = document.getElementById("au-count");
    const prog = document.getElementById("au-prog");
    const scrollHint = document.getElementById("au-scroll-hint");
    if (scrollHint && scrollHint.parentElement !== root) {
      root.appendChild(scrollHint);
    }
    let active = -1;

    const setActive = (i: number) => {
      if (active === i) return;
      active = i;
      const section = secs[i];
      if (section) {
        showSection(section);
        playCounts(section);
      }
      dots.forEach((d, j) => {
        d.style.background = j === i ? ACCENT : "rgba(29,29,31,.2)";
        d.style.transform = j === i ? "scale(1.55)" : "scale(1)";
      });
      if (counter) counter.textContent = `${pad(i + 1)} / ${pad(secs.length)}`;
      scrollHint?.classList.toggle("is-active", section?.id === "au-s1");
      if (section?.id === "au-s5") layoutCollectionMosaic(section);
    };

    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) showSection(entry.target as HTMLElement);
              });
            },
            { root, threshold: 0.12 },
          )
        : null;

    if (io) secs.forEach((s) => io.observe(s));
    else secs.forEach(showSection);

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = root.scrollHeight - root.clientHeight;
        if (prog) prog.style.width = `${max > 0 ? (root.scrollTop / max) * 100 : 0}%`;
        const mid = root.scrollTop + root.clientHeight * 0.4;
        let idx = 0;
        for (let i = 0; i < secs.length; i += 1) {
          if (sectionTop(root, secs[i]) <= mid) idx = i;
        }
        setActive(idx);
      });
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (secs[0]) showSection(secs[0]);
    const s5 = document.getElementById("au-s5");
    if (s5) {
      layoutCollectionMosaic(s5);
      requestAnimationFrame(() => layoutCollectionMosaic(s5));
    }
    const onMosaicResize = () => {
      const mosaicSection = document.getElementById("au-s5");
      if (mosaicSection) layoutCollectionMosaic(mosaicSection);
    };
    window.addEventListener("resize", onMosaicResize);
    window.addEventListener("orientationchange", onMosaicResize);

    const onKey = (e: KeyboardEvent) => {
      if (!["ArrowDown", "ArrowUp", "PageDown", "PageUp"].includes(e.key)) return;
      const next = e.key === "ArrowDown" || e.key === "PageDown" ? 1 : -1;
      const i = Math.max(0, Math.min(secs.length - 1, (active || 0) + next));
      e.preventDefault();
      goTo(secs[i]);
    };
    window.addEventListener("keydown", onKey);

    const pagerMq = window.matchMedia("(max-width: 900px)");
    const isPager = () => pagerMq.matches;
    const pagerExcluded = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      return Boolean(el?.closest?.("#au-vo, #au-lang, #au-header, a, input, textarea, select, button"));
    };

    const EDGE = 32;
    const SWIPE = 36;
    const TALL = 56;
    const sectionMetrics = (i: number) => {
      const section = secs[i];
      const top = section ? sectionTop(root, section) : 0;
      const overflow = section ? section.offsetHeight - root.clientHeight : 0;
      return { top, end: top + Math.max(0, overflow), tall: overflow > TALL };
    };
    const atSectionStart = (i: number) => root.scrollTop <= sectionMetrics(i).top + EDGE;
    const atSectionEnd = (i: number) => {
      const metrics = sectionMetrics(i);
      return !metrics.tall || root.scrollTop >= metrics.end - EDGE;
    };
    const canPage = (dir: number, from: number) => (dir > 0 ? atSectionEnd(from) : atSectionStart(from));

    let paging = false;
    let pageTimer = 0;
    const pageBy = (dir: number, from = Math.max(0, active)) => {
      if (!isPager() || paging) return false;
      if (!canPage(dir, from)) return false;
      const i = Math.max(0, Math.min(secs.length - 1, from + dir));
      if (i === from) return false;
      paging = true;
      goTo(secs[i]);
      window.clearTimeout(pageTimer);
      pageTimer = window.setTimeout(() => {
        paging = false;
      }, 680);
      return true;
    };

    let touchY = 0;
    let touchFrom = 0;
    let touching = false;
    const onTouchStart = (e: TouchEvent) => {
      if (!isPager() || e.touches.length !== 1 || pagerExcluded(e.target)) {
        touching = false;
        return;
      }
      touching = true;
      touchY = e.touches[0].clientY;
      touchFrom = Math.max(0, active);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!touching || !isPager() || paging) return;
      const dy = touchY - e.touches[0].clientY;
      const dir = dy > 0 ? 1 : -1;
      if (Math.abs(dy) > 12 && canPage(dir, touchFrom)) e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!touching) return;
      touching = false;
      if (!isPager()) return;
      const dy = touchY - (e.changedTouches[0]?.clientY ?? touchY);
      if (Math.abs(dy) < SWIPE) return;
      pageBy(dy > 0 ? 1 : -1, touchFrom);
    };
    const onPagerWheel = (e: WheelEvent) => {
      if (!isPager() || pagerExcluded(e.target) || paging) return;
      if (Math.abs(e.deltaY) < 10) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      const from = Math.max(0, active);
      if (!canPage(dir, from)) return;
      e.preventDefault();
      pageBy(dir, from);
    };

    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchmove", onTouchMove, { passive: false });
    root.addEventListener("touchend", onTouchEnd, { passive: true });
    root.addEventListener("touchcancel", onTouchEnd, { passive: true });
    root.addEventListener("wheel", onPagerWheel, { passive: false });

    const hoverCleanups: Array<() => void> = [];
    const canFineHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (!reduce) {
      Array.from(root.querySelectorAll<HTMLElement>("[data-anim-hover]")).forEach((panel) => {
        const parts = Array.from(panel.querySelectorAll<HTMLElement>("[data-anim]"));
        const set = (state: string) => parts.forEach((p) => {
          p.style.animationPlayState = state;
          (p.style as CSSStyleDeclaration & { webkitAnimationPlayState?: string }).webkitAnimationPlayState = state;
        });
        if (!canFineHover) {
          set("running");
          return;
        }
        set("paused");
        const enter = () => set("running");
        const leave = () => set("paused");
        panel.addEventListener("mouseenter", enter);
        panel.addEventListener("mouseleave", leave);
        hoverCleanups.push(() => {
          panel.removeEventListener("mouseenter", enter);
          panel.removeEventListener("mouseleave", leave);
        });
      });

      const radiusSel = (r: number) =>
        `[style*="border-radius:${r}px"],[style*="border-radius: ${r}px"]`;
      Array.from(root.querySelectorAll<HTMLElement>(`${radiusSel(26)},${radiusSel(22)}`))
        .filter((el) => el.tagName !== "A" && el.tagName !== "BUTTON")
        .forEach((card) => {
          if (
            card.closest("[data-pop-child]") ||
            card.closest("#au-rail") ||
            card.closest("#au-vo") ||
            card.closest("#au-scroll-hint") ||
            card.querySelector("[style*='auMarquee']")
          ) {
            return;
          }
          const dark = getComputedStyle(card).backgroundColor === "rgb(29, 29, 31)";
          const rest = card.style.boxShadow || getComputedStyle(card).boxShadow;
          const hot = dark
            ? "0 2px 6px rgba(0,0,0,.1),0 26px 60px rgba(0,0,0,.22)"
            : "0 2px 6px rgba(0,0,0,.06),0 26px 60px rgba(0,0,0,.13)";
          card.setAttribute("data-pop-child", "");
          card.style.transition = `box-shadow .4s ${EASE}, transform .4s ${EASE}`;
          const reset = () => {
            card.style.boxShadow = rest;
            card.style.transform = "translate3d(0,0,0)";
            card.style.zIndex = "";
          };
          if (canFineHover) {
            card.style.transformStyle = "preserve-3d";
            let hovering = false;
            const apply = (x: number, y: number) => {
              card.style.transform = `perspective(900px) translate3d(0,-7px,0) rotateX(${-y * 3.2}deg) rotateY(${x * 3.2}deg) scale(1.014)`;
            };
            const enter = () => {
              hovering = true;
              card.style.boxShadow = hot;
              card.style.zIndex = "2";
              apply(0, 0);
            };
            const move = (e: MouseEvent) => {
              if (!hovering) return;
              const r = card.getBoundingClientRect();
              apply((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
            };
            const leave = () => {
              hovering = false;
              reset();
            };
            card.addEventListener("mouseenter", enter);
            card.addEventListener("mousemove", move);
            card.addEventListener("mouseleave", leave);
            hoverCleanups.push(() => {
              card.removeEventListener("mouseenter", enter);
              card.removeEventListener("mousemove", move);
              card.removeEventListener("mouseleave", leave);
            });
          } else {
            const down = () => {
              card.style.boxShadow = hot;
              card.style.zIndex = "2";
              card.style.transform = "translate3d(0,-6px,0) scale(1.012)";
            };
            card.addEventListener("pointerdown", down);
            card.addEventListener("pointerup", reset);
            card.addEventListener("pointercancel", reset);
            card.addEventListener("pointerleave", reset);
            hoverCleanups.push(() => {
              card.removeEventListener("pointerdown", down);
              card.removeEventListener("pointerup", reset);
              card.removeEventListener("pointercancel", reset);
              card.removeEventListener("pointerleave", reset);
            });
          }
        });

      const pillSel = [19, 20, 21, 16, 11].map(radiusSel).join(",") + ',a[href],button[type="button"]';
      Array.from(root.querySelectorAll<HTMLElement>(pillSel)).forEach((p) => {
        if (p.hasAttribute("data-pop-child") || p.closest("[data-pop-child]")) return;
        if (p.closest("#au-rail") || p.id === "au-rail" || p.id === "au-vo" || p.closest("#au-lang")) return;
        p.setAttribute("data-pop-child", "");
        p.style.transition = `transform .32s ${EASE}, box-shadow .32s ${EASE}`;
        const enter = () => {
          p.style.transform = "translate3d(0,-4px,0) scale(1.035)";
        };
        const leave = () => {
          p.style.transform = "translate3d(0,0,0)";
        };
        if (canFineHover) {
          p.addEventListener("mouseenter", enter);
          p.addEventListener("mouseleave", leave);
          hoverCleanups.push(() => {
            p.removeEventListener("mouseenter", enter);
            p.removeEventListener("mouseleave", leave);
          });
        } else {
          p.addEventListener("pointerdown", enter);
          p.addEventListener("pointerup", leave);
          p.addEventListener("pointercancel", leave);
          p.addEventListener("pointerleave", leave);
          hoverCleanups.push(() => {
            p.removeEventListener("pointerdown", enter);
            p.removeEventListener("pointerup", leave);
            p.removeEventListener("pointercancel", leave);
            p.removeEventListener("pointerleave", leave);
          });
        }
      });
    }

    const scrollToTop = () => {
      const from = root.scrollTop;
      if (from <= 0) return;
      const snap = root.style.scrollSnapType || "y proximity";
      root.style.setProperty("scroll-snap-type", "none", "important");
      const t0 = performance.now();
      const dur = 650;
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        root.scrollTop = from * (1 - e);
        if (p < 1) requestAnimationFrame(step);
        else {
          root.scrollTop = 0;
          root.style.setProperty("scroll-snap-type", snap, "important");
        }
      };
      requestAnimationFrame(step);
    };

    const onDeckClick = (ev: Event) => {
      const a = (ev.target as HTMLElement | null)?.closest?.("a");
      if (!a || !root.contains(a)) return;

      if (a.classList.contains("au-top") || a.getAttribute("href") === "#au-s0") {
        ev.preventDefault();
        ev.stopPropagation();
        scrollToTop();
        return;
      }

      if (
        a.id === "au-cta" ||
        a.classList.contains("au-enter") ||
        a.getAttribute("href") === "/"
      ) {
        ev.preventDefault();
        ev.stopPropagation();
        window.location.assign("/");
        return;
      }

      const href = a.getAttribute("href") || "";
      if (href.startsWith("#au-")) {
        const target = document.getElementById(href.slice(1));
        if (!target) return;
        ev.preventDefault();
        goTo(target);
      }
    };
    document.addEventListener("click", onDeckClick, true);

    const stopVO = initPresentationVoiceOver(root, secs);

    return () => {
      io?.disconnect();
      root.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onMosaicResize);
      window.removeEventListener("orientationchange", onMosaicResize);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
      root.removeEventListener("touchend", onTouchEnd);
      root.removeEventListener("touchcancel", onTouchEnd);
      root.removeEventListener("wheel", onPagerWheel);
      window.clearTimeout(pageTimer);
      hoverCleanups.forEach((fn) => fn());
      document.removeEventListener("click", onDeckClick, true);
      rail.removeEventListener("wheel", onRailWheel);
      rail.replaceChildren();
      stopVO();
    };
  }, [ready]);
}
