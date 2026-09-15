"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Country } from "react-phone-number-input";
import { SIGNUP_COUNTRIES, getCountryOption } from "../../lib/signup-countries";
import CountryFlag from "./CountryFlag";

type CountrySelectProps = {
  value: Country | "";
  onChange: (code: Country) => void;
  disabled?: boolean;
  hasError?: boolean;
  placeholder?: string;
};

export default function CountrySelect({
  value,
  onChange,
  disabled = false,
  hasError = false,
  placeholder = "Select Country",
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  const selected = value ? getCountryOption(value) : undefined;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SIGNUP_COUNTRIES;
    return SIGNUP_COUNTRIES.filter(
      (option) =>
        option.label.toLowerCase().includes(q) ||
        option.dialCode.includes(q) ||
        option.code.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={`cs-wrap${open ? " cs-open" : ""}`} ref={wrapRef}>
      <button
        type="button"
        className={`cs-trigger${hasError ? " is-error" : ""}`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {selected ? (
          <span className="cs-trigger-val">
            <CountryFlag code={selected.code} />
            <span>{selected.label}</span>
          </span>
        ) : (
          <span className="cs-placeholder">{placeholder}</span>
        )}
        <svg className="cs-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="cs-panel">
          <input
            className="cs-search"
            type="text"
            placeholder="Search country or code..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            aria-label="Search country"
          />
          <div className="cs-list" role="listbox">
            {filtered.map((option) => (
              <button
                key={option.code}
                type="button"
                role="option"
                aria-selected={option.code === value}
                className={`cs-option${option.code === value ? " is-selected" : ""}`}
                onClick={() => {
                  onChange(option.code);
                  setOpen(false);
                }}
              >
                <CountryFlag code={option.code} />
                <span>{option.label}</span>
                <span className="cs-dial">+{option.dialCode}</span>
              </button>
            ))}
            {filtered.length === 0 && <div className="cs-empty">No countries found</div>}
          </div>
        </div>
      )}
    </div>
  );
}
