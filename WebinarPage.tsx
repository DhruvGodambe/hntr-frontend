/**
 * HNTR — Live Webinar page (standalone).
 *
 * Single-file React + TypeScript component. No external CSS, no UI deps.
 * Assets expected next to the app (override via props):
 *   webinar-slide.png, webinar-presenter.png, signup-vr.png
 *
 *   import WebinarPage from "./WebinarPage";
 *   <WebinarPage walletConnected onOpenDeck={...} onOpenArticle={...} />
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────── types ────────────────────────────── */

export interface Lang {
  code: string;
  flag: string;
  name: string;
  native: string;
}

export interface Article {
  meta: string;
  title: string;
  sub: string;
}

export interface ChatMessage {
  id: number;
  user: string;
  time: string;
  text: string;
  kind?: "system" | "me";
}

export interface WebinarPageProps {
  slideSrc?: string;
  presenterSrc?: string;
  signupSrc?: string;
  walletConnected?: boolean;
  currentUser?: string;
  languages?: Lang[];
  defaultLang?: string;
  articles?: Article[];
  onOpenDeck?: () => void;
  onLearnMore?: () => void;
  onOpenArticle?: (index: number) => void;
  onSignup?: () => void;
  onLangChange?: (lang: Lang) => void;
  onSend?: (text: string) => void;
}

/* ────────────────────────────── data ────────────────────────────── */

const LANGS: Lang[] = [
  { code: "en", flag: "🇬🇧", name: "English", native: "English" },
  { code: "es", flag: "🇪🇸", name: "Spanish", native: "Español" },
  { code: "zh", flag: "🇨🇳", name: "Chinese", native: "中文" },
  { code: "hi", flag: "🇮🇳", name: "Hindi", native: "हिन्दी" },
  { code: "ar", flag: "🇸🇦", name: "Arabic", native: "العربية" },
  { code: "pt", flag: "🇵🇹", name: "Portuguese", native: "Português" },
  { code: "fr", flag: "🇫🇷", name: "French", native: "Français" },
  { code: "de", flag: "🇩🇪", name: "German", native: "Deutsch" },
  { code: "ru", flag: "🇷🇺", name: "Russian", native: "Русский" },
  { code: "ja", flag: "🇯🇵", name: "Japanese", native: "日本語" },
  { code: "ko", flag: "🇰🇷", name: "Korean", native: "한국어" },
  { code: "tr", flag: "🇹🇷", name: "Turkish", native: "Türkçe" },
];

const ARTICLES: Article[] = [
  {
    meta: "ISSUE #47 · 6 MIN READ",
    title: "The 80/20 Rule: Where Your Commissions Really Come From",
    sub: "A breakdown of instant payouts and how the 20% redirect quietly fuels your next position.",
  },
  {
    meta: "ISSUE #46 · 4 MIN READ",
    title: "Inside HNTR Pools: How Co-Ownership Compounds",
    sub: "Why fractionalized NFT vaults tend to outperform solo buys across a full market cycle.",
  },
  {
    meta: "ISSUE #45 · 5 MIN READ",
    title: "Referral Mechanics Explained for New Hunters",
    sub: "From first invite to Elite Platinum — the numbers behind the HNTR network effect.",
  },
];

const REACTIONS = ["🔥", "🚀", "👏", "💡", "📈"];

/* ────────────────────────────── styles ────────────────────────────── */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

.hntr-web{
  --sage-faint:#dce3da;
  --olive:#5E6B55;--olive-dark:#4a5443;
  --cream:#F2EFEA;--cream-deeper:#dbd6cf;
  --e0:#edeae4;--e1:#F2EFEA;--e2:#ffffff;--e3:#f4f2ee;--e4:#ece8e2;
  --bd0:rgba(0,0,0,.04);--bd1:rgba(0,0,0,.07);--bd2:rgba(0,0,0,.11);
  --t0:rgba(58,67,49,.28);--t1:rgba(58,67,49,.46);--t2:rgba(58,67,49,.64);--t3:rgba(58,67,49,.82);--t4:#2b3224;
  --green:#3d7a5a;
  --sh1:0 1px 3px rgba(60,70,50,.07),0 1px 2px rgba(60,70,50,.05);
  --sh2:0 4px 14px rgba(60,70,50,.09),0 2px 5px rgba(60,70,50,.05);
  --sh3:0 10px 28px rgba(60,70,50,.12),0 3px 8px rgba(60,70,50,.06);
  --sh4:0 18px 44px rgba(60,70,50,.16),0 5px 12px rgba(60,70,50,.08);
  --glow:inset 0 1px 0 rgba(255,255,255,.75);
  --fn:'Inter',sans-serif;--fd:'Space Grotesk',sans-serif;--fm:'Space Mono',monospace;--r:8px;
  position:relative;height:100%;min-height:0;display:flex;gap:12px;padding:0 0 12px;overflow:hidden;
  background:var(--e0);color:var(--t3);font-family:var(--fn);font-size:12px;line-height:1.5;
}
.hntr-web *,.hntr-web *::before,.hntr-web *::after{box-sizing:border-box;margin:0;padding:0}
.hntr-web ::-webkit-scrollbar{width:3px;height:3px}
.hntr-web ::-webkit-scrollbar-thumb{background:#e8e4de;border-radius:2px}

@keyframes hntrLivePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.65)}}

.web-scroll{flex:1;overflow-y:auto;padding:16px 0 24px;display:flex;justify-content:center;scrollbar-width:thin}
.web-main{width:100%}

/* header above the screen */
.wv-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:12px}
.wv-head-left{display:flex;flex-direction:column;align-items:flex-start;gap:10px;min-width:0}
.wv-headbrand{font-family:var(--fd);font-weight:700;font-size:20px;letter-spacing:.04em;color:var(--t4)}
.wv-headbrand span{color:#ef6a26;font-weight:600;margin-left:6px}
.wv-head-l{display:flex;align-items:center;gap:10px}
.wv-live{display:inline-flex;align-items:center;gap:5px;height:20px;padding:0 8px;background:#ef4033;border-radius:4px;font-family:var(--fm);font-size:9px;font-weight:700;letter-spacing:.1em;color:#fff}
.wv-live-dot{width:5px;height:5px;border-radius:50%;background:#fff;animation:hntrLivePulse 1.2s ease-in-out infinite}
.wv-timer{display:inline-flex;align-items:center;gap:5px;font-family:var(--fm);font-size:10px;color:var(--t2)}
.wv-timer svg{color:var(--t1)}

/* language selector */
.wv-lang{position:relative;flex-shrink:0;font-family:var(--fm);display:flex;flex-direction:column;align-items:flex-end;gap:5px}
.wv-lang-label{font-size:8.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--t1)}
.wv-lang-btn{display:inline-flex;align-items:center;gap:8px;height:32px;padding:0 12px;background:var(--e2);border:.5px solid var(--bd1);border-radius:8px;font-family:var(--fm);font-size:10px;font-weight:500;color:var(--t3);cursor:pointer;box-shadow:var(--sh1);transition:border-color .15s,color .15s;white-space:nowrap}
.wv-lang-btn:hover{border-color:var(--bd2);color:var(--t4)}
.wv-lang-btn b{color:var(--t4);font-weight:700}
.wv-lang-flag{font-size:15px;line-height:1}
.wv-lang-chev{color:var(--t2);transition:transform .2s}
.wv-lang.open .wv-lang-chev{transform:rotate(180deg)}
.wv-lang-menu{position:absolute;top:calc(100% + 6px);right:0;width:216px;max-height:244px;overflow-y:auto;background:var(--e2);border:.5px solid var(--bd1);border-radius:10px;box-shadow:var(--sh4);padding:5px;z-index:60;opacity:0;transform:translateY(-6px);pointer-events:none;transition:opacity .18s ease,transform .18s cubic-bezier(.22,1,.36,1);scrollbar-width:thin}
.wv-lang.open .wv-lang-menu{opacity:1;transform:translateY(0);pointer-events:auto}
.wv-lang-opt{display:flex;align-items:center;gap:9px;padding:8px 9px;border-radius:6px;font-size:11px;color:var(--t3);cursor:pointer;transition:background .12s,color .12s}
.wv-lang-opt:hover{background:var(--e4);color:var(--t4)}
.wv-lang-opt.sel{color:var(--t4);font-weight:600}
.wv-lang-opt .wv-lang-flag{font-size:16px}
.wv-lang-native{margin-left:auto;color:var(--t1);font-size:9.5px}
.wv-lang-opt.sel .wv-lang-native{color:#ef6a26}
.wv-lang-check{color:#ef6a26;margin-left:4px;flex-shrink:0}

/* video screen */
.wv-player{position:relative;width:100%;aspect-ratio:1474/816;border-radius:10px;overflow:hidden;background:#0b0e10;box-shadow:var(--sh3);color:#e9edf0;font-family:var(--fn)}
.wv-slide{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.wv-player::after{content:'';position:absolute;left:0;right:0;bottom:0;height:42%;background:linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,.72) 100%);pointer-events:none;z-index:1}
.wv-soon{position:absolute;inset:0;z-index:6;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:0 24px;backdrop-filter:blur(22px) saturate(.75);-webkit-backdrop-filter:blur(22px) saturate(.75);background:radial-gradient(120% 90% at 50% 40%,rgba(10,14,20,.42) 0%,rgba(6,9,13,.78) 100%)}
.wv-soon-brand{font-family:var(--fn);font-size:clamp(20px,2.4vw,34px);font-weight:600;letter-spacing:.06em;color:#fff}
.wv-soon-brand span{color:#ef6a26}
.wv-soon-rule{width:52px;height:1px;background:rgba(255,255,255,.22)}
.wv-soon-sub{font-family:var(--fm);font-size:clamp(10px,1vw,12.5px);letter-spacing:.24em;text-transform:uppercase;color:rgba(233,237,240,.62)}
.wv-soon-cta{margin-top:6px;display:inline-flex;align-items:center;gap:9px;height:46px;padding:0 24px;border:none;border-radius:8px;background:#f4f4f5;color:#0a0a0b;font-family:var(--fm);font-size:11px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;cursor:pointer;box-shadow:0 14px 40px rgba(0,0,0,.45);transition:transform .28s cubic-bezier(.22,1,.36,1),background .28s,box-shadow .28s}
.wv-soon-cta:hover{transform:translateY(-2px);background:#fff;box-shadow:0 20px 52px rgba(0,0,0,.55)}
.wv-presenter{position:absolute;bottom:52px;right:16px;width:120px;text-align:center;z-index:6}
.wv-pcircle{width:120px;height:92px;border-radius:10px;margin:0 auto 6px;background-color:#2a3540;background-position:center top;background-size:cover;border:2px solid rgba(255,255,255,.9);box-shadow:0 6px 20px rgba(0,0,0,.55)}
.wv-pname{font-family:var(--fd);font-weight:700;font-size:10px;text-shadow:0 1px 4px rgba(0,0,0,.9)}
.wv-prole{font-family:var(--fm);font-size:7.5px;color:rgba(233,237,240,.82);margin-top:1px;text-shadow:0 1px 4px rgba(0,0,0,.9)}
.wv-controls{position:absolute;left:14px;right:14px;bottom:12px;display:flex;align-items:center;gap:11px;z-index:5}
.wv-cbtn{background:none;border:none;color:rgba(233,237,240,.85);cursor:pointer;display:flex;flex-shrink:0;padding:0}
.wv-cbtn:hover{color:#fff}

/* action bar */
.web-actbar{display:flex;align-items:center;flex-wrap:wrap;margin-top:14px;background:var(--e2);border-radius:var(--r);box-shadow:var(--sh1),var(--glow);padding:0 6px}
.web-act{display:flex;align-items:center;gap:7px;padding:13px 11px;font-size:10.5px;color:var(--t3);cursor:pointer;font-weight:500;white-space:nowrap}
.web-act:hover{color:var(--t4)}
.web-act svg{color:var(--t2)}
.web-deck{margin-left:auto;display:flex;align-items:center;gap:7px;height:34px;padding:0 13px;background:var(--olive);color:var(--cream);border:none;border-radius:6px;font-family:var(--fm);font-size:8.5px;font-weight:700;letter-spacing:.06em;cursor:pointer;transition:.15s;white-space:nowrap}
.web-deck:hover{background:var(--olive-dark)}

/* meta */
.web-brandline{font-family:var(--fd);font-weight:700;font-size:20px;letter-spacing:.04em;color:var(--t4);margin:26px 0 14px}
.web-brandline span{color:#ef6a26;font-weight:600;margin-left:6px}
.web-meta{display:flex;align-items:center;gap:9px;margin:0 0 12px}
.web-tag{font-family:var(--fm);font-size:8.5px;font-weight:700;letter-spacing:.09em;color:var(--t4);background:var(--cream-deeper);padding:4px 8px;border-radius:4px}
.web-meta-dot{color:var(--t0)}
.web-meta-txt{font-size:11px;color:var(--t1)}
.web-desc{font-size:13.5px;line-height:1.7;color:var(--t2);max-width:600px}
.web-hr{height:.5px;background:var(--bd1);margin:28px 0 20px}

/* newsletter */
.web-up-hdr{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px}
.web-up-title{font-family:var(--fm);font-size:10px;font-weight:700;letter-spacing:.14em;color:var(--t2)}
.web-up-link{font-size:11px;color:var(--olive);text-decoration:underline;cursor:pointer;font-weight:600}
.web-up-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.web-card{background:var(--e2);border-radius:var(--r);box-shadow:var(--sh1),var(--glow);padding:14px;display:flex;flex-direction:column;cursor:pointer;text-align:left;border:none;font-family:inherit}
.web-card-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px}
.web-card-date{font-family:var(--fm);font-size:8px;font-weight:700;letter-spacing:.05em;color:var(--t2);background:var(--e3);padding:4px 6px;border-radius:4px}
.web-card-cal{color:var(--t1)}
.web-card:hover .web-card-cal{color:var(--olive)}
.web-card-ttl{font-family:var(--fd);font-weight:700;font-size:13px;line-height:1.25;color:var(--t4);margin-bottom:6px}
.web-card-sub{font-size:10.5px;line-height:1.5;color:var(--t1);flex:1;margin-bottom:12px}
.web-card-add{font-size:10px;color:var(--t3);padding-top:10px;border-top:.5px solid var(--bd0);font-weight:600;display:flex;align-items:center;gap:6px}
.web-card:hover .web-card-add{color:var(--olive)}

.web-foot{display:flex;justify-content:space-between;align-items:center;margin-top:26px;padding-top:16px;border-top:.5px solid var(--bd0);font-size:9.5px;color:var(--t0);font-family:var(--fm);letter-spacing:.04em}
.web-foot-links{display:flex;gap:20px}
.web-foot-links span{cursor:pointer}
.web-foot-links span:hover{color:var(--t2)}

/* chat column */
.web-chat{position:relative;width:256px;flex-shrink:0;display:flex;flex-direction:column;gap:12px;min-height:0}
.web-wallet{background:var(--e1);border-radius:10px;box-shadow:var(--sh2);padding:14px 16px}
.web-wallet .r-div:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.r-div{border-bottom:.5px solid var(--bd0);margin-bottom:13px;padding-bottom:13px}
.rp{display:flex;align-items:center;gap:9px}
.rav{width:34px;height:34px;border-radius:7px;background:var(--sage-faint);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:var(--sh1)}
.rn{font-family:var(--fd);font-size:12px;font-weight:700;color:var(--t4)}
.rt{font-size:8px;color:var(--t0);text-transform:uppercase;letter-spacing:.06em;margin-top:1px}
.privacy-eye{margin-left:auto;flex-shrink:0;width:26px;height:26px;display:flex;align-items:center;justify-content:center;border:none;background:transparent;color:var(--t1);cursor:pointer;border-radius:6px}
.privacy-eye:hover{background:var(--e3);color:var(--t4)}
.privacy-eye.off{color:var(--olive)}
.rpb-wrap{margin-top:12px}
.rph{display:flex;justify-content:space-between;margin-bottom:5px}
.rpl{font-size:8px;color:var(--t0);text-transform:uppercase;letter-spacing:.06em}
.rpp{font-family:var(--fm);font-size:9px;color:var(--t4)}
.rpb{height:3px;background:var(--sage-faint);border-radius:2px;overflow:hidden;margin-bottom:3px}
.rpf{height:100%;background:var(--olive);border-radius:2px}
.rpls{display:flex;justify-content:space-between;font-size:8px;color:var(--t0);font-family:var(--fm)}
.rs2{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.rsb{background:var(--e3);border-radius:6px;padding:9px;box-shadow:var(--sh1)}
.rsbl{font-size:8px;text-transform:uppercase;letter-spacing:.05em;color:var(--t0);margin-bottom:3px}
.rsbv{font-family:var(--fm);font-size:13px;font-weight:700;color:var(--t4)}
.rsbc{font-size:8px;color:var(--green);margin-top:2px;font-family:var(--fm)}
.rsbg{font-size:8px;color:var(--t0);margin-top:2px;font-family:var(--fm)}
.info-i{display:inline-flex;align-items:center;justify-content:center;width:11px;height:11px;border-radius:50%;border:1px solid var(--t1);color:var(--t1);font-family:var(--fm);font-size:7px;cursor:default;position:relative}
.signup-card{position:relative;width:100%;border-radius:var(--r);overflow:hidden;background:#06060a;box-shadow:var(--sh2);cursor:pointer;transition:transform .25s ease,box-shadow .25s ease}
.signup-card img{display:block;width:100%;height:auto}
.signup-card:hover{transform:translateY(-3px) scale(1.012);box-shadow:0 0 0 1px rgba(255,255,255,.18),0 10px 30px rgba(0,0,0,.4)}
.signup-card-fill{position:absolute;left:24.2%;top:80.9%;width:49.1%;height:10.6%;border-radius:4px;display:flex;align-items:center;justify-content:center;white-space:nowrap;overflow:hidden;font-family:var(--fm);font-size:10px;font-weight:700;letter-spacing:.2em;color:#fff;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.7);z-index:2;transition:background .18s,color .18s,transform .18s}
.signup-card:hover .signup-card-fill{background:#fff;color:#0a0a0b;transform:scale(1.025);box-shadow:0 0 18px rgba(255,255,255,.4)}

.web-listen-card{background:var(--e1);border-radius:10px;box-shadow:var(--sh2);display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden}
.web-chat-hdr{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:.5px solid var(--bd0)}
.web-chat-hl{display:flex;align-items:center;gap:9px;font-family:var(--fm);font-size:10px;font-weight:700;letter-spacing:.12em;color:#ef6a26}
.web-chat-live{width:7px;height:7px;border-radius:50%;background:#ef6a26;box-shadow:0 0 7px #ef6a26;animation:hntrLivePulse 1.4s ease-in-out infinite}
.web-msgs{flex:1;overflow-y:auto;padding:16px 18px;scrollbar-width:thin;display:flex;flex-direction:column;gap:16px}
.web-msg-head{display:flex;align-items:baseline;gap:7px;margin-bottom:7px}
.web-msg-user{font-family:var(--fm);font-size:11px;font-weight:700;color:#ef6a26}
.web-msg-time{font-family:var(--fm);font-size:9px;color:var(--t0)}
.web-bubble{background:var(--e2);border:.5px solid var(--bd0);border-radius:9px;padding:11px 13px;font-size:12px;line-height:1.5;color:var(--t3);box-shadow:var(--sh1)}
.web-msg.me .web-bubble{background:rgba(239,106,38,.13);border-color:rgba(239,106,38,.24)}
.web-msg.system .web-msg-user{color:var(--olive);letter-spacing:.1em}
.web-msg.system .web-bubble{background:rgba(224,110,40,.10);border:1px solid rgba(224,110,40,.28)}
.web-chat-foot{border-top:.5px solid var(--bd0);padding:12px 16px 14px;background:var(--e1)}
.web-react{display:flex;justify-content:space-between;margin-bottom:12px;padding:0 4px}
.web-react button{background:none;border:none;font-size:17px;cursor:pointer;line-height:1;transition:transform .12s}
.web-react button:hover{transform:scale(1.28) translateY(-2px)}
.web-input-row{display:flex;align-items:center;gap:8px;background:var(--e2);border:.5px solid var(--bd1);border-radius:8px;padding:0 6px 0 12px;box-shadow:var(--sh1)}
.web-input-row input{flex:1;border:none;background:none;outline:none;height:38px;font-family:var(--fn);font-size:12px;color:var(--t4)}
.web-input-row input::placeholder{color:var(--t0)}
.web-send{width:30px;height:30px;border-radius:6px;background:var(--olive);border:none;color:var(--cream);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:.15s}
.web-send:hover{background:var(--olive-dark)}
.web-float{position:absolute;right:24px;bottom:96px;font-size:22px;pointer-events:none;z-index:50;transition:transform 1.1s ease,opacity 1.1s ease}
.web-float.go{transform:translateY(-120px) scale(1.5);opacity:0}

@media (max-width:1080px){
  .hntr-web{flex-direction:column;overflow:auto}
  .web-chat{width:100%}
  .web-up-grid{grid-template-columns:1fr}
}
`;

/* ────────────────────────────── icons ────────────────────────────── */

const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
    <path d="M8 4.6V8l2.4 1.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconChevron = () => (
  <svg className="wv-lang-chev" width="11" height="11" viewBox="0 0 16 16" fill="none">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconCheck = () => (
  <svg className="wv-lang-check" width="12" height="12" viewBox="0 0 16 16" fill="none">
    <path d="M3 8.4l3.3 3.3L13 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconDeck = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <rect x="1.6" y="2.6" width="12.8" height="9" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
    <path d="M8 11.6v2M5.4 13.6h5.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const IconVolume = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2.5 6v4h2.5l3.5 2.5v-9L5 6H2.5z" fill="currentColor" />
    <path d="M10.5 5.5a3.5 3.5 0 0 1 0 5M12.5 3.5a6 6 0 0 1 0 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const IconFullscreen = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M2 5.5V2.5h3M14 5.5V2.5h-3M2 10.5v3h3M14 10.5v3h-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconShare = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.3" />
    <path d="M5.8 7l4.4-2.5M5.8 9l4.4 2.5" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

const IconBook = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <path d="M2.5 3.5h4A2 2 0 0 1 8 4.6 2 2 0 0 1 9.5 3.5h4v9h-4A2 2 0 0 0 8 13.6a2 2 0 0 0-1.5-1.1h-4v-9z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M8 4.6v9" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

const IconDoc = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M4 1.5h5l3 3V14a.5.5 0 0 1-.5.5h-7A.5.5 0 0 1 4 14V2a.5.5 0 0 1 .5-.5z" stroke="currentColor" strokeWidth="1.3" />
    <path d="M9 1.5V4.5h3M6 8.5h4M6 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const IconArrow = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconHeadset = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M3 9V8a5 5 0 0 1 10 0v1" stroke="currentColor" strokeWidth="1.3" />
    <rect x="1.5" y="9" width="3" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
    <rect x="11.5" y="9" width="3" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
    <path d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6z" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

const IconSend = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M2 8l12-5-5 12-2.5-4.5L2 8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

/* ────────────────────────────── helpers ────────────────────────────── */

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n: number) => String(n).padStart(2, "0");

function formatClock(d: Date): string {
  return `${DAYS[d.getDay()]}, ${MONS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}  ·  ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function useInjectedStyles(css: string, id: string) {
  useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [css, id]);
}

/* ────────────────────────────── component ────────────────────────────── */

export default function WebinarPage({
  slideSrc = "webinar-slide.png",
  presenterSrc = "webinar-presenter.png",
  signupSrc = "signup-vr.png",
  walletConnected = true,
  currentUser = "masteraccount",
  languages = LANGS,
  defaultLang = "en",
  articles = ARTICLES,
  onOpenDeck,
  onLearnMore,
  onOpenArticle,
  onSignup,
  onLangChange,
  onSend,
}: WebinarPageProps) {
  useInjectedStyles(CSS, "hntr-webinar-styles");

  const [clock, setClock] = useState(() => formatClock(new Date()));
  const [langOpen, setLangOpen] = useState(false);
  const [langCode, setLangCode] = useState(defaultLang);
  const [privacy, setPrivacy] = useState(false);
  const [draft, setDraft] = useState("");
  const [floats, setFloats] = useState<{ id: number; emoji: string; go: boolean }[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      user: "HNTR",
      time: "—",
      text: "Live webinars coming soon. Chat opens with the first broadcast.",
      kind: "system",
    },
  ]);

  const langRef = useRef<HTMLDivElement>(null);
  const msgsRef = useRef<HTMLDivElement>(null);
  const seq = useRef(1);

  const lang = useMemo(
    () => languages.find((l) => l.code === langCode) ?? languages[0],
    [languages, langCode]
  );

  useEffect(() => {
    const t = window.setInterval(() => setClock(formatClock(new Date())), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  useEffect(() => {
    const box = msgsRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages]);

  const pickLang = (l: Lang) => {
    setLangCode(l.code);
    setLangOpen(false);
    onLangChange?.(l);
  };

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    const d = new Date();
    setMessages((m) => [
      ...m,
      { id: seq.current++, user: currentUser, time: `${pad(d.getHours())}:${pad(d.getMinutes())}`, text, kind: "me" },
    ]);
    setDraft("");
    onSend?.(text);
  }, [draft, currentUser, onSend]);

  const react = (emoji: string) => {
    const id = seq.current++;
    setFloats((f) => [...f, { id, emoji, go: false }]);
    requestAnimationFrame(() =>
      setFloats((f) => f.map((x) => (x.id === id ? { ...x, go: true } : x)))
    );
    window.setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1150);
  };

  const mask = (v: string) => (privacy ? "••••••" : v);

  return (
    <div className="hntr-web">
      <div className="web-scroll">
        <div className="web-main">
          <div className="wv-head">
            <div className="wv-head-left">
              <div className="wv-headbrand">
                HNTR <span>| LIVE WEBINAR</span>
              </div>
              <div className="wv-head-l">
                <span className="wv-live">
                  <span className="wv-live-dot" />
                  LIVE
                </span>
                <span className="wv-timer">
                  <IconClock />
                  <span>{clock}</span>
                </span>
              </div>
            </div>

            <div className={`wv-lang${langOpen ? " open" : ""}`} ref={langRef}>
              <span className="wv-lang-label">Select your language</span>
              <button
                className="wv-lang-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setLangOpen((o) => !o);
                }}
              >
                <span className="wv-lang-flag">{lang.flag}</span>
                <span>
                  Presentation in <b>{lang.name}</b>
                </span>
                <IconChevron />
              </button>
              <div className="wv-lang-menu">
                {languages.map((l) => (
                  <div
                    key={l.code}
                    className={`wv-lang-opt${l.code === langCode ? " sel" : ""}`}
                    onClick={() => pickLang(l)}
                  >
                    <span className="wv-lang-flag">{l.flag}</span>
                    <span>{l.name}</span>
                    <span className="wv-lang-native">{l.native}</span>
                    {l.code === langCode && <IconCheck />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="wv-player">
            <img className="wv-slide" src={slideSrc} alt="Live presentation slide" />
            <div className="wv-presenter">
              <div className="wv-pcircle" style={{ backgroundImage: `url(${presenterSrc})` }} />
              <div className="wv-pname">Alex Chen, CFA</div>
              <div className="wv-prole">Host · Markets Desk</div>
            </div>
            <div className="wv-soon">
              <div className="wv-soon-brand">
                LIVE WEBINAR <span>| COMING SOON</span>
              </div>
              <div className="wv-soon-rule" />
              <div className="wv-soon-sub">24/7 Live Webinars in All Languages</div>
              <button className="wv-soon-cta" onClick={onOpenDeck}>
                <IconDeck />
                View Presentation Deck
              </button>
            </div>
            <div className="wv-controls">
              <div style={{ flex: 1 }} />
              <button className="wv-cbtn" aria-label="Volume">
                <IconVolume />
              </button>
              <button className="wv-cbtn" aria-label="Fullscreen">
                <IconFullscreen />
              </button>
            </div>
          </div>

          <div className="web-actbar">
            <div className="web-act">
              <IconShare />
              Share Access
            </div>
            <button className="web-deck" onClick={onLearnMore}>
              <IconBook />
              LEARN MORE
            </button>
          </div>

          <div className="web-brandline">
            HNTR <span>| LIVE WEBINAR</span>
          </div>
          <div className="web-meta">
            <span className="web-tag">Q4 STRATEGY</span>
            <span className="web-meta-dot">·</span>
            <span className="web-meta-txt">Started 42 minutes ago</span>
          </div>
          <p className="web-desc">
            Join us for an exclusive English session with Alex Chen, CFA, as he introduces HNTR — a
            groundbreaking Web3 platform that combines co-owned NFT pools with a powerful referral
            system to make premium NFT ownership simple, accessible, and highly profitable.
            <br />
            <br />
            Discover how HNTR is creating a new era of opportunity in the NFT space.
          </p>

          <div className="web-hr" />

          <div className="web-up-hdr">
            <div className="web-up-title">HNTR NEWSLETTER</div>
            <a className="web-up-link" onClick={() => onOpenArticle?.(0)}>
              View All Articles
            </a>
          </div>
          <div className="web-up-grid">
            {articles.map((a, i) => (
              <button key={a.title} className="web-card" onClick={() => onOpenArticle?.(i)}>
                <div className="web-card-top">
                  <span className="web-card-date">{a.meta}</span>
                  <span className="web-card-cal">
                    <IconDoc />
                  </span>
                </div>
                <div className="web-card-ttl">{a.title}</div>
                <div className="web-card-sub">{a.sub}</div>
                <div className="web-card-add">
                  <IconArrow />
                  Read Article
                </div>
              </button>
            ))}
          </div>

          <div className="web-foot">
            <span>© 2024 HNTR Institutional. System Status: Operational</span>
            <div className="web-foot-links">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Docs</span>
            </div>
          </div>
        </div>
      </div>

      <div className="web-chat">
        <div className="web-wallet">
          {walletConnected ? (
            <>
              <div className="r-div">
                <div className="rp">
                  <div className="rav">👤</div>
                  <div>
                    <div className="rn">{currentUser}</div>
                    <div className="rt">Elite Platinum</div>
                  </div>
                  <button
                    className={`privacy-eye${privacy ? " off" : ""}`}
                    onClick={() => setPrivacy((p) => !p)}
                    aria-label="Hide balances"
                    title="Hide balances"
                  >
                    <IconEye />
                  </button>
                </div>
                <div className="rpb-wrap">
                  <div className="rph">
                    <div className="rpl">Current Progress</div>
                    <div className="rpp">74%</div>
                  </div>
                  <div className="rpb">
                    <div className="rpf" style={{ width: "74%" }} />
                  </div>
                  <div className="rpls">
                    <span>Platinum Elite</span>
                    <span>Platinum Legend</span>
                  </div>
                </div>
              </div>
              <div className="r-div">
                <div className="rs2">
                  <div className="rsb">
                    <div className="rsbl">Total Rewarded</div>
                    <div className="rsbv">{mask("$11,955.14")}</div>
                    <div className="rsbc">↑+4.2% This Month</div>
                  </div>
                  <div className="rsb">
                    <div className="rsbl" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      HNTR Points
                      <span className="info-i" title="HNTR POINTS COMING SOON">
                        i
                      </span>
                    </div>
                    <div className="rsbv">{mask("6,913,586")}</div>
                    <div className="rsbg">— Lifetime</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="signup-card" onClick={onSignup}>
              <img src={signupSrc} alt="HNTR.art" />
              <span className="signup-card-fill">SIGN UP HERE</span>
            </div>
          )}
        </div>

        <div className="web-listen-card">
          <div className="web-chat-hdr">
            <div className="web-chat-hl">
              <IconHeadset />
              LIVE LISTENING
            </div>
            <span className="web-chat-live" />
          </div>
          <div className="web-msgs" ref={msgsRef}>
            {messages.map((m) => (
              <div key={m.id} className={`web-msg${m.kind ? ` ${m.kind}` : ""}`}>
                <div className="web-msg-head">
                  <span className="web-msg-user">{m.user}</span>
                  <span className="web-msg-time">{m.time}</span>
                </div>
                <div className="web-bubble">{m.text}</div>
              </div>
            ))}
          </div>
          <div className="web-chat-foot">
            <div className="web-react">
              {REACTIONS.map((e) => (
                <button key={e} onClick={() => react(e)}>
                  {e}
                </button>
              ))}
            </div>
            <div className="web-input-row">
              <input
                value={draft}
                placeholder="Type a message…"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
              />
              <button className="web-send" onClick={send} aria-label="Send">
                <IconSend />
              </button>
            </div>
          </div>
        </div>

        {floats.map((f) => (
          <div key={f.id} className={`web-float${f.go ? " go" : ""}`}>
            {f.emoji}
          </div>
        ))}
      </div>
    </div>
  );
}
