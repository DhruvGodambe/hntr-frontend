export default function WebinarPlayer() {
  return (
    <div className="wv-player">
      <img
        className="wv-slide"
        src="/assets/images/webinarSlide.png"
        alt="Live presentation slide"
      />
      <div className="wv-presenter">
        <div className="wv-pcircle">
          <img src="/assets/images/presenter.png" alt="Alex Chen, CFA" />
        </div>
        <div className="wv-pname">Alex Chen, CFA</div>
        <div className="wv-prole">Host · Markets Desk</div>
      </div>
      <div className="wv-soon">
        <div className="wv-soon-brand">
          LIVE WEBINAR <span>| COMING SOON</span>
        </div>
        <div className="wv-soon-rule" />
        <div className="wv-soon-sub">24/7 Live Webinars in All Languages</div>
        <button type="button" className="wv-soon-cta">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="1.6" y="2.6" width="12.8" height="9" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 11.6v2M5.4 13.6h5.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          View Presentation Deck
        </button>
      </div>
      <div className="wv-controls">
        <span className="wv-livemark">
          <span className="wv-live-dot" />
          LIVE
        </span>
        <div style={{ flex: 1 }} />
        <button type="button" className="wv-cbtn" aria-label="Volume">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2.5 6v4h2.5l3.5 2.5v-9L5 6H2.5z" fill="currentColor" />
            <path
              d="M10.5 5.5a3.5 3.5 0 0 1 0 5M12.5 3.5a6 6 0 0 1 0 9"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button type="button" className="wv-cbtn" aria-label="Fullscreen">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 5.5V2.5h3M14 5.5V2.5h-3M2 10.5v3h3M14 10.5v3h-3"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
