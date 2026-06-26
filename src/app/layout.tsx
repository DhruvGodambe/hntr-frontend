import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import { Providers } from "@/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "HNTR",
  description: "HNTR — Your gateway to the NFT universe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={fontVariables}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
