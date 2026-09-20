import { pageMetadata } from "../../lib/metadata";
import "./presentation.css";

export const metadata = pageMetadata(
  "Business Presentation",
  "HNTR.art private NFT co-ownership — the full business presentation.",
);

export default function PresentationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
