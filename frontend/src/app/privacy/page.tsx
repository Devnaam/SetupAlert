"use client";

import React from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
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
        <h1 className="font-heading font-bold text-4xl mb-8">Privacy Policy</h1>
        
        <div className="space-y-8 text-[var(--color-text-muted)] leading-relaxed">
          <section>
            <h2 className="font-heading font-bold text-2xl text-[var(--color-text)] mb-4">1. Introduction</h2>
            <p>
              Welcome to SetupAlert. We respect your privacy and are committed to protecting your personal data.
              This privacy policy will inform you as to how we look after your personal data when you visit our website
              and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl text-[var(--color-text)] mb-4">2. Data We Collect</h2>
            <p>
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data</strong> includes email address.</li>
              <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
              <li><strong>Usage Data</strong> includes information about how you use our website and services (such as your configured alerts).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl text-[var(--color-text)] mb-4">3. How We Use Your Data</h2>
            <p>
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
              <li>Where it is necessary for our legitimate interests and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation.</li>
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
