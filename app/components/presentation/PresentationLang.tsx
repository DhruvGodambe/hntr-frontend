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
    storePresentationLang(lang);

    let busy = false;
    let pending: number | null = null;
    let unlock: number | null = null;

    const run = () => {
      busy = true;
      applyPresentationLang(getPresentationDict(langRef.current));
      setPresentationBidi(langRef.current === "ar");
      if (pending != null) {
        window.clearTimeout(pending);
        pending = null;
      }
      if (unlock != null) window.clearTimeout(unlock);
      unlock = window.setTimeout(() => {
        busy = false;
        unlock = null;
      }, 200);
    };

    run();
    const later = window.setTimeout(run, 250);

    const mo = new MutationObserver(() => {
      if (busy || langRef.current === "en" || pending) return;
      pending = window.setTimeout(() => {
        pending = null;
        applyPresentationLang(getPresentationDict(langRef.current));
      }, 120);
    });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      mo.disconnect();
      window.clearTimeout(later);
      if (pending != null) window.clearTimeout(pending);
      if (unlock != null) window.clearTimeout(unlock);
    };
  }, [lang, scrollRoot]);

  useEffect(() => {
    const onDoc = () => setOpen(false);
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
            onClick={(e) => {
              e.stopPropagation();
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
