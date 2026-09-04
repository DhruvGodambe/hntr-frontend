"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { WEBINAR_ARTICLES, type WebinarArticleBlock } from "../../../lib/webinar-data";

type WebinarArticleModalProps = {
  open: boolean;
  articleIndex: number;
  onClose: () => void;
  onSelectArticle: (index: number) => void;
};

function setModalBodyLock(locked: boolean) {
  document.body.classList.toggle("modal-open", locked);
}

function ArticleBlock({ block }: { block: WebinarArticleBlock }) {
  if (typeof block === "string") return <p>{block}</p>;
  if ("h" in block) return <div className="art-h2">{block.h}</div>;
  return <div className="art-pull">{block.q}</div>;
}

export default function WebinarArticleModal({
  open,
  articleIndex,
  onClose,
  onSelectArticle,
}: WebinarArticleModalProps) {
  const [mounted, setMounted] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const article = WEBINAR_ARTICLES[articleIndex] ?? WEBINAR_ARTICLES[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setModalBodyLock(open);
    return () => setModalBodyLock(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open && mainRef.current) mainRef.current.scrollTop = 0;
  }, [open, articleIndex]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`art-ov${open ? " on" : ""}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-hidden={!open}
    >
      <div className="art-modal" role="dialog" aria-modal="true" aria-label={article.title}>
        <div className="art-main" ref={mainRef}>
          <div className="art-hero">
            <button type="button" className="art-close" onClick={onClose} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <img src={article.img} alt="" />
            <div className="art-hero-txt">
              <div className="art-kicker">{article.issue}</div>
              <div className="art-h1">{article.title}</div>
            </div>
          </div>
          <div className="art-body">
            <div className="art-byline">
              <span className="art-avatar" />
              <div>
                <div className="art-author">Alex Chen, CFA</div>
                <div className="art-when">{article.when}</div>
              </div>
            </div>
            <div className="art-lead">{article.subtitle}</div>
            {article.body.map((block, i) => (
              <ArticleBlock block={block} key={i} />
            ))}
          </div>
        </div>
        <div className="art-side">
          <div className="art-side-ttl">MORE FROM HNTR NEWSLETTER</div>
          {WEBINAR_ARTICLES.map((item, i) => (
            <div
              key={item.title}
              className={`art-item${i === articleIndex ? " cur" : ""}`}
              onClick={() => onSelectArticle(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectArticle(i);
                }
              }}
            >
              <img className="art-thumb" src={item.img} alt="" />
              <div>
                <div className="art-item-ttl">{item.title}</div>
                <div className="art-item-meta">{item.issue}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
