"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { LANGS, getLang, setLang, subscribeLang, type LangCode } from "../../../../lib/i18n";

/** V2 top-bar language picker (`.nav-lang`). On mobile it sits in the drawer header next to the theme toggle. */
export default function LanguageSwitcher() {
  const [lang, setLangState] = useState<LangCode>("en");
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLangState(getLang());
    return subscribeLang(setLangState);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) {
      setAlignRight(false);
      return;
    }
    const r = menuRef.current?.getBoundingClientRect();
    if (r && r.right > window.innerWidth - 8) setAlignRight(true);
  }, [open]);

  const current = LANGS.find((l) => l.c === lang) ?? LANGS[0];

  const pick = (c: LangCode) => {
    setOpen(false);
    setLang(c);
  };

  return (
    <div
      ref={rootRef}
      className="nav-lang"
      data-no-i18n=""
      role="button"
      tabIndex={0}
      aria-label="Language"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={(e) => {
        e.stopPropagation();
        if (menuRef.current?.contains(e.target as Node)) return;
        setOpen((o) => !o);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
        else if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
          e.preventDefault();
          setOpen((o) => !o);
        }
      }}
    >
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M1.8 8h12.4M8 1.8c1.8 1.9 2.6 4 2.6 6.2S9.8 12.3 8 14.2C6.2 12.3 5.4 10.2 5.4 8S6.2 3.7 8 1.8Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
      <span className="nav-lang-code">{current.s}</span>
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ opacity: 0.6 }}>
        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {open && (
        <div ref={menuRef} className={`nav-lang-menu${alignRight ? " right" : ""}`} role="menu">
          {LANGS.map((l) => (
            <button
              key={l.c}
              type="button"
              role="menuitemradio"
              aria-checked={l.c === lang}
              className={`nav-lang-opt${l.c === lang ? " on" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                pick(l.c);
              }}
            >
              <span>
                <b>{l.s}</b>
                {l.n}
              </span>
              <i />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
