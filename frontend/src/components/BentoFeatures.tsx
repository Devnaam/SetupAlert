import React from 'react';

export default function BentoFeatures() {
  return (
    <section className="bg-[var(--color-bg-deep)] py-24 md:py-32 relative z-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <h2 className="font-heading font-bold text-[36px] md:text-[48px] text-[var(--color-text)] text-center mb-16">Built for Every Trader's Style</h2>
        
        <div className="bento-grid-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Bento Card 1: Price Alert (Wide) */}
          <div className="bento-card col-span-1 md:col-span-2 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] p-8 flex flex-col justify-between group hover:border-[rgba(0,173,181,0.3)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden shadow-lg hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-glow)] to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="mb-12 relative z-10 w-full max-w-sm">
              {/* Mini UI Mockup */}
              <div className="bg-[var(--color-bg-deep)] rounded-lg border border-[var(--color-border)] p-5 shadow-lg">
                <div className="text-[11px] font-bold text-[var(--color-text-faint)] uppercase tracking-wider mb-3">Target Level</div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-[var(--color-accent-glow)] flex items-center justify-center text-[var(--color-accent)] shadow-[0_0_12px_var(--color-accent-glow)]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                  </div>
                  <div className="text-[28px] font-heading font-bold text-[var(--color-text)] tracking-tight">65,250<span className="text-[14px] text-[var(--color-text-faint)] ml-1">.00</span></div>
                </div>
              </div>
            </div>
            
            <div className="relative z-10">
              <h3 className="font-heading font-bold text-[24px] text-[var(--color-text)] mb-2 group-hover:text-[var(--color-accent)] transition-colors">Price Alert</h3>
              <p className="text-[var(--color-text-muted)] text-[15px] leading-relaxed max-w-md">Fire an alert the exact millisecond the market touches your level. No pattern required, just raw price action.</p>
            </div>
          </div>

          {/* Bento Card 2: Pattern Alert (Tall) */}
          <div className="bento-card col-span-1 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] p-8 flex flex-col justify-between group hover:border-[rgba(0,173,181,0.3)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden shadow-lg hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-accent-glow)] to-transparent opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"></div>

            <div className="mb-12 relative z-10">
              {/* Mini UI Mockup */}
              <div className="bg-[var(--color-bg-deep)] rounded-lg border border-[var(--color-border)] p-5 shadow-lg">
                <div className="text-[11px] font-bold text-[var(--color-text-faint)] uppercase tracking-wider mb-3">Candlestick Pattern</div>
                <div className="flex items-center justify-between bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-[var(--color-text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4v4m-3 0h6v6H9V8zm3 6v10"/></svg>
                    <span className="text-[14px] font-medium text-[var(--color-text)]">Hammer</span>
                  </div>
                  <svg className="w-4 h-4 text-[var(--color-text-faint)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </div>
            </div>
            
            <div className="relative z-10">
              <h3 className="font-heading font-bold text-[24px] text-[var(--color-text)] mb-2 group-hover:text-[var(--color-accent)] transition-colors">Pattern Alert</h3>
              <p className="text-[var(--color-text-muted)] text-[15px] leading-relaxed">Get notified only when your exact candlestick pattern officially closes on your timeframe.</p>
            </div>
          </div>

          {/* Bento Card 3: Consecutive Pattern (Square) */}
          <div className="bento-card col-span-1 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] p-8 flex flex-col justify-between group hover:border-[rgba(0,173,181,0.3)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden shadow-lg hover:shadow-2xl">
            <div className="mb-12 relative z-10">
              {/* Mini UI Mockup */}
              <div className="bg-[var(--color-bg-deep)] rounded-lg border border-[var(--color-border)] p-5 shadow-lg flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-6 h-10 border-[1.5px] border-[#10B981] bg-[#10B981]/10 rounded-sm relative shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                    <div className="absolute top-[-6px] left-1/2 w-px h-3 bg-[#10B981] -translate-x-1/2"></div>
                    <div className="absolute bottom-[-14px] left-1/2 w-px h-7 bg-[#10B981] -translate-x-1/2"></div>
                  </div>
                  <div className="w-6 h-10 border-[1.5px] border-[#10B981] bg-[#10B981]/10 rounded-sm relative shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                    <div className="absolute top-[-8px] left-1/2 w-px h-4 bg-[#10B981] -translate-x-1/2"></div>
                    <div className="absolute bottom-[-10px] left-1/2 w-px h-5 bg-[#10B981] -translate-x-1/2"></div>
                  </div>
                </div>
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] px-3 py-1.5 rounded text-[13px] font-bold text-[var(--color-text)] shadow-md">
                  x2
                </div>
              </div>
            </div>
            
            <div className="relative z-10">
              <h3 className="font-heading font-bold text-[24px] text-[var(--color-text)] mb-2 group-hover:text-[var(--color-accent)] transition-colors">Consecutive</h3>
              <p className="text-[var(--color-text-muted)] text-[15px] leading-relaxed">Detect when the same pattern forms multiple times in a row for higher conviction.</p>
            </div>
          </div>

          {/* Bento Card 4: Level + Pattern (Wide Combo) */}
          <div className="bento-card col-span-1 md:col-span-2 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] p-8 flex flex-col md:flex-row items-start md:items-end justify-between group hover:border-[rgba(0,173,181,0.3)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden shadow-lg hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tl from-[var(--color-accent-glow)] to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="mb-10 md:mb-0 relative z-10 order-2 md:order-1 max-w-sm">
              <h3 className="font-heading font-bold text-[24px] text-[var(--color-text)] mb-2 group-hover:text-[var(--color-accent)] transition-colors">Level + Pattern</h3>
              <p className="text-[var(--color-text-muted)] text-[15px] leading-relaxed">Your full strategy in one trigger. Alert fires only if the price level is touched AND the exact pattern is confirmed.</p>
            </div>

            <div className="relative z-10 order-1 md:order-2 w-full md:w-auto mb-10 md:mb-0 flex justify-start md:justify-end">
              {/* Mini UI Mockup */}
              <div className="flex items-center gap-3 bg-[var(--color-bg-deep)] p-4 rounded-xl border border-[var(--color-border)] shadow-lg">
                <div className="bg-[var(--color-bg-card)] rounded border border-[var(--color-border)] px-3 py-2 text-[14px] font-bold text-[var(--color-text)] shadow">
                  65,250
                </div>
                <div className="w-8 h-px bg-[var(--color-border)] relative">
                  <div className="absolute top-1/2 left-1/2 w-4 h-4 border border-[var(--color-border)] bg-[var(--color-bg-deep)] rotate-45 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center">
                    <span className="rotate-[-45deg] text-[10px] text-[var(--color-text-faint)] font-bold">+</span>
                  </div>
                </div>
                <div className="bg-[var(--color-bg-card)] rounded border border-[var(--color-border)] border-l-[2px] border-l-[var(--color-accent)] px-3 py-2 text-[14px] font-bold text-[var(--color-text)] shadow flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4v4m-3 0h6v6H9V8zm3 6v10"/></svg>
                  Hammer
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
