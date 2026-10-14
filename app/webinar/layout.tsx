import { pageMetadata } from "../../lib/metadata";

export const metadata = pageMetadata(
  "Live Webinar",
  "Watch the HNTR business presentation — how NFT Strategies, membership and network rewards work."
);

export default function WebinarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
