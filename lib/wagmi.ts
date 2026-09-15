"use client";

import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";
import { SEPOLIA_RPC_URL, MAINNET_RPC_URL, IS_MAINNET } from "./constants";

const sepoliaRpcUrl = SEPOLIA_RPC_URL;
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
    // Required app chain first (from NEXT_PUBLIC_NETWORK / NETWORK_SWITCHER).
    chains: IS_MAINNET ? [mainnet, sepolia] : [sepolia, mainnet],
    transports: {
      [sepolia.id]: http(sepoliaRpcUrl),
      [mainnet.id]: http(mainnetRpcUrl),
    },
    ssr: true,
  }),
);

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
