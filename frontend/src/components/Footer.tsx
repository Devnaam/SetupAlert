"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface FooterProps {
  toggleTheme?: () => void;
}

export default function Footer({ toggleTheme: externalToggleTheme }: FooterProps) {
  const [localTheme, setLocalTheme] = useState("dark");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  
  const phrases = ["TRUST YOUR SETUP", "TRADE YOUR PLAN", "STAY DISCIPLINED"];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
        setIsFading(false);
      }, 600); // Wait for fade out to complete before changing text
    }, 4000); // Total cycle time
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Sync local state with document attribute on mount
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    setLocalTheme(currentTheme);
  }, []);

  const handleToggleTheme = () => {
    if (externalToggleTheme) {
      externalToggleTheme();
    } else {
      const newTheme = localTheme === "dark" ? "light" : "dark";
      setLocalTheme(newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    }
  };

  return (
    <div className="w-full flex flex-col">
      <footer className="bg-[var(--color-bg-deep)] border-t border-[var(--color-border)] pt-20 pb-10 px-6 relative z-30">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12 mb-16">
        
        {/* Brand Section */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-4 xl:col-span-5 lg:pr-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="font-heading font-bold text-[22px] text-[var(--color-text)] tracking-tight">SetupAlert</span>
          </div>
          <p className="text-[15px] text-[var(--color-text-muted)] mb-8 leading-relaxed max-w-sm">
            Never miss your setup again. We monitor the markets 24/7 so you don't have to. Real-time spoken alerts for the modern professional trader.
          </p>
          
          <div className="flex gap-4">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-all duration-300 focus-ring outline-none shadow-sm" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-text)] transition-all duration-300 focus-ring outline-none shadow-sm" aria-label="GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[#5865F2] hover:border-[#5865F2] transition-all duration-300 focus-ring outline-none shadow-sm" aria-label="Discord">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6h0a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2h0a15 15 0 0 0-2 12 2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 15 15 0 0 0-2-12zm-8 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>
            </a>
          </div>
        </div>
        
        {/* Links Columns */}
        <div className="col-span-1 sm:col-span-1 lg:col-span-2">
          <h4 className="font-heading font-bold text-[15px] text-[var(--color-text)] mb-6 uppercase tracking-wider">Product</h4>
          <ul className="space-y-4">
            <li><Link href="/#features" className="text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors focus-ring outline-none rounded-sm">Features</Link></li>
            <li><Link href="/#pricing" className="text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors focus-ring outline-none rounded-sm">Pricing</Link></li>
            <li><Link href="/changelog" className="text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors focus-ring outline-none rounded-sm">Changelog</Link></li>
            <li><Link href="/dashboard" className="text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors focus-ring outline-none rounded-sm flex items-center gap-2">Dashboard <span className="text-[10px] bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-1.5 py-0.5 rounded font-bold">PRO</span></Link></li>
          </ul>
        </div>
        
        <div className="col-span-1 sm:col-span-1 lg:col-span-2">
          <h4 className="font-heading font-bold text-[15px] text-[var(--color-text)] mb-6 uppercase tracking-wider">Resources</h4>
          <ul className="space-y-4">
            <li><a href="#" className="text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors focus-ring outline-none rounded-sm">Help Center</a></li>
            <li><a href="#" className="text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors focus-ring outline-none rounded-sm">Documentation</a></li>
            <li><a href="#" className="text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors focus-ring outline-none rounded-sm">Blog</a></li>
            <li><a href="#" className="text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors focus-ring outline-none rounded-sm">System Status</a></li>
          </ul>
        </div>
        
        <div className="col-span-1 sm:col-span-2 lg:col-span-4 xl:col-span-3">
          <h4 className="font-heading font-bold text-[15px] text-[var(--color-text)] mb-6 uppercase tracking-wider">Stay Updated</h4>
          <p className="text-[14px] text-[var(--color-text-muted)] mb-4">
            Get the latest trading setups and platform updates straight to your inbox.
          </p>
          <form 
            className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2 w-full" 
            onSubmit={(e) => {
              e.preventDefault();
              setIsSubscribed(true);
            }}
          >
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-2.5 rounded-md text-[14px] focus-ring outline-none flex-grow placeholder:text-[var(--color-text-faint)]"
              required
              disabled={isSubscribed}
            />
            <button 
              type="submit" 
              disabled={isSubscribed}
              className={`px-5 py-2.5 rounded-md font-medium text-[14px] transition-colors focus-ring outline-none whitespace-nowrap ${
                isSubscribed 
                  ? "bg-green-500/20 text-green-500 border border-green-500/50 cursor-default" 
                  : "bg-[var(--color-accent)] text-[var(--color-btn-text)] hover:opacity-90"
              }`}
            >
              {isSubscribed ? "Subscribed!" : "Subscribe"}
            </button>
          </form>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[13px] text-[var(--color-text-muted)]">
          <span>© {new Date().getFullYear()} SetupAlert. All rights reserved.</span>
          <span className="hidden md:inline text-[var(--color-border)]">|</span>
          <Link href="/privacy" className="hover:text-[var(--color-text)] transition-colors">Privacy Policy</Link>
          <span className="hidden md:inline text-[var(--color-border)]">|</span>
          <Link href="/terms" className="hover:text-[var(--color-text)] transition-colors">Terms of Service</Link>
        </div>

        <button 
          onClick={handleToggleTheme} 
          className="text-[13px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-2 transition-colors focus-ring outline-none rounded-md px-3 py-1.5 hover:bg-[var(--color-bg-card)] border border-transparent hover:border-[var(--color-border)]"
          title="Toggle Light/Dark Mode"
        >
          {localTheme === "dark" ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2" />
                <path d="M12 21v2" />
                <path d="M4.22 4.22l1.42 1.42" />
                <path d="M18.36 18.36l1.42 1.42" />
                <path d="M1 12h2" />
                <path d="M21 12h2" />
                <path d="M4.22 19.78l1.42-1.42" />
                <path d="M18.36 5.64l1.42-1.42" />
              </svg>
              Light Mode
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
              Dark Mode
            </>
          )}
        </button>
      </div>
      </footer>

      {/* Giant Brand Footer Slab */}
      <section className="w-full bg-[var(--color-bg-deep)] pt-16 pb-0 flex justify-center items-end overflow-hidden z-20">
        
        <svg className="w-full h-auto max-h-[25vh] block select-none pointer-events-none" viewBox="0 0 1400 160" preserveAspectRatio="xMidYMax meet">
          <defs>
            <linearGradient id="textFadeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-text)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--color-text)" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="lightSweep" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-text)" stopOpacity="0" />
              <stop offset="40%" stopColor="var(--color-text)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--color-text)" stopOpacity="0.35" />
              <stop offset="60%" stopColor="var(--color-text)" stopOpacity="0" />
              <stop offset="100%" stopColor="var(--color-text)" stopOpacity="0" />
              <animateTransform 
                attributeName="gradientTransform" 
                type="translate" 
                values="-1 0; 1 0" 
                dur="4s" 
                repeatCount="indefinite" 
              />
            </linearGradient>
          </defs>

          {/* Base Watermark Text */}
          <text 
            x="50%" 
            y="150" 
            textAnchor="middle" 
            className="font-heading font-black uppercase tracking-tighter"
            fill="url(#textFadeGradient)"
            fontSize="170"
            fontWeight="900"
            style={{ 
              opacity: isFading ? 0 : 1, 
              transition: "opacity 0.6s ease-in-out" 
            }}
          >
            {phrases[phraseIndex]}
          </text>

          {/* Light Sweep Text Layer */}
          <text 
            x="50%" 
            y="150" 
            textAnchor="middle" 
            className="font-heading font-black uppercase tracking-tighter"
            fill="url(#lightSweep)"
            fontSize="170"
            fontWeight="900"
            style={{ 
              opacity: isFading ? 0 : 1, 
              transition: "opacity 0.6s ease-in-out" 
            }}
          >
            {phrases[phraseIndex]}
          </text>
        </svg>
      </section>
    </div>
  );
}
