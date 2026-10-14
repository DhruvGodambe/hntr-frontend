"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { ensureAuth } from "./auth";
import { useEffectiveAccount } from "./session";

/**
 * Support desk client for the V2 Support page.
 *
 * Expects backend routes `POST /api/support/tickets`, `GET /api/support/tickets`
 * and `POST /api/support/tickets/:id/messages` (wallet-authenticated). Until the
 * backend ships them, `SupportUnavailableError` is thrown so the page can tell
 * members to use the community channels instead of silently dropping tickets.
 */

export type TicketStatus = "open" | "pending" | "resolved";
export type TicketPriority = "Low" | "Normal" | "Urgent";

export interface SupportMessage {
  fromSupport: boolean;
  body: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  strategy?: string | null;
  status: TicketStatus;
  createdAt: string;
  messages: SupportMessage[];
}

export interface NewTicketInput {
  category: string;
  priority: TicketPriority;
  strategy?: string;
  subject: string;
  message: string;
  attachmentCount?: number;
}

export class SupportUnavailableError extends Error {
  constructor() {
    super("The support desk is not live yet.");
    this.name = "SupportUnavailableError";
  }
}

const unavailable = (err: unknown) => err instanceof ApiError && (err.statusCode === 404 || err.statusCode === 501);

export async function createSupportTicket(input: NewTicketInput): Promise<SupportTicket> {
  await ensureAuth({ interactive: true });
  try {
    return await api.post<SupportTicket>("/api/support/tickets", input, { auth: true });
  } catch (err) {
    if (unavailable(err)) throw new SupportUnavailableError();
    throw err;
  }
}

export async function replyToSupportTicket(id: string, body: string): Promise<SupportTicket> {
  await ensureAuth({ interactive: true });
  try {
    return await api.post<SupportTicket>(`/api/support/tickets/${encodeURIComponent(id)}/messages`, { body }, { auth: true });
  } catch (err) {
    if (unavailable(err)) throw new SupportUnavailableError();
    throw err;
  }
}

export function useSupportTickets() {
  const { address, isConnected } = useEffectiveAccount();
  return useQuery({
    queryKey: ["support-tickets", address],
    queryFn: async () => {
      await ensureAuth();
      try {
        return await api.get<SupportTicket[]>("/api/support/tickets", { auth: true });
      } catch (err) {
        if (unavailable(err)) return [] as SupportTicket[];
        throw err;
      }
    },
    enabled: isConnected && !!address,
    staleTime: 30_000,
    retry: false,
  });
}

export function useSupportInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["support-tickets"] });
}
