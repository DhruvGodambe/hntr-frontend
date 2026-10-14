"use client";

import { useMemo, useRef, useState, type DragEvent } from "react";
import { useRouter } from "nextjs-toploader/app";
import MainLayout from "../components/MainLayout";
import HntrFooter, { DISCORD_URL, TELEGRAM_URL } from "../components/layout/shell/HntrFooter";
import SupportHolo from "../components/support/SupportHolo";
import { usePools } from "@/lib/pools";
import { useEffectiveAccount } from "@/lib/session";
import { handleAppError } from "@/lib/errors";
import {
  createSupportTicket,
  replyToSupportTicket,
  SupportUnavailableError,
  useSupportInvalidate,
  useSupportTickets,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/support";

const CATEGORIES = ["Deposits & Withdrawals", "NFT Strategies", "Membership", "Network & Rewards", "Wallet & Account", "Other"];
const PRIORITIES: TicketPriority[] = ["Low", "Normal", "Urgent"];
const STATUS_LABEL: Record<TicketStatus, string> = { open: "Open", pending: "Awaiting reply", resolved: "Resolved" };
const FILTERS: { key: "all" | TicketStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "pending", label: "Awaiting reply" },
  { key: "resolved", label: "Resolved" },
];

const QUICK_ANSWERS = [
  {
    q: "When is my deposit added to a pool?",
    a: "Deposits are confirmed on-chain and appear in the pool once the transaction has the required confirmations, usually within a few minutes.",
  },
  {
    q: "What happens when a pool reaches its target?",
    a: "The NFT is bought instantly and listed for sale. When it sells, each depositor receives their share.",
  },
  { q: "How do I upgrade my membership?", a: "Open Membership from the left menu and select a higher tier. The upgrade applies straight away." },
  { q: "How are network rewards paid?", a: "Rewards collect in the Network page. Use Claim on each reward card to send them to your wallet." },
];

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function SupportPage() {
  const router = useRouter();
  const { isConnected } = useEffectiveAccount();
  const { data: pools } = usePools();
  const { data: tickets = [] } = useSupportTickets();
  const invalidate = useSupportInvalidate();

  const [tab, setTab] = useState<"new" | "list">("new");
  const [filter, setFilter] = useState<"all" | TicketStatus>("all");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState<TicketPriority>("Low");
  const [strategy, setStrategy] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement | null>(null);

  const strategies = useMemo(() => (pools ?? []).filter((p) => p.status !== "CLOSED").map((p) => p.name), [pools]);
  const visible = tickets.filter((t) => filter === "all" || t.status === filter);

  const unavailableNotice = () =>
    setErr("The support desk opens soon. In the meantime, reach the team on Telegram or Discord.");

  const submit = async () => {
    if (!subject.trim() || !message.trim()) {
      setErr("Add a subject and a message.");
      return;
    }
    if (!isConnected) {
      setErr("Connect your wallet to open a ticket.");
      window.openSignup?.();
      return;
    }
    setErr("");
    setBusy(true);
    try {
      const created = await createSupportTicket({
        category,
        priority,
        strategy: strategy || undefined,
        subject: subject.trim(),
        message: message.trim(),
        attachmentCount: files.length,
      });
      setSubject("");
      setMessage("");
      setFiles([]);
      await invalidate();
      setFilter("all");
      setTab("list");
      setOpenId(created.id);
    } catch (e) {
      if (e instanceof SupportUnavailableError) unavailableNotice();
      else handleAppError(e, "Could not submit ticket");
    } finally {
      setBusy(false);
    }
  };

  const reply = async (id: string) => {
    const body = (replies[id] || "").trim();
    if (!body) return;
    try {
      await replyToSupportTicket(id, body);
      setReplies((r) => ({ ...r, [id]: "" }));
      await invalidate();
    } catch (e) {
      if (e instanceof SupportUnavailableError) unavailableNotice();
      else handleAppError(e, "Could not send reply");
    }
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDrag(false);
    setFiles(Array.from(e.dataTransfer.files || []));
  };

  return (
    <MainLayout>
      <div className="feed" id="feed-support">
        <div className="page-body">
          <SupportHolo />
          <div className="sp-tabs">
            <button type="button" className={`sp-tab${tab === "new" ? " on" : ""}`} data-t="new" onClick={() => setTab("new")}>
              New Ticket
            </button>
            <button type="button" className={`sp-tab${tab === "list" ? " on" : ""}`} data-t="list" onClick={() => setTab("list")}>
              My Tickets <em id="spTabN">{tickets.length}</em>
            </button>
          </div>
          <div className="sp-grid">
            <div className="sp-main">
              <div className={`sp-pane${tab === "new" ? " on" : ""}`} id="spPaneNew">
                <div className="sp-card">
                  <div className="sp-card-t">Create a ticket</div>
                  <div className="sp-row2">
                    <label className="sp-f">
                      <span>Category</span>
                      <select id="spCat" value={category} onChange={(e) => setCategory(e.target.value)}>
                        {CATEGORIES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                    <label className="sp-f">
                      <span>Priority</span>
                      <div className="sp-seg" id="spPri">
                        {PRIORITIES.map((p) => (
                          <button key={p} type="button" className={priority === p ? "on" : undefined} onClick={() => setPriority(p)}>
                            {p}
                          </button>
                        ))}
                      </div>
                    </label>
                  </div>
                  <label className="sp-f">
                    <span>Related strategy (optional)</span>
                    <select id="spPool" value={strategy} onChange={(e) => setStrategy(e.target.value)}>
                      <option value="">None</option>
                      {strategies.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label className="sp-f">
                    <span>Subject</span>
                    <input id="spSubj" maxLength={90} placeholder="Short summary of the issue" value={subject} onChange={(e) => setSubject(e.target.value)} />
                  </label>
                  <label className="sp-f">
                    <span>Message</span>
                    <textarea
                      id="spMsg"
                      rows={6}
                      placeholder="Describe what happened, include transaction hashes if relevant"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </label>
                  <label
                    className={`sp-drop${drag ? " drag" : ""}`}
                    id="spDrop"
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDrag(true);
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setDrag(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setDrag(false);
                    }}
                    onDrop={onDrop}
                  >
                    <input ref={fileRef} type="file" id="spFile" multiple hidden accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path d="M10 13V4M6.5 7.5 10 4l3.5 3.5M4 14v2h12v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span id="spDropT">
                      {files.length ? (
                        `${files.length} file${files.length > 1 ? "s" : ""} attached`
                      ) : (
                        <>
                          Drop screenshots here or <u>browse</u>
                        </>
                      )}
                    </span>
                  </label>
                  <div className="sp-actions">
                    <span className="sp-err" id="spErr">
                      {err}
                    </span>
                    <button type="button" className="sp-btn" onClick={submit} disabled={busy}>
                      {busy ? "Submitting…" : "Submit Ticket"}
                    </button>
                  </div>
                </div>
              </div>

              <div className={`sp-pane${tab === "list" ? " on" : ""}`} id="spPaneList">
                <div className="sp-filters">
                  {FILTERS.map((f) => (
                    <button key={f.key} type="button" className={filter === f.key ? "on" : undefined} onClick={() => setFilter(f.key)}>
                      {f.label}
                    </button>
                  ))}
                </div>
                <div className="sp-list" id="spList">
                  {visible.length === 0 ? (
                    <div className="sp-empty">{isConnected ? "No tickets here." : "Connect your wallet to see your tickets."}</div>
                  ) : (
                    visible.map((t) => (
                      <div className={`sp-t${openId === t.id ? " open-x" : ""}`} data-id={t.id} key={t.id}>
                        <div className="sp-t-h" onClick={() => setOpenId((id) => (id === t.id ? null : t.id))}>
                          <span className="sp-t-id">{t.id}</span>
                          <div style={{ minWidth: 0 }}>
                            <div className="sp-t-s">{t.subject}</div>
                            <div className="sp-t-m">
                              {[t.category, t.strategy, t.priority].filter(Boolean).join(" · ")}
                            </div>
                          </div>
                          <span className="sp-t-d">{fmtDate(t.createdAt)}</span>
                          <span className={`sp-pill ${t.status}`}>{STATUS_LABEL[t.status]}</span>
                        </div>
                        <div className="sp-t-b">
                          {t.messages.map((m, i) => (
                            <div className={`sp-msg${m.fromSupport ? "" : " me"}`} key={i}>
                              <small>
                                {m.fromSupport ? "HNTR Support" : "You"} · {fmtDate(m.createdAt).replace(/, \d{4}$/, "")}
                              </small>
                              {m.body}
                            </div>
                          ))}
                          {t.status !== "resolved" && (
                            <div className="sp-reply">
                              <textarea
                                rows={2}
                                placeholder="Write a reply"
                                value={replies[t.id] || ""}
                                onChange={(e) => setReplies((r) => ({ ...r, [t.id]: e.target.value }))}
                              />
                              <button type="button" className="sp-btn" onClick={() => reply(t.id)}>
                                Send
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="sp-side">
              <div className="sp-card">
                <div className="sp-card-t">Quick answers</div>
                {QUICK_ANSWERS.map((qa) => (
                  <details className="sp-q" key={qa.q}>
                    <summary>{qa.q}</summary>
                    <p>{qa.a}</p>
                  </details>
                ))}
              </div>
              <div className="sp-card">
                <div className="sp-card-t">Community</div>
                <div className="sp-comm">
                  <a href={TELEGRAM_URL} target={TELEGRAM_URL === "#" ? undefined : "_blank"} rel="noopener noreferrer">
                    <b>Telegram</b>
                    <span>Announcements and chat</span>
                  </a>
                  <a href={DISCORD_URL} target={DISCORD_URL === "#" ? undefined : "_blank"} rel="noopener noreferrer">
                    <b>Discord</b>
                    <span>Hunters community</span>
                  </a>
                  <a
                    href="/learn"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push("/learn");
                    }}
                  >
                    <b>Learn</b>
                    <span>Guides and docs</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <HntrFooter />
      </div>
    </MainLayout>
  );
}
