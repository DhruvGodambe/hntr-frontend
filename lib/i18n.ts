/**
 * Site-wide language layer, ported from the V2 design's `hntr-i18n.js`.
 *
 * Translates rendered text nodes and placeholder/title/aria-label attributes by
 * exact English match against the design's dictionary packs (public/i18n/*.js,
 * each pushes `{src:[...], es:[...], ...}` into `window.HNTR_I18N_PACKS`).
 * A MutationObserver re-translates whatever React renders or updates, so pages
 * need no per-string wiring. Mark a subtree `data-no-i18n` to opt it out.
 *
 * Packs are only fetched once a non-English language is chosen.
 */

export type LangCode = "en" | "es" | "pt" | "hi" | "zh" | "ru" | "ko" | "th" | "fr";
export type LangInfo = { c: LangCode; n: string; s: string };

export const LANGS: LangInfo[] = [
  { c: "en", n: "English", s: "EN" },
  { c: "es", n: "Español", s: "ES" },
  { c: "pt", n: "Português", s: "PT" },
  { c: "hi", n: "हिन्दी", s: "HI" },
  { c: "zh", n: "中文", s: "中文" },
  { c: "ru", n: "Русский", s: "RU" },
  { c: "ko", n: "한국어", s: "KO" },
  { c: "th", n: "ไทย", s: "TH" },
  { c: "fr", n: "Français", s: "FR" },
];

type Pack = { src: string[] } & Partial<Record<LangCode, string[]>>;

type HntrLangApi = {
  set: (c: string, fromOutside?: boolean) => void;
  get: () => LangCode;
  langs: LangInfo[];
  refresh: () => void;
};

declare global {
  interface Window {
    HNTR_I18N_PACKS?: Pack[];
    HNTR_LANG?: HntrLangApi;
    AU_I18N?: { set?: (c: string) => void; current?: () => string };
    HNTR_LEARN_SETLANG?: (c: string) => void;
    __hntrLang?: string;
  }
}

const KEY = "hntr-lang";
const PACK_URLS = ["/i18n/main.js", "/i18n/extra.js"];
const ATTRS = ["placeholder", "title", "aria-label"];

let lang: LangCode = "en";
let map: Map<string, string> | null = null;
let busy = false;
let started = false;
let packsPromise: Promise<void> | null = null;
const orig = new WeakMap<Text, { en: string; out: string }>();
const fitted = new Set<HTMLElement>();
const listeners = new Set<(c: LangCode) => void>();

type AttrEl = Element & { __i18nLast?: Record<string, string> };
type FitEl = HTMLElement & { __i18nFs?: { inline: string } };

const isLang = (c: string | null | undefined): c is LangCode => !!c && LANGS.some((l) => l.c === c);
const norm = (s: string) => s.replace(/\s+/g, " ").trim();

function loadPacks(): Promise<void> {
  if (packsPromise) return packsPromise;
  packsPromise = Promise.all(
    PACK_URLS.map(
      (src) =>
        new Promise<void>((resolve) => {
          const s = document.createElement("script");
          s.src = src;
          s.async = true;
          s.onload = () => resolve();
          s.onerror = () => resolve();
          document.head.appendChild(s);
        }),
    ),
  ).then(() => undefined);
  return packsPromise;
}

function build() {
  map = null;
  if (lang === "en") return;
  const m = new Map<string, string>();
  (window.HNTR_I18N_PACKS || []).forEach((p) => {
    const a = p[lang] || [];
    p.src.forEach((s, i) => {
      if (a[i]) m.set(s, a[i]);
    });
  });
  map = m;
}

function skip(el: Element | null): boolean {
  for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
    const t = e.tagName;
    if (t === "SCRIPT" || t === "STYLE" || t === "TEXTAREA" || t === "CODE" || t === "svg" || t === "SVG") return true;
    if (e.hasAttribute("data-no-i18n") && !e.hasAttribute("data-i18n-force")) return true;
  }
  return false;
}

function trText(n: Text) {
  const cur = n.nodeValue ?? "";
  let rec = orig.get(n);
  // A value we didn't write means React (or anyone) set new English source text.
  if (!rec || cur !== rec.out) {
    rec = { en: cur, out: cur };
    orig.set(n, rec);
  }
  const en = rec.en;
  let out = en;
  if (map) {
    const k = norm(en);
    const hit = k ? map.get(k) : undefined;
    if (hit) out = (en.match(/^\s*/)?.[0] ?? "") + hit + (en.match(/\s*$/)?.[0] ?? "");
  }
  if (out !== cur) {
    n.nodeValue = out;
    if (n.parentElement) fitted.add(n.parentElement);
  }
  rec.out = out;
}

function trAttrs(el: AttrEl) {
  for (const a of ATTRS) {
    if (!el.hasAttribute(a)) continue;
    const key = `data-i18n-${a}`;
    const cur = el.getAttribute(a) ?? "";
    const last = el.__i18nLast?.[a];
    let o = el.getAttribute(key);
    if (o === null || cur !== last) {
      o = cur;
      el.setAttribute(key, o);
    }
    const k = norm(o);
    const out = map?.get(k) ?? o;
    if (out !== cur) el.setAttribute(a, out);
    (el.__i18nLast = el.__i18nLast || {})[a] = out;
  }
}

function walk(root: Node | null) {
  if (!root) return;
  if (root.nodeType === 3) {
    if (!skip(root.parentElement)) trText(root as Text);
    return;
  }
  if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
  if (root.nodeType === 1) {
    if (skip(root as Element)) return;
    trAttrs(root as AttrEl);
  }
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode: (n) => {
      if (n.nodeType === 1) return skip(n as Element) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      return /\S/.test(n.nodeValue ?? "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });
  let n: Node | null;
  while ((n = tw.nextNode())) {
    if (n.nodeType === 3) trText(n as Text);
    else trAttrs(n as AttrEl);
  }
}

/** Keep boxes the same size: shrink type (down to 78%) where a translation overflows its box. */
function fit() {
  fitted.forEach((node) => {
    const el = node as FitEl;
    if (!el.isConnected) return;
    if (el.__i18nFs) el.style.fontSize = el.__i18nFs.inline;
    if (lang === "en") {
      delete el.__i18nFs;
      return;
    }
    if (el.clientWidth === 0) return;
    const cs = getComputedStyle(el);
    const nowrap = cs.whiteSpace.includes("nowrap") || cs.textOverflow === "ellipsis";
    const over = () =>
      el.scrollWidth > el.clientWidth + 1 ||
      (!nowrap && el.scrollHeight > el.clientHeight + 2 && cs.overflow !== "visible");
    if (!over()) return;
    const base = parseFloat(cs.fontSize);
    el.__i18nFs = el.__i18nFs || { inline: el.style.fontSize };
    for (let f = 0.94; f >= 0.78 && over(); f -= 0.04) el.style.fontSize = `${(base * f).toFixed(2)}px`;
  });
  fitted.clear();
}

let fitTimer: ReturnType<typeof setTimeout> | undefined;
function schedFit() {
  clearTimeout(fitTimer);
  fitTimer = setTimeout(fit, 60);
}

function apply(root?: Node) {
  busy = true;
  try {
    walk(root || document.body);
  } finally {
    busy = false;
  }
  schedFit();
}

/** Same-origin iframes: another copy of this engine, the presentation's AU_I18N, or Learn's own switcher. */
function pushFrames(force: boolean) {
  document.querySelectorAll("iframe").forEach((fr) => {
    try {
      const w = fr.contentWindow;
      if (!w || !w.document || w.document.readyState === "loading") return;
      if (!force && w.__hntrLang === lang) return;
      w.HNTR_LANG?.set(lang, true);
      if (w.AU_I18N?.set && (!w.AU_I18N.current || w.AU_I18N.current() !== lang)) w.AU_I18N.set(lang);
      w.HNTR_LEARN_SETLANG?.(lang);
      if (w.HNTR_LANG || w.AU_I18N || w.HNTR_LEARN_SETLANG) w.__hntrLang = lang;
    } catch {
      /* cross-origin frame */
    }
  });
}

function setDocLang() {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
  document.documentElement.setAttribute("data-hntr-lang", lang);
}

function translateNow() {
  build();
  apply();
}

export function getLang(): LangCode {
  return lang;
}

export function setLang(c: string, fromOutside = false) {
  lang = isLang(c) ? c : "en";
  if (!fromOutside) {
    try {
      localStorage.setItem(KEY, lang);
    } catch {
      /* storage blocked */
    }
  }
  setDocLang();
  listeners.forEach((fn) => fn(lang));
  const target = lang;
  const run = () => {
    if (target !== lang) return; // a newer choice won the race
    translateNow();
    pushFrames(true);
  };
  if (lang === "en") run();
  else loadPacks().then(run);
}

export function subscribeLang(fn: (c: LangCode) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Idempotent; call once on the client after hydration. */
export function startI18n() {
  if (started || typeof window === "undefined") return;
  started = true;

  try {
    const saved = localStorage.getItem(KEY);
    if (isLang(saved)) lang = saved;
  } catch {
    /* storage blocked */
  }
  setDocLang();

  window.HNTR_LANG = {
    set: setLang,
    get: getLang,
    langs: LANGS,
    refresh: translateNow,
  };

  const mo = new MutationObserver((list) => {
    if (busy || lang === "en") return;
    busy = true;
    try {
      for (const m of list) {
        if (m.type === "characterData") {
          if (!skip(m.target.parentElement)) trText(m.target as Text);
        } else if (m.type === "attributes") {
          if (!skip(m.target as Element)) trAttrs(m.target as AttrEl);
        } else {
          m.addedNodes.forEach((n) => walk(n));
        }
      }
    } finally {
      busy = false;
    }
    schedFit();
  });
  mo.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRS,
  });

  window.addEventListener("storage", (e) => {
    if (e.key === KEY && e.newValue && e.newValue !== lang) setLang(e.newValue, true);
  });

  // Late-loading iframes (Learn, Webinar deck) pick up the current language.
  setInterval(() => pushFrames(false), 1500);

  if (lang !== "en") setLang(lang, true);
}
