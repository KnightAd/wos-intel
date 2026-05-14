import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Link from "next/link";
import { ShieldAlert, BarChart3, Users } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Whiteout Survival Intel",
  description: "Trustworthy intel and state reputation platform for Whiteout Survival",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-zinc-950 text-zinc-50 min-h-screen flex flex-col`}>
        <Providers>
          <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
                <ShieldAlert className="w-6 h-6 text-indigo-500" />
                <span>WOS<span className="text-indigo-400">Intel</span></span>
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
                <Link href="/" className="hover:text-white transition-colors flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> States
                </Link>
                <Link href="/leaderboard" className="hover:text-white transition-colors flex items-center gap-2">
                  <Users className="w-4 h-4" /> Leaderboard
                </Link>
              </nav>

            </div>
          </header>
          <main className="flex-1 flex flex-col">{children}</main>
          <footer className="border-t border-zinc-800 bg-zinc-950 py-8 text-center text-sm text-zinc-500">
            <p>Community-driven intel platform. Trustworthy intel, not drama.</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
