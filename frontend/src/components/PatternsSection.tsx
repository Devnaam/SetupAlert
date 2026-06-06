"use client";

import React from "react";

function PatternCard({ name, desc, type, imgSrc }: { name: string, desc: string, type: string, imgSrc: string }) {
  return (
    <div className="pattern-card group flex-shrink-0 w-[320px] bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-accent-border)] hover:shadow-[0_8px_30px_rgba(0,173,181,0.12)] transition-all duration-500 rounded-2xl p-8 flex flex-col items-start gap-6 relative overflow-hidden">
      
      {/* Decorative Image in Top Right */}
      <div 
        className="absolute top-[-30px] right-[-30px] w-48 h-48 opacity-[0.05] dark:opacity-[0.15] group-hover:opacity-[0.12] dark:group-hover:opacity-[0.35] group-hover:scale-110 transition-all duration-700 ease-out pointer-events-none dark:mix-blend-screen" 
        style={{ 
          maskImage: "radial-gradient(circle at center, black 20%, transparent 60%)", 
          WebkitMaskImage: "radial-gradient(circle at center, black 20%, transparent 60%)" 
        }}
      >
        <img src="/candlestick_pattern_bg.png" alt="Candlestick" className="w-full h-full object-cover dark:invert-0 invert" />
      </div>

      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-glow)] to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"></div>

      <div data-speed="-6" className="w-16 h-16 rounded-xl border border-[var(--color-border)] bg-[#0A0D14] shadow-inner flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-500 overflow-hidden group-hover:border-[var(--color-accent-border)]">
        <img src={imgSrc} alt={name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
      </div>
      
      <div className="relative z-10 flex flex-col gap-2 w-full">
        <h4 data-speed="-10" className="font-heading font-bold text-[22px] text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors duration-300">{name}</h4>
        <p className="text-[14px] text-[var(--color-text-muted)] leading-relaxed">{desc}</p>
      </div>
      
      <div data-speed="-14" className="mt-auto w-full pt-4 relative z-10 border-t border-[var(--color-border)] border-opacity-50">
        <div className={`inline-flex items-center gap-2 text-[12px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider transition-colors ${type === 'Bullish' ? 'bg-[var(--color-accent-glow)] text-[var(--color-accent)]' : type === 'Bearish' ? 'bg-[var(--color-bg-deep)] text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]' : 'bg-[var(--color-bg-deep)] text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]'}`}>
          {type === 'Bullish' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>}
          {type === 'Bearish' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>}
          {type === 'Neutral' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>}
          {type}
        </div>
      </div>
    </div>
  );
}

export default function PatternsSection() {
  return (
    <section id="patterns" className="bg-[var(--color-bg-deep)] py-32 md:py-48 relative z-20 overflow-hidden">
      {/* Immersive background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--color-accent)] opacity-[0.08] dark:opacity-[0.03] blur-[120px] rounded-full pointer-events-none"></div>

      <div className="patterns-pinned-wrapper w-full relative z-10">
        <div className="max-w-7xl mx-auto px-6 mb-20 relative z-10 flex flex-col items-center">
          <span data-speed="-6" className="text-[var(--color-accent)] font-medium text-[12px] uppercase tracking-[0.2em] mb-4">Complete Arsenal</span>
          <h2 data-speed="-12" className="font-heading font-bold text-[40px] md:text-[56px] text-[var(--color-text)] text-center leading-[1.1] tracking-tight max-w-2xl">
            8 Patterns. <br/> Every Setup Covered.
          </h2>
        </div>
        
        {/* Scroll track (flex-nowrap horizontally) */}
        <div className="w-full overflow-hidden px-6 lg:px-0">
          <div className="patterns-track flex flex-row gap-8 w-max pl-[max(1.5rem,calc((100vw-80rem)/2))] pr-[max(1.5rem,calc((100vw-80rem)/2))] pb-12">
            <PatternCard 
              name="Hammer" 
              desc="Rejection from below at support. Excellent for catching bottoms." 
              type="Bullish" 
              imgSrc="/patterns/hammer.png"
            />
            <PatternCard 
              name="Inverted Hammer" 
              desc="Potential reversal after decline. Shows buying pressure emerging." 
              type="Bullish" 
              imgSrc="/patterns/inverted_hammer.png"
            />
            <PatternCard 
              name="Bullish Engulfing" 
              desc="Strong buying overwhelms sellers, completely engulfing the prior candle." 
              type="Bullish" 
              imgSrc="/patterns/bullish_engulfing.png"
            />
            <PatternCard 
              name="Bearish Engulfing" 
              desc="Strong selling overwhelms buyers, confirming resistance." 
              type="Bearish" 
              imgSrc="/patterns/bearish_engulfing.png"
            />
            <PatternCard 
              name="Doji" 
              desc="Extreme indecision at a key level. A powerful warning sign." 
              type="Neutral" 
              imgSrc="/patterns/doji.png"
            />
            <PatternCard 
              name="Shooting Star" 
              desc="Heavy rejection from above at a resistance zone." 
              type="Bearish" 
              imgSrc="/patterns/shooting_star.png"
            />
            <PatternCard 
              name="Morning Star" 
              desc="A robust 3-candle recovery sequence from a prolonged downtrend." 
              type="Bullish" 
              imgSrc="/patterns/morning_star.png"
            />
            <PatternCard 
              name="Evening Star" 
              desc="A definitive 3-candle reversal sequence ending an uptrend." 
              type="Bearish" 
              imgSrc="/patterns/evening_star.png"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
