import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TickerTape from "@/components/TickerTape";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "CryptoSite  Institutional Crypto Investing",
  description: "Trade 200+ digital assets, monitor risk, and earn yield with an institutional-grade platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <TickerTape />
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}