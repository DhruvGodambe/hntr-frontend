import React, { useEffect, useState } from "react";

export function TxHashLink({
  txHash,
  start = 6,
  end = 4,
  className = "text-xs font-mono text-gray-400 hover:text-[#f50] transition-colors",
}: {
  txHash: string | null | undefined;
  start?: number;
  end?: number;
  className?: string;
}) {
  if (!txHash) {
    return <span className={className}>—</span>;
  }

  return (
    <a
      href={`https://sepolia.etherscan.io/tx/${txHash}`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {`${txHash.slice(0, start)}...${txHash.slice(-end)}`}
    </a>
  );
}

export function AdminCard({ title, value, subValue, icon }: { title: string, value: string | number, subValue?: string, icon?: string }) {
  return (
    <div className="bg-[#111] border border-[#222] p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-sm min-w-0">
      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3 lg:mb-4">
        <span className="text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wide leading-snug">
          {title}
        </span>
        {icon && <span className="text-sm sm:text-lg lg:text-xl opacity-50 shrink-0">{icon}</span>}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-lg sm:text-2xl lg:text-3xl font-bold tracking-tight leading-none break-words">
          {value}
        </span>
        {subValue && (
          <span className="text-[10px] sm:text-xs lg:text-sm text-green-500 mt-1 sm:mt-1.5 font-medium leading-snug">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}

export function AdminTable({
  headers,
  children,
  title,
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  minWidth = 720,
}: {
  headers: string[];
  children: React.ReactNode;
  title?: string;
  pagination?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (limit: number) => void;
  pageSizeOptions?: number[];
  minWidth?: number;
}) {
  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden shadow-sm">
      {title && (
        <div className="px-4 sm:px-6 py-4 border-b border-[#222]">
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
      )}
      <div
        className="overflow-x-auto overscroll-x-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <table className="w-full text-left" style={{ minWidth }}>
          <thead>
            <tr className="bg-[#1a1a1a] border-b border-[#222]">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">{children}</tbody>
        </table>
      </div>
      {pagination && onPageChange && (
        <AdminPagination
          pagination={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  );
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function AdminPagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}: {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (limit: number) => void;
  pageSizeOptions?: number[];
}) {
  const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-[#222] bg-[#0d0d0d]">
      <span className="text-xs text-gray-500">
        {pagination.total === 0
          ? "No results"
          : `Showing ${start}–${end} of ${pagination.total} · Page ${pagination.page} of ${Math.max(pagination.totalPages, 1)}`}
      </span>
      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <select
            value={pagination.limit}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-[#1a1a1a] border border-[#333] rounded-lg px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-[#f50]"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        )}
        <div className="flex gap-2">
          <button
            disabled={!pagination.hasPrev}
            onClick={() => onPageChange(pagination.page - 1)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#333] disabled:opacity-30 hover:bg-[#222] transition-colors"
          >
            Prev
          </button>
          <button
            disabled={!pagination.hasNext}
            onClick={() => onPageChange(pagination.page + 1)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#333] disabled:opacity-30 hover:bg-[#222] transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CONFIRMED: "bg-green-500/10 text-green-500",
    PENDING: "bg-yellow-500/10 text-yellow-500",
    FAILED: "bg-red-500/10 text-red-500",
    OPEN: "bg-blue-500/10 text-blue-500",
    CLOSED: "bg-gray-500/10 text-gray-500",
    COMPLETED: "bg-purple-500/10 text-purple-500",
    ACTIVE: "bg-green-500/10 text-green-500",
    BLOCKED: "bg-red-500/10 text-red-500",
  };

  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${styles[status] || "bg-gray-500/10 text-gray-500"}`}>
      {status}
    </span>
  );
}

export function AdminModal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full ${sizeClasses[size]} max-h-[92dvh] sm:max-h-[90vh] my-auto flex flex-col bg-[#111] border border-[#222] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden`}
      >
        <div className="px-4 sm:px-6 py-4 border-b border-[#222] flex items-center justify-between gap-4 flex-shrink-0 bg-[#111]">
          <h3 className="font-bold text-base sm:text-lg leading-snug pr-2">{title}</h3>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-[#1a1a1a] transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}

export interface Notification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = React.useCallback((type: "success" | "error" | "info", message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => {
      if (prev.some((n) => n.type === type && n.message === message)) return prev;
      return [...prev, { id, type, message }];
    });
    setTimeout(() => {
      setNotifications((current) => current.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  return { notifications, notify };
}

export function NotificationPortal({ notifications }: { notifications: Notification[] }) {
  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right duration-300 pointer-events-auto ${
            n.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-500" :
            n.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-500" :
            "bg-blue-500/10 border-blue-500/20 text-blue-500"
          }`}
        >
          <span className="text-xl">
            {n.type === "success" ? "✓" : n.type === "error" ? "⚠" : "ℹ"}
          </span>
          <span className="font-semibold text-sm">{n.message}</span>
        </div>
      ))}
    </div>
  );
}
