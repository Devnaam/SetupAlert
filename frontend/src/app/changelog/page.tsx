"use client";

import React from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] flex flex-col text-[var(--color-text)]">
      <nav className="w-full z-50 bg-[var(--color-bg-deep)] border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 focus-ring outline-none rounded-sm">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          <span className="font-heading font-bold text-[20px] tracking-tight">SetupAlert</span>
        </Link>
        <Link href="/" className="text-[14px] font-medium hover:text-[var(--color-accent)] transition-colors focus-ring outline-none rounded-sm">
          Back to Home
        </Link>
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-16">
        <h1 className="font-heading font-bold text-4xl mb-8">Changelog</h1>
        
        <div className="space-y-12">
          <section className="border-l-2 border-[var(--color-accent)] pl-6 py-2">
            <h2 className="font-heading font-bold text-2xl mb-2">v1.0.0 <span className="text-[var(--color-text-muted)] text-sm font-normal ml-2">June 2026</span></h2>
            <ul className="list-disc list-inside space-y-2 text-[var(--color-text-muted)]">
              <li>Initial release of SetupAlert</li>
              <li>Support for major candlestick patterns (Hammer, Doji, Bullish Engulfing, etc.)</li>
              <li>Real-time voice notifications via browser</li>
              <li>Integration with Binance WebSockets for live ticker data</li>
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
