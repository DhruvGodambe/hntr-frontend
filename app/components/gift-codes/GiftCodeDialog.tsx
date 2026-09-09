"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Shared modal for every gift-code outcome — success, error, confirm and the
 * one-time "code issued" reveal. Replaces the old toast / window.confirm /
 * inline-text feedback so all gift-code flows surface as real dialogs.
 *
 * Chrome reuses the platform deposit-modal classes (deposit-overlay /
 * deposit-modal / dm-*), portaled to <body>.
 */
export type GiftDialogState =
  | { kind: "success"; title: string; message: string }
  | { kind: "error"; title: string; message: string }
  | {
      kind: "confirm";
      title: string;
      message: string;
      confirmLabel: string;
      danger?: boolean;
      onConfirm: () => void | Promise<void>;
    }
  | { kind: "issued"; title: string; tier: string; code: string; redeemUrl: string };

function iconFor(kind: GiftDialogState["kind"]) {
  switch (kind) {
    case "success":
      return { glyph: "✓", cls: "ok" };
    case "error":
      return { glyph: "!", cls: "err" };
    case "confirm":
      return { glyph: "?", cls: "warn" };
    case "issued":
      return { glyph: "★", cls: "issued" };
  }
}

export default function GiftCodeDialog({
  state,
  busy = false,
  onClose,
}: {
  state: GiftDialogState | null;
  busy?: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const open = Boolean(state);
    document.body.classList.toggle("modal-open", open);
    if (!open) setCopied(false);
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [state]);

  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, busy, onClose]);

  if (!mounted || !state) return null;

  const icon = iconFor(state.kind);

  return createPortal(
    <div
      className="deposit-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div className="deposit-modal" role="dialog" aria-modal="true" aria-label={state.title}>
        <div className="dm-header">
          <div className="dm-title">{state.title}</div>
          <button
            className="dm-close"
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="dm-body">
          <div className="gcm-lead">
            <span className={`gcm-icon ${icon.cls}`} aria-hidden>
              {icon.glyph}
            </span>
            <p className="gcm-msg">
              {state.kind === "issued"
                ? `Your ${state.tier} gift code is ready. Copy it now — the full code is shown only once.`
                : state.message}
            </p>
          </div>

          {state.kind === "issued" && (
            <div className="gcm-code-box">
              <div className="gcm-code-lbl">Gift code</div>
              <div className="gcm-code">{state.code}</div>
            </div>
          )}

          <div className="gcm-actions">
            {state.kind === "confirm" ? (
              <>
                <button
                  className="dm-cancel-btn"
                  type="button"
                  onClick={onClose}
                  disabled={busy}
                >
                  CANCEL
                </button>
                <button
                  className={`dm-proceed-btn${state.danger ? " gcm-danger" : ""}`}
                  type="button"
                  disabled={busy}
                  onClick={() => void state.onConfirm()}
                >
                  {busy ? "WORKING…" : state.confirmLabel.toUpperCase()}
                </button>
              </>
            ) : state.kind === "issued" ? (
              <>
                <button
                  className="dm-cancel-btn"
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(state.redeemUrl);
                    setCopied(true);
                  }}
                >
                  {copied ? "LINK COPIED" : "COPY REDEEM LINK"}
                </button>
                <button className="dm-proceed-btn" type="button" onClick={onClose}>
                  DONE
                </button>
              </>
            ) : (
              <button className="dm-proceed-btn gcm-full" type="button" onClick={onClose}>
                {state.kind === "error" ? "CLOSE" : "DONE"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
