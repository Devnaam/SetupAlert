"use client";

import React from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function TermsPage() {
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
        <h1 className="font-heading font-bold text-4xl mb-8">Terms of Service</h1>
        
        <div className="space-y-8 text-[var(--color-text-muted)] leading-relaxed">
          <section>
            <h2 className="font-heading font-bold text-2xl text-[var(--color-text)] mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing our website and using our services, you agree to be bound by these Terms of Service and to comply with all applicable laws and regulations.
              If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl text-[var(--color-text)] mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on SetupAlert's website for personal, non-commercial transitory viewing only.
              This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li>modify or copy the materials;</li>
              <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
              <li>attempt to decompile or reverse engineer any software contained on SetupAlert's website;</li>
              <li>remove any copyright or other proprietary notations from the materials; or</li>
              <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl text-[var(--color-text)] mb-4">3. Disclaimer</h2>
            <p>
              The materials on SetupAlert's website are provided on an 'as is' basis. SetupAlert makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
            <p className="mt-4">
              Furthermore, SetupAlert does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site. Trading cryptocurrency involves significant risk. Our alerts are for informational purposes only and do not constitute financial advice.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
