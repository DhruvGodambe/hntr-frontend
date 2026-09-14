"use client";

import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";
import { SEPOLIA_RPC_URL, MAINNET_RPC_URL } from "./constants";

const rpcUrl = SEPOLIA_RPC_URL;
// Mainnet RPC — used for ENS name/avatar resolution, and for reads/writes on
// the mainnet HNTRMembership contract (see MAINNET_CONTRACT_ADDRESS in lib/constants.ts).
const mainnetRpcUrl = MAINNET_RPC_URL;

// WalletConnect Cloud project id (free at https://cloud.reown.com). Only required for the
// WalletConnect connector (mobile wallet QR codes) - injected/browser wallets still work without it.
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

export const config = createConfig(
  getDefaultConfig({
    appName: "HNTR",
    appDescription: "HNTR Membership & Referral Network",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://hntr.app",
    appIcon: "/assets/images/logoMark.png",
    walletConnectProjectId,
    // Mainnet first (app chain). Sepolia kept in config for testing.
    chains: [mainnet, sepolia],
    transports: {
      [sepolia.id]: http(rpcUrl),
      [mainnet.id]: http(mainnetRpcUrl),
    },
    ssr: true,
  }),
);

// This is used to tell the app that the config is available globally in the app
declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
