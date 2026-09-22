"use client";

import { PRESENTATION_VOICED_LANGS, readStoredPresentationLang } from "./presentationI18n";

type VoLang = (typeof PRESENTATION_VOICED_LANGS)[number];

type VoSet = { files: string[]; durs: number[] };

const VO: Record<VoLang, VoSet> = {
  en: { files: ["/assets/about/vo-1.mp3", "/assets/about/vo-2.mp3", "/assets/about/vo-3.mp3"], durs: [289.23, 294.32, 188.53] },
  it: { files: ["/assets/about/vo-it-1.mp3", "/assets/about/vo-it-2.mp3", "/assets/about/vo-it-3.mp3"], durs: [336.12, 336.3, 214.07] },
  es: { files: ["/assets/about/vo-es-1.mp3", "/assets/about/vo-es-2.mp3", "/assets/about/vo-es-3.mp3"], durs: [298.45, 294.43, 198.79] },
  ru: { files: ["/assets/about/vo-ru-1.mp3", "/assets/about/vo-ru-2.mp3", "/assets/about/vo-ru-3.mp3"], durs: [377.42, 354.85, 192.91] },
  pt: { files: ["/assets/about/vo-pt-1.mp3", "/assets/about/vo-pt-2.mp3", "/assets/about/vo-pt-3.mp3"], durs: [326.37, 320.99, 190.01] },
};

const CUES: Record<VoLang, number[]> = {
  en: [0, 13.16, 51.38, 88.4, 130.76, 161.46, 193.16, 279.57, 294.2, 329.63, 354.03, 438.56, 485.78, 521.84, 552.14, 583.55, 609.39, 632.32, 675.72, 705.81, 762.78],
  it: [0, 15.11, 58.99, 101.5, 150.14, 185.39, 221.78, 321, 337.8, 378.48, 406.49, 503.55, 557.76, 599.17, 633.96, 670.02, 699.69, 726.02, 775.85, 810.4, 875.81],
  es: [0, 13.49, 52.68, 90.64, 134.08, 165.56, 198.06, 286.66, 301.66, 337.99, 363.01, 449.69, 498.11, 535.08, 566.15, 598.36, 624.85, 648.36, 692.87, 723.72, 782.13],
  ru: [0, 15.77, 61.57, 105.93, 156.69, 193.48, 231.46, 335.01, 352.54, 394.99, 424.23, 525.52, 582.11, 625.32, 661.63, 699.27, 730.23, 757.71, 809.71, 845.77, 914.04],
  pt: [0, 14.27, 55.72, 95.88, 141.82, 175.11, 209.49, 303.21, 319.08, 357.5, 383.97, 475.65, 526.86, 565.97, 598.83, 632.9, 660.92, 685.79, 732.86, 765.5, 827.28],
};

const ICON_PLAY = '<path d="M2.5 1.6 13 8 2.5 14.4V1.6Z" fill="#f5f5f7"></path>';
const ICON_PAUSE =
  '<rect x="2.6" y="1.8" width="3.6" height="12.4" rx="1.2" fill="#f5f5f7"></rect><rect x="8.8" y="1.8" width="3.6" height="12.4" rx="1.2" fill="#f5f5f7"></rect>';
const RATES = [1, 1.25, 1.5, 1.75, 2];
const STORAGE_KEY = "hntr-about-vo";

function isVoLang(code: string): code is VoLang {
  return code in VO;
}

function clock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${`0${s % 60}`.slice(-2)}`;
}

function sectionTop(root: HTMLElement, section: HTMLElement) {
  return section.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop;
}

type SavedVo = { t?: number; v?: number; m?: boolean; r?: number };

export function initPresentationVoiceOver(root: HTMLElement, secs: HTMLElement[]): () => void {
  const host = document.getElementById("au-vo");
  if (!host) return () => undefined;

  window.AU_VOICED = [...PRESENTATION_VOICED_LANGS];

  let lang: VoLang = "en";
  let files = VO.en.files;
  let offs: number[] = [];
  let total = 0;
  let cues: number[] = [];

  const setTrackSet = (code: string) => {
    lang = isVoLang(code) ? code : "en";
    files = VO[lang].files;
    offs = [];
    let acc = 0;
    VO[lang].durs.forEach((d) => {
      offs.push(acc);
      acc += d;
    });
    total = acc;
  };
  setTrackSet("en");

  const weights = secs.map((s) => {
    const words = (s.innerText || "").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(26, words);
  });
  const wsum = weights.reduce((a, b) => a + b, 0);
  const estimate = () => {
    const out: number[] = [];
    let t = 0;
    weights.forEach((w) => {
      out.push(t);
      t += (w / wsum) * total;
    });
    return out;
  };
  const cueStoreKey = () => `hntr-about-cues-${lang}`;
  const loadCues = () => {
    let saved: number[] | null = null;
    try {
      saved = JSON.parse(localStorage.getItem(cueStoreKey()) || "null");
    } catch {
      saved = null;
    }
    const baked = CUES[lang];
    const src =
      Array.isArray(saved) && saved.length === secs.length
        ? saved
        : Array.isArray(baked) && baked.length === secs.length
          ? baked
          : null;
    cues = src ? src.slice() : estimate();
  };
  loadCues();

  const playBtn = document.getElementById("au-vo-play");
  const icon = document.getElementById("au-vo-icon");
  const timeEl = document.getElementById("au-vo-time");
  const bar = document.getElementById("au-vo-bar");
  const fill = document.getElementById("au-vo-fill");
  const vol = document.getElementById("au-vo-vol") as HTMLInputElement | null;
  const mute = document.getElementById("au-vo-mute");
  const vicon = document.getElementById("au-vo-vicon");
  const follow = document.getElementById("au-vo-follow");
  const farrow = document.getElementById("au-vo-farrow");
  const waves = document.getElementById("au-vo-waves");
  const slash = document.getElementById("au-vo-slash");
  const rateBtn = document.getElementById("au-vo-rate");

  const audio = new Audio();
  audio.preload = "metadata";

  let track = -1;
  let playing = false;
  let cueAt = -1;
  let lastSave = 0;
  let raf = 0;
  let cap: number[] | null = null;
  let autoScrollUntil = 0;
  let rate = 1;

  let saved: SavedVo | null = null;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    saved = null;
  }
  let startAt = saved && typeof saved.t === "number" ? Math.min(saved.t, total - 1) : 0;
  audio.volume = saved && typeof saved.v === "number" && saved.v > 0.02 ? saved.v : 1;
  if (vol) vol.value = String(audio.volume);
  if (saved && typeof saved.r === "number" && RATES.includes(saved.r)) rate = saved.r;

  const save = (g: number) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ t: g, v: audio.volume, m: audio.muted, r: audio.playbackRate }));
    } catch {
      /* ignore */
    }
  };

  const trackFor = (g: number) => {
    let i = 0;
    for (let k = 0; k < offs.length; k += 1) if (g >= offs[k]) i = k;
    return i;
  };

  const loadTo = (g: number, autoplay: boolean) => {
    const i = trackFor(g);
    if (i !== track) {
      track = i;
      audio.src = files[i];
    }
    const local = Math.max(0, g - offs[i]);
    const seek = () => {
      try {
        audio.currentTime = local;
      } catch {
        /* ignore */
      }
    };
    if (audio.readyState >= 1) seek();
    else audio.addEventListener("loadedmetadata", seek, { once: true });
    audio.playbackRate = rate;
    if (autoplay) audio.play().catch(() => undefined);
  };

  const now = () => (track < 0 ? startAt : offs[track] + (audio.currentTime || 0));

  const visibleIndex = () => {
    const mid = root.scrollTop + root.clientHeight * 0.4;
    let i = 0;
    for (let k = 0; k < secs.length; k += 1) if (sectionTop(root, secs[k]) <= mid) i = k;
    return i;
  };

  const showFollow = (on: boolean, at?: number) => {
    if (!follow) return;
    follow.style.display = on ? "inline-flex" : "none";
    if (on && farrow) farrow.style.transform = (at == null ? visibleIndex() : at) > cueAt ? "rotate(180deg)" : "rotate(0deg)";
  };

  const goTo = (i: number) => {
    const s = secs[i];
    if (!s) return;
    autoScrollUntil = performance.now() + 1200;
    showFollow(false);
    root.scrollTo({ top: sectionTop(root, s), behavior: "smooth" });
  };

  const panTall = (g: number) => {
    const i = cueAt;
    const s = secs[i];
    if (!s) return;
    const over = s.scrollHeight - root.clientHeight;
    if (over < 40) return;
    const start = cues[i] == null ? 0 : cues[i];
    const end = cues[i + 1] == null ? total : cues[i + 1];
    const span = end - start;
    if (span <= 2) return;
    const p = Math.max(0, Math.min(1, (g - start) / span));
    const k = p < 0.2 ? 0 : (p - 0.2) / 0.8;
    const target = sectionTop(root, s) + over * (k * k * (3 - 2 * k));
    if (Math.abs(root.scrollTop - target) < 1.5) return;
    autoScrollUntil = performance.now() + 240;
    root.scrollTop = target;
  };

  const onUserScroll = () => {
    if (!playing || performance.now() < autoScrollUntil) return;
    const i = visibleIndex();
    showFollow(i !== cueAt, i);
  };
  root.addEventListener("scroll", onUserScroll, { passive: true });

  const onFollowClick = () => {
    if (cueAt >= 0) goTo(cueAt);
  };
  follow?.addEventListener("click", onFollowClick);

  const capLabel = () => {
    if (!timeEl) return;
    timeEl.textContent = cap ? `REC ${cap.length} / ${secs.length}` : `${clock(now())} / ${clock(total)}`;
    host.style.boxShadow = cap
      ? "0 0 0 2px var(--ac,#b64a09),0 16px 44px rgba(0,0,0,.14)"
      : "0 1px 2px rgba(0,0,0,.06),0 16px 44px rgba(0,0,0,.14)";
  };

  const tick = () => {
    if (!playing) return;
    const g = now();
    if (fill) fill.style.width = `${(g / total) * 100}%`;
    if (timeEl) timeEl.textContent = `${clock(g)} / ${clock(total)}`;
    if (cap) {
      capLabel();
      raf = requestAnimationFrame(tick);
      return;
    }
    let i = 0;
    for (let k = 0; k < cues.length; k += 1) if (cues[k] <= g + 0.15) i = k;
    if (i !== cueAt) {
      cueAt = i;
      goTo(i);
      save(g);
    } else {
      if (performance.now() > autoScrollUntil) panTall(g);
      if (g - lastSave > 1) {
        lastSave = g;
        save(g);
      }
    }
    raf = requestAnimationFrame(tick);
  };

  const setPlaying = (on: boolean) => {
    playing = on;
    if (icon) icon.innerHTML = on ? ICON_PAUSE : ICON_PLAY;
    playBtn?.setAttribute("aria-label", on ? "Pause narrated presentation" : "Play narrated presentation");
    if (on) {
      cueAt = -1;
      raf = requestAnimationFrame(tick);
    } else {
      showFollow(false);
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }
  };

  const onPlay = () => {
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    const g = now() >= total - 0.5 ? 0 : now();
    loadTo(g, true);
    setPlaying(true);
  };
  playBtn?.addEventListener("click", onPlay);

  const onEnded = () => {
    if (track < files.length - 1) {
      track += 1;
      audio.src = files[track];
      audio.playbackRate = rate;
      audio.play().catch(() => undefined);
      return;
    }
    setPlaying(false);
    startAt = 0;
    track = -1;
    if (fill) fill.style.width = "0%";
    if (timeEl) timeEl.textContent = `0:00 / ${clock(total)}`;
    save(0);
  };
  audio.addEventListener("ended", onEnded);

  const onBar = (e: MouseEvent) => {
    if (!bar) return;
    const r = bar.getBoundingClientRect();
    const g = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * total;
    startAt = g;
    loadTo(g, playing);
    if (fill) fill.style.width = `${(g / total) * 100}%`;
    if (timeEl) timeEl.textContent = `${clock(g)} / ${clock(total)}`;
    let i = 0;
    for (let k = 0; k < cues.length; k += 1) if (cues[k] <= g + 0.15) i = k;
    cueAt = i;
    goTo(i);
    save(g);
  };
  bar?.addEventListener("click", onBar);

  const syncVolIcon = () => {
    const off = audio.muted || audio.volume <= 0.001;
    if (waves) waves.style.display = off ? "none" : "";
    if (slash) slash.style.display = off ? "" : "none";
    if (vicon) vicon.style.opacity = off ? ".55" : "1";
    mute?.setAttribute("aria-label", off ? "Unmute" : "Mute");
  };

  const onVol = () => {
    if (!vol) return;
    audio.volume = parseFloat(vol.value);
    if (audio.volume > 0) audio.muted = false;
    syncVolIcon();
    save(now());
  };
  vol?.addEventListener("input", onVol);

  const onMute = () => {
    if (audio.muted || audio.volume <= 0.001) {
      audio.muted = false;
      if (audio.volume <= 0.001) audio.volume = 1;
      if (vol) vol.value = String(audio.volume);
    } else {
      audio.muted = true;
    }
    syncVolIcon();
    save(now());
  };
  mute?.addEventListener("click", onMute);
  syncVolIcon();

  const capStamp = () => {
    if (!cap) return;
    cap.push(cap.length === 0 ? 0 : now());
    goTo(cap.length - 1);
    capLabel();
    if (cap.length >= secs.length) capFinish();
  };
  const capFinish = () => {
    if (!cap) return;
    const out = cap.map((v) => Math.round(v * 100) / 100);
    cap = null;
    try {
      localStorage.setItem(cueStoreKey(), JSON.stringify(out));
    } catch {
      /* ignore */
    }
    cues = out;
    cueAt = -1;
    capLabel();
    try {
      navigator.clipboard.writeText(JSON.stringify(out)).catch(() => undefined);
    } catch {
      /* ignore */
    }
  };
  const capStart = () => {
    cap = [];
    startAt = 0;
    track = -1;
    loadTo(0, true);
    setPlaying(true);
    capStamp();
  };
  const onCapKey = (e: KeyboardEvent) => {
    if (host.style.display === "none") return;
    if (e.shiftKey && (e.key === "T" || e.key === "t")) {
      e.preventDefault();
      if (cap) capFinish();
      else capStart();
      return;
    }
    if (cap && (e.key === " " || e.key === "Enter" || e.key === "ArrowRight")) {
      e.preventDefault();
      capStamp();
    }
    if (cap && e.key === "Escape") {
      e.preventDefault();
      cap = null;
      capLabel();
    }
  };
  window.addEventListener("keydown", onCapKey);

  const applyRate = () => {
    audio.playbackRate = rate;
    audio.defaultPlaybackRate = rate;
    if (!rateBtn) return;
    rateBtn.textContent = `${rate % 1 === 0 ? rate : rate.toFixed(2).replace(/0$/, "")}×`;
    rateBtn.style.background = rate === 1 ? "#f5f5f7" : "#1d1d1f";
    rateBtn.style.color = rate === 1 ? "#1d1d1f" : "#f5f5f7";
  };
  applyRate();
  const onRate = () => {
    rate = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    applyRate();
    save(now());
  };
  rateBtn?.addEventListener("click", onRate);

  if (timeEl) timeEl.textContent = `${clock(startAt)} / ${clock(total)}`;
  if (fill) fill.style.width = `${(startAt / total) * 100}%`;

  const currentLang = () => window.AU_I18N?.current?.() || readStoredPresentationLang();
  const langWatch = () => {
    const cur = currentLang();
    const on = isVoLang(cur);
    host.style.display = on ? "flex" : "none";
    if (!on) {
      if (playing) {
        audio.pause();
        setPlaying(false);
      }
      return;
    }
    if (cur !== lang) {
      const wasPlaying = playing;
      if (wasPlaying) {
        audio.pause();
        setPlaying(false);
      }
      setTrackSet(cur);
      loadCues();
      track = -1;
      startAt = 0;
      cueAt = -1;
      lastSave = 0;
      if (fill) fill.style.width = "0%";
      if (timeEl) timeEl.textContent = `0:00 / ${clock(total)}`;
      save(0);
      if (wasPlaying) {
        loadTo(0, true);
        setPlaying(true);
      }
    }
  };
  langWatch();
  const langTimer = window.setInterval(langWatch, 700);

  return () => {
    audio.pause();
    audio.src = "";
    audio.removeEventListener("ended", onEnded);
    if (raf) cancelAnimationFrame(raf);
    window.clearInterval(langTimer);
    window.removeEventListener("keydown", onCapKey);
    root.removeEventListener("scroll", onUserScroll);
    follow?.removeEventListener("click", onFollowClick);
    playBtn?.removeEventListener("click", onPlay);
    bar?.removeEventListener("click", onBar);
    vol?.removeEventListener("input", onVol);
    mute?.removeEventListener("click", onMute);
    rateBtn?.removeEventListener("click", onRate);
  };
}
