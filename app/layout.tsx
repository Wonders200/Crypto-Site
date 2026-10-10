import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TickerTape from "@/components/TickerTape";
import { Providers } from "./providers";
import { I18nProvider } from "@/lib/i18n";
import DemoBanner from "@/components/DemoBanner";

export const metadata: Metadata = {
  title: "ApexVault - Institutional Crypto Investing",
  description: "Trade 200+ digital assets, monitor risk, and earn yield with an institutional-grade platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <I18nProvider>
        <Providers>
          <TickerTape />
          <Header />
          <main className="min-h-[60vh]">
            <DemoBanner />
            {children}
          </main>
          <Footer />
        </Providers>
        </I18nProvider>
        <Script
          id="chatway"
          src="https://cdn.chatway.app/widget.js?id=KJwei64uf0IZ"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}