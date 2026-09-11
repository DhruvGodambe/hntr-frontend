"use client";

import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
// Mainnet RPC — used for ENS name/avatar resolution today, and for
// reads/writes on the mainnet HNTRMembership contract once it's deployed
// and NEXT_PUBLIC_MAINNET_CONTRACT_ADDRESS (see lib/constants.ts) is set.
const mainnetRpcUrl =
  process.env.NEXT_PUBLIC_MAINNET_RPC_URL || "https://ethereum-rpc.publicnode.com";

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
    // Sepolia first (app chain). Mainnet included so ConnectKit/wagmi can resolve ENS.
    chains: [sepolia, mainnet],
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
