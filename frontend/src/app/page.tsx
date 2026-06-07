"use client";

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Script from "next/script";
import ScrollBoundTerminal from "../components/ScrollBoundTerminal";
import BentoFeatures from "../components/BentoFeatures";
import PatternsSection from "../components/PatternsSection";
import Footer from "@/components/Footer";
import VoiceDemoForm from "../components/VoiceDemoForm";
import PricingSection from "@/components/PricingSection";
import CTASection from "@/components/CTASection";

const CustomCSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Space+Grotesk:wght@500;700&display=swap');

:root {
  --color-bg-deep: #222831;
  --color-bg-card: #393E46;
  --color-accent: #00ADB5;
  --color-text: #EEEEEE;
  
  --color-text-muted: rgba(238,238,238,0.5);
  --color-text-faint: rgba(238,238,238,0.25);
  --color-border: rgba(238,238,238,0.08);
  --color-accent-glow: rgba(0,173,181,0.15);
  --color-accent-border: rgba(0,173,181,0.3);
  --color-btn-text: #222831;

  --color-nav-bg: rgba(34, 40, 49, 0.85);
  --shadow-premium: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  --hero-glow-1: rgba(0, 173, 181, 0.05);
  --hero-glow-2: rgba(0, 173, 181, 0.0);
  
  --ambient-blend: screen;
  --ambient-opacity-1: 0.03;
  --ambient-opacity-2: 0.02;
  --ambient-opacity-mesh: 0.03;
  --glass-inner-border: rgba(255,255,255,0.05);
  --hiw-grid-opacity: 0.3;
  --hover-shadow-accent: rgba(0, 173, 181, 0.25);
}

[data-theme="light"] {
  --color-bg-deep: #F8FAFC;
  --color-bg-card: #FFFFFF;
  --color-accent: #00ADB5;
  --color-text: #0F172A;
  
  --color-text-muted: #475569;
  --color-text-faint: #94A3B8;
  --color-border: rgba(15, 23, 42, 0.08);
  --color-accent-glow: rgba(0,173,181,0.15);
  --color-accent-border: rgba(0,173,181,0.3);
  --color-btn-text: #F8FAFC;

  --color-nav-bg: rgba(255, 255, 255, 0.75);
  --shadow-premium: 0 20px 40px -10px rgba(15, 23, 42, 0.1), 0 10px 20px -5px rgba(15, 23, 42, 0.05);
  --hero-glow-1: rgba(0, 173, 181, 0.12);
  --hero-glow-2: rgba(56, 189, 248, 0.1);

  --ambient-blend: multiply;
  --ambient-opacity-1: 0.08;
  --ambient-opacity-2: 0.05;
  --ambient-opacity-mesh: 0.08;
  --glass-inner-border: rgba(0,0,0,0.05);
  --hiw-grid-opacity: 0.04;
  --hover-shadow-accent: rgba(0, 173, 181, 0.15);
}

body {
  background-color: var(--color-bg-deep) !important;
  color: var(--color-text) !important;
  font-family: 'Inter', sans-serif !important;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  transition: background-color 0.3s ease, color 0.3s ease;
}

h1, h2, h3, h4, h5, h6, .font-heading {
  font-family: 'Space Grotesk', sans-serif !important;
}

.focus-ring:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.sound-bar {
  animation: soundBounce 0.5s infinite alternate ease-in-out;
  transform-origin: bottom;
}
.sound-bar:nth-child(1) { animation-delay: 0.0s; }
.sound-bar:nth-child(2) { animation-delay: 0.1s; }
.sound-bar:nth-child(3) { animation-delay: 0.2s; }
.sound-bar:nth-child(4) { animation-delay: 0.3s; }
.sound-bar:nth-child(5) { animation-delay: 0.4s; }

@keyframes soundBounce {
  0% { transform: scaleY(0.3); }
  100% { transform: scaleY(1); }
}

.price-line-flash {
  animation: flashLine 1s ease-out;
}
@keyframes flashLine {
  0% { border-color: var(--color-accent); box-shadow: 0 0 10px var(--color-accent-glow); }
  100% { border-color: var(--color-accent); box-shadow: none; }
}

.accordion-content {
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
  overflow: hidden;
}

* {
  text-shadow: none !important;
  background-clip: border-box !important;
  -webkit-background-clip: border-box !important;
  -webkit-text-fill-color: initial !important;
}

.pattern-card {
  transition: border-color 200ms ease;
}
.pattern-card:hover {
  border-color: var(--color-accent-border) !important;
}

.hiw-step, .hiw-visual {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes shimmer-sweep {
  0% { transform: translateX(-150%); }
  100% { transform: translateX(250%); }
}
.animate-shimmer {
  animation: shimmer-sweep 2.5s infinite linear;
}
`;

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

export default function LandingPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [stats, setStats] = useState({ alerts: 0, patterns: 0, timeframes: 0 });
  const statsRef = useRef<HTMLDivElement>(null);
  const [pricingMode, setPricingMode] = useState<"monthly" | "annual">("monthly");
  const [hasInteracted, setHasInteracted] = useState(false);

  // Mute toggle state
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const handleInteract = () => setHasInteracted(true);
    window.addEventListener("click", handleInteract, { once: true });
    window.addEventListener("scroll", handleInteract, { once: true });
    return () => {
      window.removeEventListener("click", handleInteract);
      window.removeEventListener("scroll", handleInteract);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    let cleanupGsap: any;
    const checkGsap = setInterval(() => {
      if (typeof window !== "undefined" && window.gsap && window.ScrollTrigger) {
        clearInterval(checkGsap);
        cleanupGsap = initGSAP();
      }
    }, 100);
    return () => {
      clearInterval(checkGsap);
      if (cleanupGsap) cleanupGsap();
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const initGSAP = () => {
    if (typeof window === "undefined" || !window.gsap || !window.ScrollTrigger) return;
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    // Disable if reduced motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    mm.add("(min-width: 320px)", () => {
      // General data-speed helper
      gsap.utils.toArray("[data-speed]").forEach((el: any) => {
        const speed = parseFloat(el.getAttribute("data-speed") || "0");
        if (speed === 0) return;
        gsap.to(el, {
          yPercent: speed,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          }
        });
      });

      // How It Works Pinned Storytelling
      const hiwContainer = document.querySelector(".hiw-pinned-container");
      if (hiwContainer) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: hiwContainer,
            start: "center center",
            end: "+=300%", // Longer scrub distance for luxurious feel
            pin: true,
            scrub: 1, // Smooth interpolation
            invalidateOnRefresh: true,
          }
        });
        
        // Initial state for all hidden elements
        gsap.set(".hiw-step-2", { opacity: 0, y: 40 });
        gsap.set(".hiw-step-3", { opacity: 0, y: 40 });
        gsap.set(".hiw-visual-2", { opacity: 0, scale: 0.9, y: 30 });
        gsap.set(".hiw-visual-3", { opacity: 0, scale: 0.9, y: 30 });
        gsap.set(".hiw-progress-bar", { height: "0%" });

        // Padding at start so Step 1 holds for a moment
        tl.to({}, { duration: 0.5 }); 

        // Step 1 -> 2
        tl.to(".hiw-step-1", { opacity: 0, y: -40, duration: 1 })
          .to(".hiw-visual-1", { opacity: 0, scale: 0.9, y: -30, duration: 1 }, "<")
          .to(".hiw-step-2", { opacity: 1, y: 0, duration: 1 }, "<0.2") // Staggered text entrance
          .to(".hiw-visual-2", { opacity: 1, scale: 1, y: 0, duration: 1 }, "<");
          
        // Step 2 hold
        tl.to({}, { duration: 0.8 }); 

        // Step 2 -> 3
        tl.to(".hiw-step-2", { opacity: 0, y: -40, duration: 1 })
          .to(".hiw-visual-2", { opacity: 0, scale: 0.9, y: -30, duration: 1 }, "<")
          .to(".hiw-step-3", { opacity: 1, y: 0, duration: 1 }, "<0.2")
          .to(".hiw-visual-3", { opacity: 1, scale: 1, y: 0, duration: 1 }, "<");
          
        // Step 3 hold
        tl.to({}, { duration: 0.8 }); 

        // Progress bar spans the entire timeline
        tl.to(".hiw-progress-bar", { height: "100%", ease: "none", duration: 4.1 }, 0);
      }

      // Bento Grid Stagger Reveal
      const bentoGrid = document.querySelector(".bento-grid-container");
      if (bentoGrid) {
        gsap.fromTo(".bento-card",
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: bentoGrid,
              start: "top 75%",
            }
          }
        );
      }
      // Patterns section pinning (works on all sizes down to mobile)
      const patternsWrapper = document.querySelector(".patterns-pinned-wrapper");
      const patternsTrack = document.querySelector(".patterns-track");
      if (patternsWrapper && patternsTrack) {
        const getScrollAmount = () => {
          // Extra padding for smooth finish
          const padding = window.innerWidth >= 1024 ? 120 : 60;
          return -(patternsTrack.scrollWidth - window.innerWidth + padding);
        };

        const tween = gsap.to(patternsTrack, {
          x: getScrollAmount,
          ease: "none",
        });

        ScrollTrigger.create({
          trigger: patternsWrapper,
          start: () => window.innerWidth < 768 ? "top 100px" : "center center",
          // Multiply scroll distance by 1.8 to slow down horizontal scroll, matching industry standard for smooth parallax
          end: () => `+=${Math.abs(getScrollAmount()) * 1.8}`,
          pin: true,
          animation: tween,
          scrub: 1, // 1 second smoothing
          invalidateOnRefresh: true
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((t: any) => t.kill());
    };
  };

  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const interval = setInterval(() => {
            start += 1;
            setStats({
              alerts: Math.min(Math.floor((start / 20) * 12400), 12400),
              patterns: Math.min(Math.floor((start / 20) * 8), 8),
              timeframes: Math.min(Math.floor((start / 20) * 3), 3),
            });
            if (start >= 20) clearInterval(interval);
          }, 50);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CustomCSS }} />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js" strategy="lazyOnload" />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"
        strategy="lazyOnload"
      />

      {/* SECTION 1 — Navbar */}
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled ? "bg-[var(--color-nav-bg)] backdrop-blur-xl border-b border-[var(--color-border)]" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <span className="font-heading font-bold text-[20px] text-[var(--color-text)] tracking-tight">SetupAlert</span>
          </div>

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <a href="#how-it-works" className="text-[14px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors focus-ring outline-none rounded-sm">Features</a>
            <a href="#patterns" className="text-[14px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors focus-ring outline-none rounded-sm">Patterns</a>
            <a href="#pricing" className="text-[14px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors focus-ring outline-none rounded-sm">Pricing</a>
            
            {/* Resources Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-[14px] font-medium text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors focus-ring outline-none rounded-sm py-2">
                Resources
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:rotate-180"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              
              {/* Invisible hover bridge to prevent menu from closing when mouse moves down */}
              <div className="absolute top-[100%] left-0 w-full h-4"></div>

              <div className="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 w-[650px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div 
                  className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-3 grid grid-cols-2 gap-2 relative overflow-hidden"
                  style={{ boxShadow: 'var(--shadow-premium)' }}
                >
                  
                  {/* Item 1 */}
                  <div className="flex flex-col p-4 rounded-xl hover:bg-[var(--color-bg-deep)] transition-colors group/item cursor-default border border-transparent hover:border-[var(--color-border)]">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-[var(--color-text)] text-[15px]">Blog</span>
                      <div className="relative overflow-hidden bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border border-[var(--color-accent)]/20">
                        Upcoming
                        <div className="absolute top-0 bottom-0 left-0 w-[40px] bg-gradient-to-r from-transparent via-white to-transparent opacity-[0.25] animate-shimmer"></div>
                      </div>
                    </div>
                    <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed">Helping you become a better trader!</p>
                  </div>

                  {/* Item 2 */}
                  <div className="flex flex-col p-4 rounded-xl hover:bg-[var(--color-bg-deep)] transition-colors group/item cursor-default border border-transparent hover:border-[var(--color-border)]">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-[var(--color-text)] text-[15px]">Strategies</span>
                      <div className="relative overflow-hidden bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border border-[var(--color-accent)]/20">
                        Upcoming
                        <div className="absolute top-0 bottom-0 left-0 w-[40px] bg-gradient-to-r from-transparent via-white to-transparent opacity-[0.25] animate-shimmer" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                    <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed">Jumpstart profitability with ready-made strategies.</p>
                  </div>

                  {/* Item 3 */}
                  <div className="flex flex-col p-4 rounded-xl hover:bg-[var(--color-bg-deep)] transition-colors group/item cursor-default border border-transparent hover:border-[var(--color-border)]">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-[var(--color-text)] text-[15px]">Changelog</span>
                      <div className="relative overflow-hidden bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border border-[var(--color-accent)]/20">
                        Upcoming
                        <div className="absolute top-0 bottom-0 left-0 w-[40px] bg-gradient-to-r from-transparent via-white to-transparent opacity-[0.25] animate-shimmer" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                    <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed">Discover what's new in SetupAlert.</p>
                  </div>

                  {/* Item 4 */}
                  <div className="flex flex-col p-4 rounded-xl hover:bg-[var(--color-bg-deep)] transition-colors group/item cursor-default border border-transparent hover:border-[var(--color-border)]">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-[var(--color-text)] text-[15px]">Knowledge Base</span>
                      <div className="relative overflow-hidden bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border border-[var(--color-accent)]/20">
                        Upcoming
                        <div className="absolute top-0 bottom-0 left-0 w-[40px] bg-gradient-to-r from-transparent via-white to-transparent opacity-[0.25] animate-shimmer" style={{ animationDelay: '0.6s' }}></div>
                      </div>
                    </div>
                    <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed">Need help with something? Find answers here.</p>
                  </div>

                  {/* Item 5 */}
                  <div className="flex flex-col p-4 rounded-xl hover:bg-[var(--color-bg-deep)] transition-colors group/item cursor-default border border-transparent hover:border-[var(--color-border)]">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-[var(--color-text)] text-[15px]">Community</span>
                      <div className="relative overflow-hidden bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border border-[var(--color-accent)]/20">
                        Upcoming
                        <div className="absolute top-0 bottom-0 left-0 w-[40px] bg-gradient-to-r from-transparent via-white to-transparent opacity-[0.25] animate-shimmer" style={{ animationDelay: '0.8s' }}></div>
                      </div>
                    </div>
                    <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed">Connect, learn, and grow with like-minded traders.</p>
                  </div>

                  {/* Item 6 */}
                  <div className="flex flex-col p-4 rounded-xl hover:bg-[var(--color-bg-deep)] transition-colors group/item cursor-default border border-transparent hover:border-[var(--color-border)]">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-[var(--color-text)] text-[15px]">Free Trading Tools</span>
                      <div className="relative overflow-hidden bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border border-[var(--color-accent)]/20">
                        Upcoming
                        <div className="absolute top-0 bottom-0 left-0 w-[40px] bg-gradient-to-r from-transparent via-white to-transparent opacity-[0.25] animate-shimmer" style={{ animationDelay: '1.0s' }}></div>
                      </div>
                    </div>
                    <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed">Level up your trading math.</p>
                  </div>

                </div>
              </div>
            </div>

            <a href="#faq" className="text-[14px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors focus-ring outline-none rounded-sm">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button onClick={toggleTheme} className="text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors p-2 focus-ring outline-none rounded-full" aria-label="Toggle Theme">
              {theme === "dark" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
            <Link href="/login" className="text-[14px] font-medium text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors focus-ring outline-none rounded-sm">
              Login
            </Link>
            <Link href="/alerts" className="min-h-[44px] inline-flex items-center justify-center bg-[var(--color-accent)] text-[var(--color-btn-text)] px-5 py-2 rounded-md text-[14px] font-medium hover:opacity-90 transition-opacity focus-ring outline-none">
              Get Started
            </Link>
          </div>

          <button className="md:hidden text-[var(--color-text)] p-2 focus-ring outline-none rounded-md" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-[72px] left-0 w-full bg-[var(--color-bg-card)] border-b border-[var(--color-border)] p-6 flex flex-col gap-4 shadow-xl">
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-[16px] font-medium text-[var(--color-text)]">Features</a>
            <a href="#patterns" onClick={() => setMobileMenuOpen(false)} className="text-[16px] font-medium text-[var(--color-text)]">Patterns</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-[16px] font-medium text-[var(--color-text)]">Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-[16px] font-medium text-[var(--color-text)]">FAQ</a>
            <div className="h-px w-full bg-[var(--color-border)] my-2"></div>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-[16px] font-medium text-[var(--color-text)]">Login</Link>
            <Link href="/alerts" onClick={() => setMobileMenuOpen(false)} className="min-h-[44px] flex items-center justify-center bg-[var(--color-accent)] text-[var(--color-btn-text)] rounded-md text-[16px] font-medium mt-2">Get Started</Link>
          </div>
        )}
      </nav>

      {/* SECTION 2 — Hero */}
      <section className="relative w-full pt-[120px] pb-16 md:pt-[180px] md:pb-32 overflow-hidden min-h-screen flex items-center">
        {/* Ambient Light Mode Glows (Controlled by CSS Variables) */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none z-0" style={{ backgroundColor: 'var(--hero-glow-1)' }}></div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/4 translate-y-1/4 w-[600px] h-[600px] rounded-full blur-[100px] pointer-events-none z-0" style={{ backgroundColor: 'var(--hero-glow-2)' }}></div>

        {/* Dynamic hero background grid layer with cinematic radial fade mask */}
        <div 
          className="absolute inset-0 z-0 opacity-100" 
          data-speed="-5"
          style={{ 
            backgroundImage: "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)", 
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(circle at 50% 50%, black 20%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 20%, transparent 80%)"
          }}
        ></div>
        
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="flex-1 flex flex-col items-start gap-6">
            <div data-speed="-12" className="flex flex-col gap-4">
              <span className="text-[var(--color-accent)] font-medium text-[12px] uppercase tracking-[0.1em]">Real-time Setup Alerts - Spoken Notifications</span>
              <h1 className="font-heading font-bold text-[var(--color-text)] text-[clamp(2.5rem,5vw,5rem)] leading-[1.1] tracking-tight">
                Never Miss <br/> Your Setup <br/> Again.
              </h1>
            </div>
            <div data-speed="-18" className="flex flex-col items-start gap-6 w-full">
              <p className="text-[var(--color-text-muted)] text-[18px] max-w-lg leading-relaxed">
                SetupAlert watches the market for your exact setup — price level, candlestick pattern, timeframe — and speaks the alert the moment it forms.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link href="/alerts" className="min-h-[48px] inline-flex items-center justify-center bg-[var(--color-accent)] text-[var(--color-btn-text)] px-8 rounded-md text-[16px] font-medium hover:opacity-90 transition-opacity focus-ring outline-none">
                  Create Free Alert →
                </Link>
                <a href="#how-it-works" className="min-h-[48px] inline-flex items-center justify-center bg-transparent text-[var(--color-text)] border border-[var(--color-text)] border-opacity-20 hover:border-opacity-40 px-8 rounded-md text-[16px] font-medium transition-colors focus-ring outline-none">
                  See how it works
                </a>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full relative" data-speed="-8">
            <HeroDemoTerminal hasInteracted={hasInteracted} isGlobalMuted={isMuted} setIsGlobalMuted={setIsMuted} />
          </div>
        </div>
      </section>

      {/* SECTION 3 — Stats Bar */}
      <section ref={statsRef} className="w-full bg-[var(--color-bg-card)] py-12 border-y border-[var(--color-border)] relative z-20">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[var(--color-border)]">
          <div className="flex flex-col gap-2 pt-8 md:pt-0">
            <span className="font-heading font-bold text-[40px] text-[var(--color-text)]">{stats.alerts.toLocaleString()}+</span>
            <span className="text-[14px] text-[var(--color-text-muted)] font-medium">Alerts Created</span>
          </div>
          <div className="flex flex-col gap-2 pt-8 md:pt-0">
            <span className="font-heading font-bold text-[40px] text-[var(--color-text)]">{stats.patterns}</span>
            <span className="text-[14px] text-[var(--color-text-muted)] font-medium">Patterns Supported</span>
          </div>
          <div className="flex flex-col gap-2 pt-8 md:pt-0">
            <span className="font-heading font-bold text-[40px] text-[var(--color-text)]">{stats.timeframes}</span>
            <span className="text-[14px] text-[var(--color-text-muted)] font-medium">Timeframes</span>
          </div>
        </div>
      </section>

      {/* SECTION 3.5 — Full Width Scroll Parallax Terminal */}
      <ScrollBoundTerminal />

      {/* SECTION 4 — How It Works (Pinned Parallax) */}
      <section id="how-it-works" className="w-full bg-[var(--color-bg-deep)] relative z-20">
        {/* Immersive Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[var(--color-accent)] blur-[120px] rounded-full animate-pulse" style={{ opacity: 'var(--ambient-opacity-1)', mixBlendMode: 'var(--ambient-blend)' as any }}></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-500 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s', opacity: 'var(--ambient-opacity-2)', mixBlendMode: 'var(--ambient-blend)' as any }}></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--color-bg-deep)_100%)] opacity-90"></div>
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(var(--color-text-muted) 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 'var(--hiw-grid-opacity)' }}></div>
        </div>

        <div className="hiw-pinned-container w-full h-[100vh] flex items-center justify-center overflow-hidden relative z-10">
          <div className="max-w-7xl mx-auto px-6 w-full h-full flex flex-col pt-24 pb-12 relative">
            <h2 className="font-heading font-bold text-[36px] md:text-[48px] text-[var(--color-text)] text-center absolute top-24 left-0 w-full z-30">How It Works</h2>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-16 w-full h-full relative mt-16">
              
              {/* Left Text Block */}
              <div className="flex-1 w-full h-[200px] md:h-auto relative pl-8 border-l border-[var(--color-border)]">
                {/* Progress Track */}
                <div className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-transparent">
                   <div className="hiw-progress-bar w-full bg-[var(--color-accent)] rounded-full shadow-[0_0_10px_var(--color-accent)]" style={{ height: '0%' }}></div>
                </div>

                {/* Step 1 */}
                <div className="hiw-step hiw-step-1 px-4">
                  <div className="absolute left-[-42px] top-2 w-2 h-2 rounded-full bg-[var(--color-bg-deep)] border-2 border-[var(--color-accent)] z-10"></div>
                  <h3 className="font-heading font-bold text-[28px] text-[var(--color-text)] mb-4">Choose Your Setup</h3>
                  <p className="text-[var(--color-text-muted)] text-[16px] leading-relaxed">
                    Define the exact market conditions you want to trade. Select the symbol, set a specific price level of interest, choose your required candlestick pattern, and define the timeframe.
                  </p>
                </div>
                {/* Step 2 */}
                <div className="hiw-step hiw-step-2 px-4">
                  <div className="absolute left-[-42px] top-2 w-2 h-2 rounded-full bg-[var(--color-bg-deep)] border-2 border-[var(--color-accent)] z-10"></div>
                  <h3 className="font-heading font-bold text-[28px] text-[var(--color-text)] mb-4">We Watch 24/7</h3>
                  <p className="text-[var(--color-text-muted)] text-[16px] leading-relaxed">
                    Close your charts. SetupAlert connects directly to exchange websockets and evaluates every single tick and closed candle against your exact mathematical constraints.
                  </p>
                </div>
                {/* Step 3 */}
                <div className="hiw-step hiw-step-3 px-4">
                  <div className="absolute left-[-42px] top-2 w-2 h-2 rounded-full bg-[var(--color-bg-deep)] border-2 border-[var(--color-accent)] z-10"></div>
                  <h3 className="font-heading font-bold text-[28px] text-[var(--color-text)] mb-4">Hear It Instantly</h3>
                  <p className="text-[var(--color-text-muted)] text-[16px] leading-relaxed">
                    The millisecond your conditions are met, your browser delivers a clear, spoken voice notification. No more guessing what triggered an alert sound.
                  </p>
                </div>
              </div>

              {/* Right Visual Block */}
              <div className="flex-1 w-full h-[300px] md:h-[400px] relative">
                {/* Visual 1 */}
                <div className="hiw-visual hiw-visual-1">
                  <div className="w-full bg-[var(--color-bg-card)]/80 backdrop-blur-xl rounded-xl border border-[var(--color-border)] p-8 shadow-[0_20px_60px_-15px_var(--color-accent-glow),inset_0_1px_1px_var(--glass-inner-border)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-bg-deep)] opacity-80"></div>
                    <div className="absolute inset-0 bg-[var(--color-bg-deep)] opacity-20 -z-10" data-speed="-10"></div>
                    <div className="flex flex-col gap-4 relative z-10" data-speed="-20">
                      <div className="h-10 bg-[var(--color-bg-deep)] rounded border border-[var(--color-border)] flex items-center px-4 text-[14px] text-[var(--color-text)]"><span className="text-[var(--color-text-faint)] w-24">Symbol</span> <span className="font-bold tracking-wide">BTCUSDT</span></div>
                      <div className="h-10 bg-[var(--color-bg-deep)] rounded border border-[var(--color-border)] flex items-center px-4 text-[14px] text-[var(--color-text)]"><span className="text-[var(--color-text-faint)] w-24">Price Level</span> <span className="font-bold tracking-wide">65,250</span></div>
                      <div className="h-10 bg-[var(--color-bg-deep)] rounded border border-[var(--color-border)] flex items-center px-4 text-[14px] text-[var(--color-text)]"><span className="text-[var(--color-text-faint)] w-24">Pattern</span> <span className="font-bold tracking-wide">Hammer</span></div>
                      <div className="h-10 bg-[var(--color-bg-deep)] rounded border border-[var(--color-border)] flex items-center px-4 text-[14px] text-[var(--color-text)]"><span className="text-[var(--color-text-faint)] w-24">Timeframe</span> <span className="font-bold tracking-wide">15m</span></div>
                    </div>
                  </div>
                </div>

                {/* Visual 2 */}
                <div className="hiw-visual hiw-visual-2">
                  <div className="w-full h-auto bg-[var(--color-bg-card)]/80 backdrop-blur-xl rounded-xl border border-[var(--color-border)] p-6 shadow-[0_20px_60px_-15px_var(--color-accent-glow),inset_0_1px_1px_var(--glass-inner-border)] relative overflow-hidden group flex flex-col justify-center">
                    <div className="absolute inset-0 bg-[var(--color-bg-deep)] opacity-30 -z-10" style={{ backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3 mb-4 relative z-10 w-full">
                       <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                          <span className="text-[11px] text-[var(--color-text)] font-bold tracking-[0.2em] uppercase">Engine Active 24/7</span>
                       </div>
                       <span className="text-[11px] text-[var(--color-text-faint)] font-mono tracking-widest hidden sm:block">SCANNING YOUR SETUPS</span>
                    </div>

                    <div className="flex flex-col gap-3 relative z-10 w-full" data-speed="-15">
                       {/* Scanner Line that moves up and down */}
                       <div className="absolute top-0 left-0 right-0 h-[60px] bg-gradient-to-b from-transparent via-[var(--color-accent)] to-transparent opacity-10 animate-[scanVertical_3s_ease-in-out_infinite_alternate] pointer-events-none z-20"></div>
                       <div className="absolute top-0 left-0 right-0 h-[1px] bg-[var(--color-accent)] opacity-40 animate-[scanVerticalLine_3s_ease-in-out_infinite_alternate] pointer-events-none z-20 shadow-[0_0_15px_var(--color-accent)]"></div>

                       {/* Setup 1: Inside Bar Setup */}
                       <div className="w-full bg-[var(--color-bg-deep)]/70 backdrop-blur-md shadow-[inset_0_1px_1px_var(--glass-inner-border)] border border-[var(--color-border)] rounded-lg p-3 flex justify-between items-center relative overflow-hidden animate-[detect1_9s_infinite]">
                          <div className="flex items-center gap-3 relative z-10">
                            <div className="w-8 h-8 rounded bg-[var(--color-bg-card)] flex items-center justify-center font-bold text-[10px] text-[var(--color-text)] border border-[var(--color-border)]">BTC</div>
                            <div className="flex flex-col">
                              <span className="text-[13px] font-bold text-[var(--color-text)]">Inside Bar Setup</span>
                              <span className="text-[10px] text-[var(--color-text-faint)] font-mono">15m Timeframe</span>
                            </div>
                          </div>
                          <div className="relative z-10 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-faint)] animate-[statusDot1_9s_infinite]"></div>
                             <span className="text-[10px] font-bold tracking-wider status-text-1"></span>
                          </div>
                          <div className="absolute inset-0 bg-[var(--color-accent-glow)] animate-[bgPulse1_9s_infinite] z-0"></div>
                       </div>

                       {/* Setup 2: Breakout Trading */}
                       <div className="w-full bg-[var(--color-bg-deep)]/70 backdrop-blur-md shadow-[inset_0_1px_1px_var(--glass-inner-border)] border border-[var(--color-border)] rounded-lg p-3 flex justify-between items-center relative overflow-hidden animate-[detect2_9s_infinite]">
                          <div className="flex items-center gap-3 relative z-10">
                            <div className="w-8 h-8 rounded bg-[var(--color-bg-card)] flex items-center justify-center font-bold text-[10px] text-[var(--color-text)] border border-[var(--color-border)]">ETH</div>
                            <div className="flex flex-col">
                              <span className="text-[13px] font-bold text-[var(--color-text)]">Breakout Trading</span>
                              <span className="text-[10px] text-[var(--color-text-faint)] font-mono">1H Timeframe</span>
                            </div>
                          </div>
                          <div className="relative z-10 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-faint)] animate-[statusDot2_9s_infinite]"></div>
                             <span className="text-[10px] font-bold tracking-wider status-text-2"></span>
                          </div>
                          <div className="absolute inset-0 bg-[var(--color-accent-glow)] animate-[bgPulse2_9s_infinite] z-0"></div>
                       </div>

                       {/* Setup 3: Pin Bar Hammer */}
                       <div className="w-full bg-[var(--color-bg-deep)]/70 backdrop-blur-md shadow-[inset_0_1px_1px_var(--glass-inner-border)] border border-[var(--color-border)] rounded-lg p-3 flex justify-between items-center relative overflow-hidden animate-[detect3_9s_infinite]">
                          <div className="flex items-center gap-3 relative z-10">
                            <div className="w-8 h-8 rounded bg-[var(--color-bg-card)] flex items-center justify-center font-bold text-[10px] text-[var(--color-text)] border border-[var(--color-border)]">SOL</div>
                            <div className="flex flex-col">
                              <span className="text-[13px] font-bold text-[var(--color-text)]">Pin Bar Hammer</span>
                              <span className="text-[10px] text-[var(--color-text-faint)] font-mono">4H Timeframe</span>
                            </div>
                          </div>
                          <div className="relative z-10 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-faint)] animate-[statusDot3_9s_infinite]"></div>
                             <span className="text-[10px] font-bold tracking-wider status-text-3"></span>
                          </div>
                          <div className="absolute inset-0 bg-[var(--color-accent-glow)] animate-[bgPulse3_9s_infinite] z-0"></div>
                       </div>
                    </div>

                    <style dangerouslySetInnerHTML={{__html: `
                      @keyframes scanVertical {
                        0% { transform: translateY(-30px); }
                        100% { transform: translateY(220px); }
                      }
                      @keyframes scanVerticalLine {
                        0% { transform: translateY(0px); }
                        100% { transform: translateY(190px); }
                      }

                      /* Box 1 Animation */
                      @keyframes detect1 {
                        0%, 5%, 25%, 100% { border-color: var(--color-border); transform: scale(1); box-shadow: none; }
                        10%, 20% { border-color: var(--color-accent); transform: scale(1.02); box-shadow: 0 0 20px var(--color-accent-glow); z-index: 30; }
                      }
                      @keyframes bgPulse1 {
                        0%, 5%, 25%, 100% { opacity: 0; }
                        10%, 20% { opacity: 1; }
                      }
                      @keyframes statusDot1 {
                        0%, 5%, 25%, 100% { background-color: var(--color-text-faint); box-shadow: none; }
                        10%, 20% { background-color: var(--color-accent); box-shadow: 0 0 8px var(--color-accent); }
                      }
                      .status-text-1::after {
                        content: "MONITORING"; color: var(--color-text-faint); animation: statusText1 9s infinite;
                      }
                      @keyframes statusText1 {
                        0%, 5%, 25%, 100% { content: "MONITORING"; color: var(--color-text-faint); }
                        10%, 20% { content: "DETECTED!"; color: var(--color-accent); }
                      }

                      /* Box 2 Animation */
                      @keyframes detect2 {
                        0%, 40%, 60%, 100% { border-color: var(--color-border); transform: scale(1); box-shadow: none; }
                        45%, 55% { border-color: var(--color-accent); transform: scale(1.02); box-shadow: 0 0 20px var(--color-accent-glow); z-index: 30; }
                      }
                      @keyframes bgPulse2 {
                        0%, 40%, 60%, 100% { opacity: 0; }
                        45%, 55% { opacity: 1; }
                      }
                      @keyframes statusDot2 {
                        0%, 40%, 60%, 100% { background-color: var(--color-text-faint); box-shadow: none; }
                        45%, 55% { background-color: var(--color-accent); box-shadow: 0 0 8px var(--color-accent); }
                      }
                      .status-text-2::after {
                        content: "MONITORING"; color: var(--color-text-faint); animation: statusText2 9s infinite;
                      }
                      @keyframes statusText2 {
                        0%, 40%, 60%, 100% { content: "MONITORING"; color: var(--color-text-faint); }
                        45%, 55% { content: "DETECTED!"; color: var(--color-accent); }
                      }

                      /* Box 3 Animation */
                      @keyframes detect3 {
                        0%, 75%, 95%, 100% { border-color: var(--color-border); transform: scale(1); box-shadow: none; }
                        80%, 90% { border-color: var(--color-accent); transform: scale(1.02); box-shadow: 0 0 20px var(--color-accent-glow); z-index: 30; }
                      }
                      @keyframes bgPulse3 {
                        0%, 75%, 95%, 100% { opacity: 0; }
                        80%, 90% { opacity: 1; }
                      }
                      @keyframes statusDot3 {
                        0%, 75%, 95%, 100% { background-color: var(--color-text-faint); box-shadow: none; }
                        80%, 90% { background-color: var(--color-accent); box-shadow: 0 0 8px var(--color-accent); }
                      }
                      .status-text-3::after {
                        content: "MONITORING"; color: var(--color-text-faint); animation: statusText3 9s infinite;
                      }
                      @keyframes statusText3 {
                        0%, 75%, 95%, 100% { content: "MONITORING"; color: var(--color-text-faint); }
                        80%, 90% { content: "DETECTED!"; color: var(--color-accent); }
                      }
                    `}} />
                  </div>
                </div>

                {/* Visual 3 */}
                <div className="hiw-visual hiw-visual-3">
                  <div className="w-full flex flex-col items-center justify-center gap-6 relative">
                    <div className="absolute inset-0 bg-[var(--color-bg-deep)] opacity-20 -z-10" data-speed="-10"></div>
                    <div className="w-full bg-[var(--color-bg-card)]/80 backdrop-blur-xl rounded-xl border border-[var(--color-border)] border-l-[4px] border-l-[var(--color-accent)] p-8 shadow-[0_20px_60px_-15px_var(--color-accent-glow),inset_0_1px_1px_var(--glass-inner-border)] relative z-10" data-speed="-20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center text-[var(--color-accent)]">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                        </div>
                        <span className="text-[12px] font-bold text-[var(--color-text-faint)] tracking-widest uppercase">Browser Alert</span>
                      </div>
                      <p className="text-[15px] text-[var(--color-text)] font-medium leading-relaxed">
                        "BTCUSDT formed a Hammer candle on the 15-minute timeframe."
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 h-10 relative z-20" data-speed="-28">
                      <div className="w-1.5 h-full bg-[var(--color-accent)] rounded-full sound-bar opacity-80 shadow-[0_0_8px_var(--color-accent)]"></div>
                      <div className="w-1.5 h-full bg-[var(--color-accent)] rounded-full sound-bar opacity-80 shadow-[0_0_8px_var(--color-accent)]"></div>
                      <div className="w-1.5 h-full bg-[var(--color-accent)] rounded-full sound-bar opacity-80 shadow-[0_0_8px_var(--color-accent)]"></div>
                      <div className="w-1.5 h-full bg-[var(--color-accent)] rounded-full sound-bar opacity-80 shadow-[0_0_8px_var(--color-accent)]"></div>
                      <div className="w-1.5 h-full bg-[var(--color-accent)] rounded-full sound-bar opacity-80 shadow-[0_0_8px_var(--color-accent)]"></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — Alert Types */}
      <BentoFeatures />

      {/* SECTION 6 — Live Voice Demo */}
      <section className="bg-[var(--color-bg-card)] py-24 border-y border-[var(--color-border)] relative z-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          
          <VoiceDemoForm />

          <div className="mt-12">
            <Link href="/alerts" className="text-[var(--color-accent)] hover:underline font-medium focus-ring outline-none rounded-sm">
              Ready? → Create Free Alert
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 7 — Patterns */}
      <PatternsSection />

      {/* SECTION 8 — Pricing */}
      <PricingSection />

      {/* SECTION 9 — FAQ (No Parallax) */}
      <section id="faq" className="bg-[var(--color-bg-card)] py-24 md:py-32 border-y border-[var(--color-border)] relative z-30">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-heading font-bold text-[36px] md:text-[48px] text-[var(--color-text)] text-center mb-16">Questions Traders Ask</h2>
          
          <div className="flex flex-col border-t border-[var(--color-border)]">
            <FaqItem 
              question="What happens if I close the browser tab?" 
              answer="Your alerts are evaluated 24/7 on our backend servers regardless of whether your browser is open. However, because browser security policies require an active tab to play audio, you must keep the SetupAlert dashboard open in a tab to hear the spoken notifications. Triggers will still be logged to your history even if closed." 
            />
            <FaqItem 
              question="How fast does the alert trigger after a candle closes?" 
              answer="Near-instantaneously. Our backend streams real-time tick data directly via Binance WebSockets. The moment the exchange broadcasts the final 'close' tick for your selected timeframe, our engine evaluates the pattern mathematically and dispatches the alert to your browser via a secure WebSocket within milliseconds." 
            />
            <FaqItem 
              question="Does SetupAlert work for NSE or Indian stocks?" 
              answer="Currently, we exclusively support crypto markets via Binance. We are actively developing integrations for NSE and other traditional markets to be released in future updates." 
            />
            <FaqItem 
              question="Can I customize the spoken message?" 
              answer="Yes! By default, the system generates a clear message like 'BTC formed a Hammer on 15m'. In your dashboard, you can override this with any custom text you want, such as 'Buy setup confirmed on Bitcoin, check charts now'." 
            />
            <FaqItem 
              question="What is the difference between a Price Alert and a Level + Pattern Alert?" 
              answer="A Price Alert triggers the exact moment an asset crosses your defined price, regardless of candle shape. A Level + Pattern Alert requires the price level to be touched, AND the candle to officially close forming your specified pattern (like a Doji or Engulfing) on that exact level. It is a much higher-confidence setup." 
            />
            <FaqItem 
              question="How is this different from TradingView alerts?" 
              answer="TradingView relies heavily on generic beeps, popups, or webhooks that require manual setup or third-party integrations to be useful. SetupAlert is purpose-built for audio context. You don't have to scramble to find the right tab; our system speaks the exact context of the trigger out loud, keeping your eyes free." 
            />
            <FaqItem 
              question="Is my data private and secure?" 
              answer="Absolutely. We do not require you to connect any exchange API keys or trading accounts. We only store your email and alert configurations securely using enterprise-grade encryption." 
            />
            <FaqItem 
              question="Can I cancel my subscription anytime?" 
              answer="Yes, you can cancel your Pro subscription directly from your dashboard at any time. You will retain access to Pro features until the end of your current billing cycle, after which your account will revert to the Free tier." 
            />
          </div>
        </div>
      </section>

      {/* SECTION 10 — Final CTA */}
      <CTASection />

      {/* SECTION 11 — Footer */}
      <Footer toggleTheme={toggleTheme} />
    </>
  );
}

// --- Subcomponents ---

function HeroDemoTerminal({ hasInteracted, isGlobalMuted, setIsGlobalMuted }: { hasInteracted: boolean, isGlobalMuted: boolean, setIsGlobalMuted: (val: boolean) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const hasInteractedRef = useRef(hasInteracted);
  const isMutedRef = useRef(isGlobalMuted);

  useEffect(() => {
    hasInteractedRef.current = hasInteracted;
  }, [hasInteracted]);

  useEffect(() => {
    isMutedRef.current = isGlobalMuted;
  }, [isGlobalMuted]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let startTime: number | null = null;
    let hasPlayedOnce = false;
    let hasFiredAlertInLoop = false;
    const REPLAY_DURATION = 10000; 
    const HOLD_DURATION = 3000;

    const pseudoRandom = (i: number) => {
      const x = Math.sin(i * 9999) * 10000;
      return x - Math.floor(x);
    };

    const generateCandles = () => {
      const arr: any[] = [];
      const total = 75;
      for (let i = 0; i < total; i++) {
        const t = i / total;
        const basePrice = 320 - (120 * Math.pow(t, 1.2)); 
        const swing = Math.sin(t * Math.PI * 5) * 20;
        const price = basePrice + swing;
        
        const prevClose = i > 0 ? arr[i-1].close : price;
        const open = prevClose + (pseudoRandom(i) * 4 - 2);
        const close = price + (pseudoRandom(i+1) * 10 - 5);
        const high = Math.max(open, close) + pseudoRandom(i+2) * 8 + 2;
        const low = Math.min(open, close) - pseudoRandom(i+3) * 8 - 2;
        
        arr.push({ open, close, high, low });
      }
      
      const lastC = arr[arr.length - 1];
      arr.push({ open: lastC.close, close: 185, high: lastC.close + 2, low: 180 }); 
      arr.push({ open: 185, close: 172, high: 188, low: 168 }); 
      arr.push({ open: 172, close: 178, high: 180, low: 160 }); 
      arr.push({ open: 178, close: 205, high: 210, low: 175 }); 
      arr.push({ open: 205, close: 220, high: 225, low: 200 }); 
      
      return arr;
    };

    const candles = generateCandles();
    const totalCandles = candles.length;
    const triggerIndex = candles.length - 3; 

    const draw = (progress: number) => {
      if (!canvasRef.current) return;
      const w = canvasRef.current.clientWidth;
      const h = canvasRef.current.clientHeight;
      if (canvasRef.current.width !== w) canvasRef.current.width = w;
      if (canvasRef.current.height !== h) canvasRef.current.height = h;

      ctx.clearRect(0, 0, w, h);

      const replayProgress = progress;
      const rawCandle = replayProgress * totalCandles;
      const completedCandles = Math.floor(rawCandle);
      const partialProgress = rawCandle - completedCandles;

      const isHammerTime = completedCandles > triggerIndex; 
      
      if (isHammerTime && !hasFiredAlertInLoop) {
        hasFiredAlertInLoop = true;
        setNotificationOpen(true);
        if (hasInteractedRef.current && !isMutedRef.current) {
          const audio = new Audio("/bitcoin%20reached%2072400.mp3");
          setIsSpeaking(true);
          audio.onended = () => {
            setIsSpeaking(false);
            if (!hasPlayedOnce) {
              hasPlayedOnce = true;
              setIsGlobalMuted(true); 
            }
          };
          audio.play().catch(e => {
            console.error("Audio playback failed:", e);
            setIsSpeaking(false);
          });
        } else if (!hasPlayedOnce) {
           hasPlayedOnce = true;
           setIsGlobalMuted(true);
        }
      }

      const priceAxisW  = 60;
      const chartW      = w - priceAxisW;
      const spacing     = 14;
      const candleWidth = 8;

      ctx.fillStyle = "#131722";
      ctx.fillRect(0, 0, w, h);

      const lineY     = h * 0.75;
      const priceRange = 220;
      const pixelRange = h * 0.60;
      const priceScale = pixelRange / priceRange;
      const mapY = (price: number) => lineY - ((price - 160) * priceScale);

      const rightPadding      = chartW * 0.3;
      const totalVirtualWidth = totalCandles * spacing;
      const maxCameraX        = Math.max(0, totalVirtualWidth - chartW + rightPadding);
      const cameraX           = replayProgress * maxCameraX;

      const gridPrices = [160, 200, 240, 280, 320];
      gridPrices.forEach((price) => {
        const y = mapY(price);
        if (y < 28 || y > h - 22) return;
        ctx.beginPath();
        ctx.strokeStyle = "rgba(42,46,57,1)";
        ctx.lineWidth = 1;
        ctx.moveTo(0, y);
        ctx.lineTo(chartW, y);
        ctx.stroke();

        ctx.fillStyle = "#787B86";
        ctx.font = "10px Inter";
        ctx.textAlign = "left";
        ctx.fillText(price.toLocaleString(), chartW + 6, y + 4);
      });

      const timeLabels = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30"];
      for (let i = 0; i < totalCandles; i += 10) {
        const x = (i * spacing) - cameraX;
        if (x < 0 || x > chartW) continue;
        ctx.beginPath();
        ctx.strokeStyle = "rgba(42,46,57,1)";
        ctx.lineWidth = 1;
        ctx.moveTo(x, 28);
        ctx.lineTo(x, h - 22);
        ctx.stroke();
        ctx.fillStyle = "#787B86";
        ctx.font = "9px Inter";
        ctx.textAlign = "center";
        ctx.fillText(timeLabels[(i / 10) % timeLabels.length], x, h - 6);
      }
      ctx.textAlign = "left";

      ctx.beginPath();
      ctx.strokeStyle = "#2A2E39";
      ctx.lineWidth = 1;
      ctx.moveTo(chartW, 0);
      ctx.lineTo(chartW, h);
      ctx.stroke();

      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(0, lineY);
      ctx.lineTo(chartW, lineY);
      if (isHammerTime) {
        ctx.strokeStyle = "#F7C948";
        ctx.lineWidth = 1.5;
        ctx.shadowColor = "#F7C94840";
        ctx.shadowBlur = 6;
      } else {
        ctx.strokeStyle = "rgba(120,123,134,0.45)";
        ctx.lineWidth = 1;
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
      ctx.restore();

      const tagColor     = isHammerTime ? "#F7C948" : "#363A45";
      const tagTextColor = isHammerTime ? "#131722" : "#D9D9D9";
      const tagX         = chartW + 1;
      ctx.fillStyle = tagColor;
      ctx.beginPath();
      (ctx as any).roundRect(tagX, lineY - 10, priceAxisW - 2, 20, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(tagX,     lineY - 5);
      ctx.lineTo(tagX - 6, lineY);
      ctx.lineTo(tagX,     lineY + 5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = tagTextColor;
      ctx.font = "bold 10px Inter";
      ctx.textAlign = "center";
      ctx.fillText("72,400", tagX + (priceAxisW - 2) / 2, lineY + 3.5);
      ctx.textAlign = "left";

      const volZoneH = 30;
      const volY     = h - 22 - volZoneH;
      for (let i = 0; i <= completedCandles && i < totalCandles; i++) {
        const c = candles[i];
        const x = (i * spacing) - cameraX;
        if (x < -20 || x > chartW + 20) continue;
        const isBullish = c.close >= c.open;
        let volHeight = (pseudoRandom(i + 50) * 0.7 + 0.1) * volZoneH;
        if (i === completedCandles && i < totalCandles) {
          volHeight *= partialProgress;
        }
        ctx.fillStyle = isBullish ? "rgba(38,166,154,0.25)" : "rgba(239,83,80,0.25)";
        ctx.fillRect(x, volY + (volZoneH - volHeight), candleWidth, volHeight);
      }
      ctx.beginPath();
      ctx.strokeStyle = "#2A2E39";
      ctx.lineWidth = 1;
      ctx.moveTo(0, volY);
      ctx.lineTo(chartW, volY);
      ctx.stroke();

      const drawCandle = (i: number, alpha: number, phase1: number, phase2: number, phase3: number) => {
        const c  = candles[i];
        const x  = (i * spacing) - cameraX;
        if (x < -20 || x > chartW + 20) return;

        const isBullish  = c.close >= c.open;
        const color      = isBullish ? "#26A69A" : "#EF5350";
        const isTheHammer = (i === triggerIndex);
        const cx         = x + candleWidth / 2;

        ctx.globalAlpha = alpha;

        if (isHammerTime && isTheHammer) {
          ctx.shadowColor = "#F7C948";
          ctx.shadowBlur  = 12;
        } else {
          ctx.shadowBlur  = 0;
        }

        if (phase1 > 0) {
          const highY  = mapY(c.high);
          const bodyTopY = mapY(Math.max(c.open, c.close));
          const wickEndY = highY + (bodyTopY - highY) * Math.min(phase1 / 0.35, 1);
          ctx.strokeStyle = color;
          ctx.lineWidth   = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx, highY);
          ctx.lineTo(cx, wickEndY);
          ctx.stroke();
        }

        if (phase2 > 0) {
          const bodyPhase = Math.min((phase2 - 0.35) / 0.35, 1);
          const topY      = mapY(Math.max(c.open, c.close));
          const botY      = mapY(Math.min(c.open, c.close));
          const bodyFull  = Math.max(1.5, botY - topY);
          const bodyDraw  = bodyFull * bodyPhase;
          ctx.fillStyle   = color;
          ctx.fillRect(x, topY, candleWidth, bodyDraw);
        }

        if (phase3 > 0) {
          const wickPhase  = Math.min((phase3 - 0.7) / 0.3, 1);
          const bodyBotY   = mapY(Math.min(c.open, c.close));
          const lowY       = mapY(c.low);
          const wickEndY   = bodyBotY + (lowY - bodyBotY) * wickPhase;
          ctx.strokeStyle  = color;
          ctx.lineWidth    = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx, bodyBotY);
          ctx.lineTo(cx, wickEndY);
          ctx.stroke();
        }

        ctx.shadowBlur  = 0;
        ctx.globalAlpha = 1;
      };

      for (let i = 0; i < completedCandles; i++) {
        drawCandle(i, 1, 0.35, 0.70, 1.0);
      }

      if (completedCandles < totalCandles) {
        const p = partialProgress;
        drawCandle(
          completedCandles,
          0.55 + 0.45 * p,
          p,
          p >= 0.35 ? p : 0,
          p >= 0.70 ? p : 0
        );
      }
      
      if (completedCandles < totalCandles) {
        const formingX = (completedCandles * spacing) - cameraX + candleWidth + 4;
        if (formingX > 0 && formingX < chartW) {
          ctx.save();
          ctx.strokeStyle = "rgba(120,123,134,0.55)";
          ctx.lineWidth   = 1;
          ctx.beginPath();
          ctx.moveTo(formingX, 28);
          ctx.lineTo(formingX, h - 22);
          ctx.stroke();
          ctx.restore();
        }
      }
    };

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      
      if (elapsed < REPLAY_DURATION) {
        const progress = elapsed / REPLAY_DURATION;
        draw(progress);
        animationFrameId = requestAnimationFrame(animate);
      } else if (elapsed < REPLAY_DURATION + HOLD_DURATION) {
        draw(1);
        animationFrameId = requestAnimationFrame(animate);
      } else {
        startTime = time;
        hasFiredAlertInLoop = false;
        setNotificationOpen(false);
        setIsSpeaking(false);
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-2xl relative aspect-[4/3] md:aspect-video lg:aspect-[4/3]">
      <div className="h-12 border-b border-[var(--color-border)] flex items-center justify-between px-4">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[var(--color-text-faint)]"></div>
          <div className="w-3 h-3 rounded-full bg-[var(--color-text-faint)]"></div>
          <div className="w-3 h-3 rounded-full bg-[var(--color-text-faint)]"></div>
        </div>
        <div className="font-heading text-[14px] font-bold text-[var(--color-text)]">BTCUSDT — 15m</div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsGlobalMuted(!isGlobalMuted)} 
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] focus-ring outline-none"
            aria-label={isGlobalMuted ? "Unmute" : "Mute"}
          >
            {isGlobalMuted ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            )}
          </button>
          <div className="text-[var(--color-accent)] text-[12px] font-bold tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse"></span> LIVE
          </div>
        </div>
      </div>
      
      <div className="relative w-full h-[calc(100%-48px)] bg-[var(--color-bg-deep)]">
        <canvas 
          data-speed="8"
          ref={canvasRef} 
          width={600} 
          height={400} 
          className="w-full h-full object-cover origin-top"
        />

        <div data-speed="11.5" className={`absolute top-6 right-6 w-72 bg-[var(--color-bg-card)] border border-[var(--color-border)] border-l-[3px] border-l-[var(--color-accent)] p-4 rounded shadow-xl transition-all duration-500 transform ${notificationOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[16px]">🔔</span>
            <span className="text-[12px] font-bold text-[var(--color-text-muted)] uppercase">SetupAlert</span>
          </div>
          <p className="text-[13px] text-[var(--color-text)] leading-relaxed">
            BTCUSDT hit 72,400 and formed a hammer candle on 15-minute timeframe.
          </p>

          {isSpeaking && (
            <div className="flex items-end gap-1 h-4 mt-3" data-speed="12.5">
              <div className="w-1 h-full bg-[var(--color-accent)] rounded-full sound-bar"></div>
              <div className="w-1 h-full bg-[var(--color-accent)] rounded-full sound-bar"></div>
              <div className="w-1 h-full bg-[var(--color-accent)] rounded-full sound-bar"></div>
              <div className="w-1 h-full bg-[var(--color-accent)] rounded-full sound-bar"></div>
              <div className="w-1 h-full bg-[var(--color-accent)] rounded-full sound-bar"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="border-b border-[var(--color-border)]">
      <button 
        className="w-full py-6 flex items-center justify-between text-left focus-ring outline-none rounded-sm"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-[16px] text-[var(--color-text)] pr-8">{question}</span>
        <span className={`text-[24px] text-[var(--color-text-muted)] transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      <div 
        ref={contentRef}
        className="accordion-content"
        style={{ 
          maxHeight: open ? `${contentRef.current?.scrollHeight || 200}px` : '0px',
          opacity: open ? 1 : 0
        }}
      >
        <p className="pb-6 text-[15px] text-[var(--color-text-muted)] leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}
