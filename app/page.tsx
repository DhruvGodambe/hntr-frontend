import type { Metadata } from "next";
import LandingPage from "./components/landing/LandingPage";

export const metadata: Metadata = {
  title: { absolute: "HNTR — Stop watching, start owning." },
  description:
    "Co-own blue-chip NFTs with the HNTR community: buy as one, co-own every asset, and share the profit when it sells.",
};

export default function Page() {
  return <LandingPage />;
}
