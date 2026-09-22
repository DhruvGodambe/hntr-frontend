"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  PRESENTATION_LANGS,
  PRESENTATION_VOICED_LANGS,
  type PresentationLangCode,
  applyPresentationLang,
  getPresentationDict,
  isPresentationVoicedLang,
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
    window.AU_VOICED = [...PRESENTATION_VOICED_LANGS];
    window.AU_I18N = {
      current: () => langRef.current,
    };
    return () => {
      delete window.AU_I18N;
    };
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
            <span>{name}</span>
            {isPresentationVoicedLang(code) ? (
              <span className="au-lang-voiced" aria-label="narrated" title="Narrated presentation available">
                <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M3 6.6h2.4L9 3.6v10.8L5.4 11.4H3V6.6Z" />
                  <path d="M12 6.4a3.6 3.6 0 0 1 0 5.2" />
                  <path d="M14.2 4.4a6.6 6.6 0 0 1 0 9.2" />
                </svg>
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>,
    host,
  );
}
