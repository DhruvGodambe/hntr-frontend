import langKeys from "../../../public/assets/about/lang-keys.json";
import langAr from "../../../public/assets/about/lang-ar.json";
import langDe from "../../../public/assets/about/lang-de.json";
import langEs from "../../../public/assets/about/lang-es.json";
import langHi from "../../../public/assets/about/lang-hi.json";
import langIt from "../../../public/assets/about/lang-it.json";
import langJa from "../../../public/assets/about/lang-ja.json";
import langKo from "../../../public/assets/about/lang-ko.json";
import langPt from "../../../public/assets/about/lang-pt.json";
import langRu from "../../../public/assets/about/lang-ru.json";
import langTr from "../../../public/assets/about/lang-tr.json";
import langVi from "../../../public/assets/about/lang-vi.json";
import langZh from "../../../public/assets/about/lang-zh.json";

export const PRESENTATION_LANGS = [
  ["en", "English"],
  ["es", "Español"],
  ["pt", "Português"],
  ["it", "Italiano"],
  ["ru", "Русский"],
  ["tr", "Türkçe"],
  ["hi", "हिन्दी"],
  ["ar", "العربية"],
  ["de", "Deutsch"],
  ["vi", "Tiếng Việt"],
  ["zh", "中文"],
  ["ko", "한국어"],
  ["ja", "日本語"],
] as const;

export type PresentationLangCode = (typeof PRESENTATION_LANGS)[number][0];

export const PRESENTATION_LANG_KEY = "hntr-about-lang";
export const PRESENTATION_VOICED_LANGS = ["en", "it", "es", "ru", "pt"] as const;

export function isPresentationVoicedLang(
  code: string,
): code is (typeof PRESENTATION_VOICED_LANGS)[number] {
  return (PRESENTATION_VOICED_LANGS as readonly string[]).includes(code);
}

declare global {
  interface Window {
    AU_I18N?: { current: () => string };
    AU_VOICED?: string[];
  }
}

const KEYS = asStringArray(langKeys);
const revAll: Record<string, string> = {};

function asStringArray(rows: unknown): string[] {
  if (Array.isArray(rows)) return rows.map((row) => String(row));
  if (rows && typeof rows === "object" && Array.isArray((rows as { default?: unknown }).default)) {
    return (rows as { default: unknown[] }).default.map((row) => String(row));
  }
  return [];
}

function toDict(rows: unknown): Record<string, string> {
  const dict: Record<string, string> = {};
  const list = asStringArray(rows);
  KEYS.forEach((key, i) => {
    if (list[i]) dict[key] = list[i];
  });
  Object.keys(dict).forEach((key) => {
    if (!revAll[dict[key]]) revAll[dict[key]] = key;
  });
  return dict;
}

const DICTS: Record<Exclude<PresentationLangCode, "en">, Record<string, string>> = {
  es: toDict(langEs),
  pt: toDict(langPt),
  it: toDict(langIt),
  ru: toDict(langRu),
  tr: toDict(langTr),
  hi: toDict(langHi),
  ar: toDict(langAr),
  de: toDict(langDe),
  vi: toDict(langVi),
  zh: toDict(langZh),
  ko: toDict(langKo),
  ja: toDict(langJa),
};

function toEnglish(value: string) {
  return revAll[value] || value;
}

export function presentationLangLabel(code: string) {
  return PRESENTATION_LANGS.find(([c]) => c === code)?.[1] ?? "English";
}

export function readStoredPresentationLang(): PresentationLangCode {
  try {
    const stored = localStorage.getItem(PRESENTATION_LANG_KEY);
    if (stored && PRESENTATION_LANGS.some(([c]) => c === stored)) {
      return stored as PresentationLangCode;
    }
  } catch {
    /* ignore */
  }
  return "en";
}

export function storePresentationLang(code: PresentationLangCode) {
  try {
    localStorage.setItem(PRESENTATION_LANG_KEY, code);
  } catch {
    /* ignore */
  }
}

function textNodes(root: ParentNode) {
  const out: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const p = n.parentElement;
      if (!p || p.closest("[data-no-i18n]")) return NodeFilter.FILTER_REJECT;
      if (p.closest("[data-count],#au-count")) return NodeFilter.FILTER_REJECT;
      if (p.tagName === "SCRIPT" || p.tagName === "STYLE") return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let node: Node | null;
  while ((node = walker.nextNode())) out.push(node as Text);
  return out;
}

export function getPresentationDict(lang: PresentationLangCode): Record<string, string> | null {
  if (lang === "en") return null;
  return DICTS[lang] ?? null;
}

export function applyPresentationLang(dict: Record<string, string> | null, root: ParentNode = document.body) {
  textNodes(root).forEach((n) => {
    const raw = n.nodeValue ?? "";
    const shown = raw.trim();
    const en = toEnglish(shown);
    const next = dict ? dict[en] || en : en;
    if (next !== shown) n.nodeValue = raw.replace(shown, next);
  });
}

export function setPresentationBidi(on: boolean) {
  let el = document.getElementById("au-bidi");
  if (!on) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("style");
    el.id = "au-bidi";
    el.textContent =
      "#au-scroll h1,#au-scroll h2,#au-scroll h3,#au-scroll h4,#au-scroll p,#au-scroll span,#au-scroll li,#au-scroll div{unicode-bidi:plaintext}";
    document.head.appendChild(el);
  }
}
