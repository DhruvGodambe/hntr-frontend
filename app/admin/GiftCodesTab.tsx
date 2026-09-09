"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminTable, StatusBadge } from "@/components/admin/UI";
import {
  adminApi,
  AdminApiError,
  AdminVoucher,
  AdminVoucherAccount,
  AdminVoucherLedgerEntry,
  AdminAchievementBonus,
  BurnerHealth,
  formatUsd,
} from "@/lib/admin/api";
import { clearStoredAuth } from "@/lib/api";
import { useConnectWallet } from "@/lib/useConnectWallet";
import { CONTRACT_ADDRESS, hntrMembershipAbi } from "@/lib/contracts";
import { config } from "@/lib/wagmi";
import { useAccount } from "wagmi";
import { writeContract, waitForTransactionReceipt } from "wagmi/actions";

type Notify = (type: "success" | "error" | "info", message: string) => void;

function money(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function GiftCodesTab({ notify }: { notify: Notify }) {
  const [tab, setTab] = useState<"accounts" | "vouchers" | "ledger" | "review" | "burner">("accounts");

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-[#222] overflow-x-auto">
        {(["accounts", "vouchers", "ledger", "review", "burner"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
              tab === t ? "text-[#f50] border-b-2 border-[#f50]" : "text-gray-500 hover:text-white"
            }`}
          >
            {t === "review" ? "Bonus Review" : t}
          </button>
        ))}
      </div>

      {tab === "accounts" && <AccountsPane notify={notify} />}
      {tab === "vouchers" && <VouchersPane notify={notify} />}
      {tab === "ledger" && <LedgerPane notify={notify} />}
      {tab === "review" && <BonusReviewPane notify={notify} />}
      {tab === "burner" && <BurnerPane notify={notify} />}
    </div>
  );
}

// ── Accounts ───────────────────────────────────────────────────────────────
function AccountsPane({ notify }: { notify: Notify }) {
  const [rows, setRows] = useState<AdminVoucherAccount[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [amounts, setAmounts] = useState<Record<string, { token: "USDT" | "USDC"; value: string }>>({});
  /** Member found via Users search who has no VoucherAccount yet — offer Enable. */
  const [enableCandidate, setEnableCandidate] = useState<{
    username: string;
    walletAddress: string;
  } | null>(null);

  const load = useCallback(
    async (term = "") => {
      setLoading(true);
      setEnableCandidate(null);
      try {
        const data = await adminApi.getVoucherAccounts({ search: term, limit: 100 });
        setRows(data.items);

        // Search found no voucher accounts — resolve an existing platform member to enable.
        if (data.items.length === 0 && term.trim()) {
          try {
            const users = await adminApi.getUsers({ search: term.trim(), limit: 5 });
            const match =
              users.items.find(
                (u) =>
                  u.username.toLowerCase() === term.trim().toLowerCase() ||
                  (u.walletAddress &&
                    u.walletAddress.toLowerCase().includes(term.trim().toLowerCase())),
              ) || users.items[0];
            if (match?.username && match.walletAddress) {
              setEnableCandidate({
                username: match.username,
                walletAddress: match.walletAddress,
              });
            }
          } catch {
            /* ignore user-lookup errors; empty table still shows */
          }
        }
      } catch (err) {
        notify("error", err instanceof AdminApiError ? err.message : "Failed to load accounts");
      } finally {
        setLoading(false);
      }
    },
    [notify],
  );

  useEffect(() => {
    load();
  }, [load]);

  const enableMember = async (username: string) => {
    try {
      await adminApi.setVoucherAccess(username, true);
      notify("success", `Gift Codes enabled for ${username}.`);
      setSearch(username);
      await load(username);
    } catch (err) {
      notify("error", err instanceof AdminApiError ? err.message : "Failed to enable Gift Codes");
    }
  };

  const toggle = async (a: AdminVoucherAccount) => {
    try {
      await adminApi.setVoucherAccess(a.username, !a.enabled);
      notify("success", `Gift Codes ${a.enabled ? "disabled" : "enabled"} for ${a.username}.`);
      load(search);
    } catch (err) {
      notify("error", err instanceof AdminApiError ? err.message : "Action failed");
    }
  };

  const adjust = async (a: AdminVoucherAccount, direction: 1 | -1) => {
    const entry = amounts[a.username] ?? { token: "USDT" as const, value: "" };
    const amount = parseFloat(entry.value || "0");
    if (!amount || amount <= 0) {
      notify("error", "Enter an amount greater than zero.");
      return;
    }
    try {
      const r = await adminApi.adjustVoucherBalance(a.username, entry.token, direction * amount);
      notify("success", `${direction === 1 ? "Credited" : "Debited"} ${money(amount)} ${entry.token} — new balance ${money(r.balance)}.`);
      setAmounts((p) => ({ ...p, [a.username]: { ...entry, value: "" } }));
      load(search);
    } catch (err) {
      notify("error", err instanceof AdminApiError ? err.message : "Adjust failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(search)}
          placeholder="Search username or wallet…"
          className="flex-1 bg-[#111] border border-[#222] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#f50]"
        />
        <button onClick={() => load(search)} className="bg-[#f50] px-6 py-2.5 rounded-xl text-sm font-bold">
          Search
        </button>
      </div>
      <p className="text-[11px] text-gray-500">
        Enabling an account lets that wallet open the Gift Codes page and see the GIFT CODES button
        on the membership page. Balance is promo credit — it never moves real tokens. Enable from
        the Users tab (<span className="text-gray-400 font-bold">Codes</span> action) or search a
        member here and click Enable.
      </p>

      {enableCandidate ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3">
          <div>
            <div className="text-sm font-bold text-white">{enableCandidate.username}</div>
            <div className="text-[10px] font-mono text-gray-500">
              {enableCandidate.walletAddress.slice(0, 10)}…{enableCandidate.walletAddress.slice(-4)}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Member found, but Gift Codes is not enabled yet.
            </p>
          </div>
          <button
            onClick={() => enableMember(enableCandidate.username)}
            className="bg-[#f50] px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap"
          >
            Enable Gift Codes
          </button>
        </div>
      ) : null}

      <AdminTable headers={["User", "Wallet", "Gift Codes", "USDT", "USDC", "Codes", "Adjust Balance"]}>
        {loading ? (
          <tr>
            <td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-sm">
              Loading…
            </td>
          </tr>
        ) : rows.length === 0 ? (
          <tr>
            <td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-sm">
              {search.trim()
                ? enableCandidate
                  ? "No voucher account row yet — use Enable Gift Codes above."
                  : "No matching member. Try an exact username from the Users tab."
                : "No voucher accounts yet. Use Users → Codes, or search a member username above to enable."}
            </td>
          </tr>
        ) : (
          rows.map((a) => {
            const entry = amounts[a.username] ?? { token: "USDT" as const, value: "" };
            return (
              <tr key={a.walletAddress} className="hover:bg-[#1a1a1a] align-top">
                <td className="px-6 py-4 text-sm font-bold">{a.username}</td>
                <td className="px-6 py-4 text-xs font-mono text-gray-500">
                  {a.walletAddress.slice(0, 6)}…{a.walletAddress.slice(-4)}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggle(a)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${a.enabled ? "bg-[#f50]" : "bg-[#333]"}`}
                    role="switch"
                    aria-checked={a.enabled}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${a.enabled ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-green-500">
                  ${money(a.balances.find((b) => b.token === "USDT")?.balance ?? 0)}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-green-500">
                  ${money(a.balances.find((b) => b.token === "USDC")?.balance ?? 0)}
                </td>
                <td className="px-6 py-4 text-xs text-gray-400">
                  {a.activeCount} active · {a.redeemedCount} redeemed
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <select
                      value={entry.token}
                      onChange={(e) =>
                        setAmounts((p) => ({ ...p, [a.username]: { ...entry, token: e.target.value as "USDT" | "USDC" } }))
                      }
                      className="bg-[#1a1a1a] border border-[#333] rounded-lg px-2 py-1.5 text-xs"
                    >
                      <option>USDT</option>
                      <option>USDC</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      value={entry.value}
                      onChange={(e) => setAmounts((p) => ({ ...p, [a.username]: { ...entry, value: e.target.value } }))}
                      placeholder="0.00"
                      className="w-24 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-1.5 text-sm"
                    />
                    <button
                      onClick={() => adjust(a, 1)}
                      className="px-3 py-1.5 rounded-lg bg-green-600/15 border border-green-600/30 text-green-400 text-xs font-bold"
                    >
                      + Add
                    </button>
                    <button
                      onClick={() => adjust(a, -1)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold"
                    >
                      − Remove
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </AdminTable>
    </div>
  );
}

// ── Vouchers ───────────────────────────────────────────────────────────────
function VouchersPane({ notify }: { notify: Notify }) {
  const [rows, setRows] = useState<AdminVoucher[]>([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getVouchers({ status, limit: 100 });
      setRows(data.items);
    } catch (err) {
      notify("error", err instanceof AdminApiError ? err.message : "Failed to load vouchers");
    } finally {
      setLoading(false);
    }
  }, [status, notify]);

  useEffect(() => {
    load();
  }, [load]);

  const revoke = async (v: AdminVoucher) => {
    const reason = window.prompt(`Revoke ${v.tier} code from ${v.issuerUsername}? Reason:`);
    if (!reason) return;
    try {
      const r = await adminApi.revokeVoucher(v.voucherId, reason);
      notify("success", `Revoked — ${money(r.refunded)} refunded to ${v.issuerUsername}.`);
      load();
    } catch (err) {
      notify("error", err instanceof AdminApiError ? err.message : "Revoke failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 p-1 bg-[#111] rounded-xl border border-[#222] w-fit">
        {["all", "ACTIVE", "REDEEMED", "EXPIRED", "REVOKED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest ${status === s ? "bg-[#f50] text-white" : "text-gray-500 hover:text-white"}`}
          >
            {s}
          </button>
        ))}
      </div>

      <AdminTable headers={["Code", "Issuer", "Tier", "Value", "Status", "Redeemer", "Expires", ""]}>
        {loading ? (
          <tr>
            <td colSpan={8} className="px-6 py-8 text-center text-gray-500 text-sm">
              Loading…
            </td>
          </tr>
        ) : rows.length === 0 ? (
          <tr>
            <td colSpan={8} className="px-6 py-8 text-center text-gray-500 text-sm">
              No vouchers.
            </td>
          </tr>
        ) : (
          rows.map((v) => (
            <tr key={v.voucherId} className="hover:bg-[#1a1a1a]">
              <td className="px-6 py-4 text-xs font-mono text-gray-400">HNTR-••••-••••-{v.codeLast4}</td>
              <td className="px-6 py-4 text-sm font-bold">{v.issuerUsername}</td>
              <td className="px-6 py-4 text-sm">{v.tier}</td>
              <td className="px-6 py-4 text-sm font-bold text-green-500">
                {money(v.amountUsd)} {v.token}
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={v.status} />
              </td>
              <td className="px-6 py-4 text-sm text-gray-400">{v.redeemerUsername ?? "—"}</td>
              <td className="px-6 py-4 text-xs text-gray-500">{new Date(v.expiresAt).toLocaleDateString()}</td>
              <td className="px-6 py-4">
                {v.status === "ACTIVE" && (
                  <button
                    onClick={() => revoke(v)}
                    className="px-3 py-1.5 rounded-lg border border-[#222] text-xs text-gray-400 hover:text-red-400 hover:border-red-500/30"
                  >
                    Revoke
                  </button>
                )}
              </td>
            </tr>
          ))
        )}
      </AdminTable>
    </div>
  );
}

// ── Ledger ─────────────────────────────────────────────────────────────────
function LedgerPane({ notify }: { notify: Notify }) {
  const [rows, setRows] = useState<AdminVoucherLedgerEntry[]>([]);
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getVoucherLedger({ walletAddress: wallet || undefined, limit: 100 });
      setRows(data.items);
    } catch (err) {
      notify("error", err instanceof AdminApiError ? err.message : "Failed to load ledger");
    } finally {
      setLoading(false);
    }
  }, [wallet, notify]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Filter by wallet address (optional)"
          className="flex-1 bg-[#111] border border-[#222] rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[#f50]"
        />
        <button onClick={load} className="bg-[#1a1a1a] border border-[#333] px-6 py-2.5 rounded-xl text-sm font-bold">
          Refresh
        </button>
      </div>
      <AdminTable headers={["When", "Wallet", "Token", "Delta", "Balance After", "Reason", "By"]}>
        {loading ? (
          <tr>
            <td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-sm">
              Loading…
            </td>
          </tr>
        ) : rows.length === 0 ? (
          <tr>
            <td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-sm">
              No ledger entries.
            </td>
          </tr>
        ) : (
          rows.map((r) => (
            <tr key={r._id} className="hover:bg-[#1a1a1a]">
              <td className="px-6 py-4 text-xs text-gray-500">{new Date(r.timestamp).toLocaleString()}</td>
              <td className="px-6 py-4 text-xs font-mono text-gray-500">
                {r.walletAddress.slice(0, 6)}…{r.walletAddress.slice(-4)}
              </td>
              <td className="px-6 py-4 text-xs">{r.token}</td>
              <td className={`px-6 py-4 text-sm font-bold ${r.delta >= 0 ? "text-green-500" : "text-red-400"}`}>
                {r.delta >= 0 ? "+" : ""}
                {money(r.delta)}
              </td>
              <td className="px-6 py-4 text-sm">{money(r.balanceAfter)}</td>
              <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">{r.reason}</td>
              <td className="px-6 py-4 text-xs text-gray-400">{r.adminUsername ?? "—"}</td>
            </tr>
          ))
        )}
      </AdminTable>
    </div>
  );
}

// ── Bonus review ───────────────────────────────────────────────────────────
function BonusReviewPane({ notify }: { notify: Notify }) {
  const [rows, setRows] = useState<AdminAchievementBonus[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getBonusReview("PENDING_REVIEW", 1, 100);
      setRows(data.items);
    } catch (err) {
      notify("error", err instanceof AdminApiError ? err.message : "Failed to load review queue");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (b: AdminAchievementBonus, decision: "approve" | "reject") => {
    const reason = decision === "reject" ? window.prompt("Reason for rejecting?") || undefined : undefined;
    try {
      await adminApi.reviewBonus(b._id, decision, reason);
      notify("success", `${decision === "approve" ? "Approved" : "Rejected"} ${b.rank} bonus for ${b.username}.`);
      load();
    } catch (err) {
      notify("error", err instanceof AdminApiError ? err.message : "Review failed");
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-gray-500">
        Achievement bonuses that qualified while a voucher-granted (unpaid) membership was in the
        downline. Approve moves the bonus to PENDING (queues it for Quick Controls → Distribute Rank
        Bonuses) — it does not send funds. Reject cancels it.
      </p>
      <AdminTable headers={["User", "Rank", "Amount", "Reason", "Queued", ""]}>
        {loading ? (
          <tr>
            <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
              Loading…
            </td>
          </tr>
        ) : rows.length === 0 ? (
          <tr>
            <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
              Nothing awaiting review.
            </td>
          </tr>
        ) : (
          rows.map((b) => (
            <tr key={b._id} className="hover:bg-[#1a1a1a] align-top">
              <td className="px-6 py-4 text-sm font-bold">{b.username}</td>
              <td className="px-6 py-4 text-sm">{b.rank}</td>
              <td className="px-6 py-4 text-sm font-bold text-green-500">{formatUsd(b.amountUSD)}</td>
              <td className="px-6 py-4 text-xs text-gray-400 max-w-xs">{b.reviewReason ?? "—"}</td>
              <td className="px-6 py-4 text-xs text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => review(b, "approve")}
                    className="px-3 py-1.5 rounded-lg bg-green-600/15 border border-green-600/30 text-green-400 text-xs font-bold"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => review(b, "reject")}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </AdminTable>
    </div>
  );
}

// ── Burner wallet ──────────────────────────────────────────────────────────
function BurnerPane({ notify }: { notify: Notify }) {
  const [health, setHealth] = useState<BurnerHealth | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [nextAddr, setNextAddr] = useState("");
  const [busy, setBusy] = useState(false);
  const { address, isConnected } = useAccount();
  const { connectWallet } = useConnectWallet();

  const load = useCallback(async () => {
    try {
      const [h, o] = await Promise.all([adminApi.getBurnerHealth(), adminApi.getOwnerWallet()]);
      setHealth(h);
      setOwner(o.address);
    } catch (err) {
      notify("error", err instanceof AdminApiError ? err.message : "Failed to load burner status");
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const rotate = async () => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(nextAddr.trim())) {
      notify("error", "Enter a valid 0x address.");
      return;
    }
    if (!CONTRACT_ADDRESS) {
      notify("error", "Contract address is not configured.");
      return;
    }
    setBusy(true);
    try {
      clearStoredAuth();
      let connected = address;
      if (!isConnected || !connected) connected = await connectWallet();
      if (owner && connected.toLowerCase() !== owner.toLowerCase()) {
        throw new Error(
          `Connected ${connected.slice(0, 6)}…${connected.slice(-4)} is not the contract owner (${owner.slice(0, 6)}…${owner.slice(-4)}).`,
        );
      }
      const txHash = await writeContract(config, {
        address: CONTRACT_ADDRESS,
        abi: hntrMembershipAbi,
        functionName: "setBurnerWallet",
        args: [nextAddr.trim() as `0x${string}`],
      });
      await waitForTransactionReceipt(config, { hash: txHash });
      const r = await adminApi.recordBurnerRotation({ txHash, burnerWallet: nextAddr.trim() });
      notify(r.matches ? "success" : "error", r.message);
      setNextAddr("");
      load();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Rotation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-[#111] border border-[#222] rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold">Burner wallet</h4>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
              health?.healthy ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
            }`}
          >
            {health ? (health.healthy ? "Healthy" : "Attention") : "…"}
          </span>
        </div>
        <p className="text-[11px] text-gray-500">
         Sends every voucher redemption and pays its gas, so redeemers never sign a tx. Holds ETH
          only — never tokens.
        </p>
        <dl className="text-xs space-y-1.5">
          <div className="flex justify-between">
            <dt className="text-gray-500">Configured</dt>
            <dd className="font-mono">{health?.configuredAddress ?? "not set"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">On-chain</dt>
            <dd className="font-mono">{health?.onChainAddress ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Match</dt>
            <dd className={health?.matches ? "text-green-400" : "text-red-400"}>
              {health?.matches ? "yes" : "no"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Gas balance</dt>
            <dd className={health && health.balanceEth < health.minEth ? "text-red-400" : ""}>
              {health ? `${health.balanceEth.toFixed(4)} ETH (min ${health.minEth})` : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-2xl p-6 space-y-3">
        <h4 className="text-sm font-bold">Rotate burner (owner only)</h4>
        <p className="text-[11px] text-gray-500">
          <span className="font-mono">setBurnerWallet</span> is onlyOwner. Connect the contract owner
          wallet ({owner ? `${owner.slice(0, 6)}…${owner.slice(-4)}` : "…"}) to sign. After it
          confirms, update <span className="font-mono">BURNER_WALLET_PRIVATE_KEY</span> in the backend
          env and restart.
        </p>
        <div className="flex gap-3">
          <input
            value={nextAddr}
            onChange={(e) => setNextAddr(e.target.value)}
            placeholder="0x new burner address"
            className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-sm font-mono"
          />
          <button
            onClick={rotate}
            disabled={busy}
            className="bg-[#f50] px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
          >
            {busy ? "Confirming…" : "Rotate"}
          </button>
        </div>
      </div>
    </div>
  );
}
