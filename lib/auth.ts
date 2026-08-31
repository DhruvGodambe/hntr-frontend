"use client";

import { disconnect, getAccount, signMessage } from "wagmi/actions";
import { config } from "./wagmi";
import { ApiError, api, getStoredAuth, setStoredAuth, clearStoredAuth, type StoredAuth } from "./api";
import { isUserRejectedError } from "./errors";

function decodeJwtExpiryMs(token: string): number {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof json.exp === "number") return json.exp * 1000;
  } catch {
    // fall through to default below
  }
  return Date.now() + 60 * 60 * 1000; // fallback: assume 1h if we can't decode
}

let inFlightSignIn: Promise<StoredAuth> | null = null;
let signatureDeclined = false;
let signingOut = false;

/**
 * Ensures we hold a valid backend session bound to the currently connected wallet.
 *
 * Background callers (queries, polls) must omit `interactive` so they never open a
 * wallet prompt. User-initiated actions pass `{ interactive: true }` to run SIWE.
 * Rejecting that signature logs the user out once and does not re-prompt until
 * they explicitly try again.
 */
export async function ensureAuth(options?: { interactive?: boolean }): Promise<StoredAuth> {
  if (options?.interactive) {
    signatureDeclined = false;
  }

  const account = getAccount(config);
  if (!account.address) {
    throw new Error("Connect your wallet first.");
  }
  const address = account.address.toLowerCase();

  const existing = getStoredAuth();
  if (existing && existing.walletAddress.toLowerCase() === address) {
    return existing;
  }
  if (existing) clearStoredAuth();

  if (inFlightSignIn) return inFlightSignIn;

  if (signatureDeclined) {
    throw new ApiError(
      "You rejected the signature request.",
      401,
      "USER_REJECTED",
    );
  }

  if (!options?.interactive) {
    throw new ApiError("Not signed in. Connect your wallet first.", 401, "NOT_AUTHENTICATED");
  }

  inFlightSignIn = authenticate(address).finally(() => {
    inFlightSignIn = null;
  });
  return inFlightSignIn;
}

async function authenticate(address: string): Promise<StoredAuth> {
  const { nonce, message } = await api.get<{ nonce: string; message: string }>(
    `/api/auth/nonce?walletAddress=${address}`,
  );
  void nonce;

  let signature: `0x${string}`;
  try {
    signature = await signMessage(config, { message });
  } catch (error) {
    if (isUserRejectedError(error)) {
      signatureDeclined = true;
      await signOut();
    }
    throw error;
  }

  const result = await api.post<{ token: string; walletAddress: string }>("/api/auth/verify", {
    walletAddress: address,
    signature,
  });

  const auth: StoredAuth = {
    token: result.token,
    walletAddress: result.walletAddress,
    expiresAt: decodeJwtExpiryMs(result.token),
  };
  setStoredAuth(auth);
  signatureDeclined = false;
  return auth;
}

/** Clear the backend session and disconnect the connected wallet. */
export async function signOut() {
  if (signingOut) return;
  signingOut = true;
  clearStoredAuth();
  try {
    await disconnect(config);
  } catch {
    // Already disconnected or no connector available.
  } finally {
    signingOut = false;
  }
}
