"use client";

import * as React from "react";
import { Check, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  moreNotifications,
  notifications as initialNotifications,
  type NotificationItem,
} from "@/features/notifications/data/notifications-data";
import { nftPlaceholder } from "@/lib/placeholders";

export function NotificationsPanel() {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState(() =>
    initialNotifications.filter(
      (item) => isNftSaleNotification(item) || isOperationalNotification(item),
    ),
  );
  const [hasMore, setHasMore] = React.useState(true);

  const loadMore = () => {
    setItems((current) => [
      ...current,
      ...moreNotifications.filter(
        (item) => isNftSaleNotification(item) || isOperationalNotification(item),
      ),
    ]);
    setHasMore(false);
  };

  const dismissItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="nav-btn relative"
        >
          {items.length > 0 && (
            <span className="notif-badge" aria-hidden />
          )}
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M8 2a3.5 3.5 0 0 1 3.5 3.5c0 3.5 1.5 4.5 1.5 4.5H3s1.5-1 1.5-4.5A3.5 3.5 0 0 1 8 2z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M6.5 12.5a1.5 1.5 0 0 0 3 0"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[min(96vw,400px)] overflow-hidden rounded-md border border-border bg-e1 p-0 shadow-sh3"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.08em] text-t4">
            Notifications
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-t2 transition-colors hover:text-t4"
            aria-label="Close notifications"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex max-h-[min(60vh,480px)] flex-col gap-2 overflow-y-auto p-3">
          {items.length === 0 ? (
            <p className="px-2 py-6 text-center text-[10px] text-t1">
              No notifications
            </p>
          ) : (
            items.map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
                onDismiss={() => dismissItem(item.id)}
              />
            ))
          )}
        </div>

        {hasMore && (
          <button
            type="button"
            onClick={loadMore}
            className="w-full border-t border-border bg-e3 py-2.5 font-mono text-[9px] font-medium uppercase tracking-[0.06em] text-t2 transition-colors hover:bg-e4 hover:text-t4"
          >
            Load More
          </button>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type NotificationCardProps = {
  item: NotificationItem;
  onDismiss: () => void;
};

function isNftSaleNotification(
  item: NotificationItem,
): item is Extract<NotificationItem, { type: "nft-sale" }> {
  return item.type === "nft-sale";
}

function isOperationalNotification(
  item: NotificationItem,
): item is Extract<NotificationItem, { type: "operational" }> {
  return item.type === "operational" && typeof item.txHref === "string";
}

function NotificationCard({ item, onDismiss }: NotificationCardProps) {
  if (isNftSaleNotification(item)) {
    return <NftSaleNotificationCard item={item} onDismiss={onDismiss} />;
  }

  if (isOperationalNotification(item)) {
    return <OperationalNotificationCard item={item} onDismiss={onDismiss} />;
  }

  return null;
}

type NftSaleNotificationCardProps = {
  item: Extract<NotificationItem, { type: "nft-sale" }>;
  onDismiss: () => void;
};

function NftSaleNotificationCard({ item, onDismiss }: NftSaleNotificationCardProps) {
  return (
    <article className="relative rounded-md border border-border bg-e3 p-3 shadow-sh1">
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-3 top-3 text-t1 transition-colors hover:text-t4"
        aria-label="Dismiss notification"
      >
        <X className="size-3.5" />
      </button>

      <p className="mb-3 pr-6 font-mono text-[8px] font-bold uppercase tracking-[0.06em] text-t4">
        NFT Successfully Sold
      </p>

      <div className="mb-3 flex gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={nftPlaceholder(item.imageSeed, 120)}
          alt=""
          className="size-14 shrink-0 rounded-[3px] object-cover"
        />
        <div className="min-w-0 pt-0.5">
          <p className="text-[11px] leading-relaxed text-t4">
            {item.assetName} has been sold for {item.salePrice}.
          </p>
          <p className="mt-1 text-[10px] text-green">
            Profit: {item.profit} ({item.profitUsd})
          </p>
        </div>
      </div>

      <Link
        href={item.viewHref}
        className="inline-flex items-center gap-1 text-[10px] text-t2 transition-colors hover:text-t4"
        onPointerDown={(event) => event.preventDefault()}
      >
        View Sale
        <ExternalLink className="size-3" aria-hidden />
      </Link>
    </article>
  );
}

type OperationalNotificationCardProps = {
  item: Extract<NotificationItem, { type: "operational" }>;
  onDismiss: () => void;
};

function OperationalNotificationCard({
  item,
  onDismiss,
}: OperationalNotificationCardProps) {
  const txHref = item.txHref;
  const isExternal = txHref.startsWith("http");

  return (
    <article className="relative rounded-md border border-border bg-e2 p-3 shadow-sh1">
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-3 top-3 text-t1 transition-colors hover:text-t4"
        aria-label="Dismiss notification"
      >
        <X className="size-3.5" />
      </button>

      <div className="flex gap-3 pr-5">
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-t4 text-e0"
          aria-hidden
        >
          <Check className="size-4" strokeWidth={2.5} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[11px] font-bold leading-snug text-t4">
            {item.title}
          </h3>
          <p className="mt-1 text-[10px] leading-relaxed text-t2">
            {item.description}
          </p>

          {isExternal ? (
            <a
              href={txHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-flex font-mono text-[8px] font-medium uppercase tracking-[0.06em] text-t4 transition-colors hover:text-t2"
              onPointerDown={(event) => event.preventDefault()}
            >
              View Transaction
            </a>
          ) : (
            <Link
              href={txHref}
              className="mt-2.5 inline-flex font-mono text-[8px] font-medium uppercase tracking-[0.06em] text-t4 transition-colors hover:text-t2"
              onPointerDown={(event) => event.preventDefault()}
            >
              View Transaction
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
