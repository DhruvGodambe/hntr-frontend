import { pageMetadata } from "../../lib/metadata";

export const metadata = pageMetadata(
  "Terms & Conditions",
  "HNTR Terms and Conditions governing use of hntr.art, memberships, strategy pools, and the affiliate program."
);

export default function TermsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
