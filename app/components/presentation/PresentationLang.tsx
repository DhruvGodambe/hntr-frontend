"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  PRESENTATION_LANGS,
  type PresentationLangCode,
  applyPresentationLang,
  getPresentationDict,
  presentationLangLabel,
  readStoredPresentationLang,
  setPresentationBidi,
  storePresentationLang,
} from "./presentationI18n";

export default function PresentationLang({ scrollRoot }: { scrollRoot: HTMLElement | null }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<PresentationLangCode>("en");
  const wrapRef = useRef<HTMLDivElement>(null);
  const langRef = useRef(lang);
  langRef.current = lang;

  useEffect(() => {
    setHost(document.getElementById("au-lang"));
    setLang(readStoredPresentationLang());
  }, [scrollRoot]);

  useEffect(() => {
    if (!scrollRoot) return;
    const dict = getPresentationDict(lang);
    applyPresentationLang(scrollRoot, dict);
    setPresentationBidi(lang === "ar");
    storePresentationLang(lang);

    let pending: number | null = null;
    const mo = new MutationObserver(() => {
      if (pending != null) return;
      pending = window.setTimeout(() => {
        pending = null;
        applyPresentationLang(scrollRoot, getPresentationDict(langRef.current));
      }, 80);
    });
    mo.observe(scrollRoot, { childList: true, subtree: true, characterData: true });
    return () => {
      mo.disconnect();
      if (pending != null) window.clearTimeout(pending);
    };
  }, [lang, scrollRoot]);

  useEffect(() => {
    const onDoc = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  if (!host) return null;

  return createPortal(
    <div className={`au-lang${open ? " open" : ""}`} data-no-i18n ref={wrapRef}>
      <button
        type="button"
        className="au-lang-btn"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#1d1d1f" strokeWidth="1.3">
          <circle cx="8" cy="8" r="6.4" />
          <path d="M1.6 8h12.8M8 1.6c3.2 3.6 3.2 9.2 0 12.8M8 1.6c-3.2 3.6-3.2 9.2 0 12.8" />
        </svg>
        <span>{presentationLangLabel(lang)}</span>
      </button>
      <div className="au-lang-menu" role="listbox">
        {PRESENTATION_LANGS.map(([code, name]) => (
          <button
            key={code}
            type="button"
            className="au-lang-opt"
            aria-current={code === lang}
            onClick={() => {
              setLang(code);
              setOpen(false);
            }}
          >
            {name}
          </button>
        ))}
      </div>
    </div>,
    host,
  );
}
