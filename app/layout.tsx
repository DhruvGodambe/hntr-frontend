import "./globals.css";
import ThemeTopLoader from "./components/ThemeTopLoader";
import HumanGate from "./components/HumanGate";
import Providers from "./providers";
import { rootMetadata } from "../lib/metadata";

export const metadata = rootMetadata;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: "100%", overflow: "hidden" }} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        style={{
          height: "100%", 
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          margin: 0,
          padding: 0
        }}
      >
        <ThemeTopLoader />
        <Providers>
          <HumanGate>{children}</HumanGate>
        </Providers>
      </body>
    </html>
  );
}
