import Link from "next/link";

// Community links are placeholders in the V2 design — set these when the channels exist.
export const TELEGRAM_URL = process.env.NEXT_PUBLIC_TELEGRAM_URL || "#";
export const DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_URL || "#";

/** V2 page footer — rendered as the last child of each page's `.feed`. */
export default function HntrFooter() {
  const external = (url: string) => (url === "#" ? {} : { target: "_blank", rel: "noopener noreferrer" });
  return (
    <footer className="hf">
      <Link className="hf-brand" href="/home">
        <img src="/assets/v2/hntr-dark/8b857621.png" alt="" />
        <span>HNTR</span>
      </Link>
      <div className="hf-soc">
        <a href={TELEGRAM_URL} aria-label="Telegram" {...external(TELEGRAM_URL)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.4 4.2 2.9 11.3c-1.3.5-1.3 1.2-.2 1.6l4.7 1.5 1.8 5.6c.2.6.1.9.8.9.5 0 .7-.2 1-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.8c.3-1.3-.5-1.9-1.5-1.4zM8.7 14.1l9.9-6.2c.5-.3.9-.1.5.2l-8.4 7.6-.3 3.5-1.7-5.1z" />
          </svg>
        </a>
        <a href={DISCORD_URL} aria-label="Discord" {...external(DISCORD_URL)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd">
            <path d="M19.3 5.3A16.6 16.6 0 0 0 15.2 4l-.5 1a15.4 15.4 0 0 0-5.4 0l-.5-1a16.6 16.6 0 0 0-4.1 1.3C2.1 9.2 1.4 13 1.7 16.7a16.7 16.7 0 0 0 5 2.5l1.1-1.7a10.8 10.8 0 0 1-1.7-.8l.4-.3a11.9 11.9 0 0 0 11 0l.4.3c-.5.3-1.1.6-1.7.8l1.1 1.7a16.7 16.7 0 0 0 5-2.5c.4-4.3-.7-8-2.9-11.4zM8.7 14.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z" />
          </svg>
        </a>
      </div>
      <Link className="hf-doc" href="/learn">
        HNTR Docs
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M3.5 8.5l5-5M4.5 3.5h4v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
      <div className="hf-copy">
        © {new Date().getFullYear()} HNTR.art All rights reserved
        <span className="hf-sep">·</span>
        <Link className="hf-tc" href="/terms">
          Terms & Conditions
        </Link>
      </div>
    </footer>
  );
}
