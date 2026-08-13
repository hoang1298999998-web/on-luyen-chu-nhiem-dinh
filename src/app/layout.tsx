import type { Metadata } from "next";
import { Be_Vietnam_Pro, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MobileTabBar from "@/components/MobileTabBar";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ôn luyện thi BTCB 2026",
  description: "Ôn luyện và thi thử trắc nghiệm BTCB 2026",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${inter.variable}`}>
      <body>
        <Navbar />
        <main className="mx-auto min-h-[calc(100vh-64px)] max-w-6xl px-4 py-8 pb-24 md:pb-8">
          {children}
        </main>
        <footer className="hidden border-t border-slate-200 py-6 text-center text-xs text-slate-400 md:block">
          Ôn luyện thi BTCB 2026
        </footer>
        <MobileTabBar />
      </body>
    </html>
  );
}
