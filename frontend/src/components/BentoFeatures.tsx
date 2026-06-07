import React from 'react';

export default function BentoFeatures() {
  return (
    <section className="bg-[var(--color-bg-deep)] py-24 md:py-32 relative z-20 overflow-hidden">
      {/* Immersive Animated Mesh Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] animate-[spin_60s_linear_infinite]" style={{ opacity: 'var(--ambient-opacity-mesh)', mixBlendMode: 'var(--ambient-blend)' as any, background: 'radial-gradient(circle at 30% 30%, var(--color-accent) 0%, transparent 40%), radial-gradient(circle at 70% 70%, #8b5cf6 0%, transparent 50%), radial-gradient(circle at 20% 80%, #3b82f6 0%, transparent 40%)', filter: 'blur(80px)' }}></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--color-bg-deep)_80%)]"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <span data-speed="-6" className="inline-block text-[var(--color-accent)] font-medium text-[12px] uppercase tracking-[0.2em] mb-4">Precision Engineered</span>
          <h2 data-speed="-12" className="font-heading font-bold text-[40px] md:text-[56px] text-[var(--color-text)] leading-[1.1] tracking-tight">Built for Every Trader's Style</h2>
        </div>
        
        <div className="bento-grid-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          
          {/* Card 1: Scalper (Small) */}
          <div className="bento-card col-span-1 md:col-span-1 lg:col-span-2 bg-[var(--color-bg-card)]/80 backdrop-blur-xl rounded-[2rem] border border-[var(--color-border)] shadow-[inset_0_1px_1px_var(--glass-inner-border)] p-8 flex flex-col justify-between group hover:border-[var(--color-accent-border)] hover:shadow-[0_20px_80px_-15px_var(--hover-shadow-accent)] transition-all duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-glow)] to-transparent opacity-0 group-hover:opacity-[0.15] transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="mb-10 relative z-10 w-full">
              {/* Mini UI: Stopwatch / Fast Execution */}
              <div className="bg-[var(--color-bg-deep)]/80 backdrop-blur-md rounded-xl border border-[var(--color-border)] shadow-[inset_0_1px_1px_var(--glass-inner-border)] p-4 group-hover:scale-105 transition-transform duration-500 origin-left">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                    <span className="text-[10px] text-[var(--color-text-faint)] font-bold tracking-wider uppercase">Live Feed</span>
                  </div>
                  <span className="text-[10px] text-[var(--color-accent)] font-mono">1m TF</span>
                </div>
                <div className="h-1.5 w-full bg-[var(--color-border)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--color-accent)] w-[85%] relative">
                    <div className="absolute inset-0 bg-white opacity-20 animate-[shimmer_1.5s_infinite]"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative z-10 mt-auto">
              <div className="inline-block px-2.5 py-1 mb-4 rounded border border-[var(--color-border)] bg-[var(--color-bg-deep)] text-[11px] font-bold text-[var(--color-text-muted)] tracking-wider uppercase">Millisecond Precision</div>
              <h3 className="font-heading font-bold text-[28px] text-[var(--color-text)] mb-3 group-hover:text-[var(--color-accent)] transition-colors duration-300">Scalper</h3>
              <p className="text-[var(--color-text-muted)] text-[15px] leading-relaxed">Catch lightning-fast moves. Get instant voice alerts the moment a key level is touched, so you can execute trades without staring at the 1-minute chart all day.</p>
            </div>
          </div>

          {/* Card 2: Day Trader (Large) */}
          <div className="bento-card col-span-1 md:col-span-1 lg:col-span-4 bg-[var(--color-bg-card)]/80 backdrop-blur-xl rounded-[2rem] border border-[var(--color-border)] shadow-[inset_0_1px_1px_var(--glass-inner-border)] p-8 flex flex-col md:flex-row justify-between items-start md:items-end group hover:border-[var(--color-accent-border)] hover:shadow-[0_20px_80px_-15px_var(--hover-shadow-accent)] transition-all duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-bl from-[var(--color-accent-glow)] to-transparent opacity-0 group-hover:opacity-[0.15] transition-opacity duration-500 pointer-events-none"></div>

            <div className="relative z-10 order-2 md:order-1 max-w-sm mt-10 md:mt-0">
              <div className="inline-block px-2.5 py-1 mb-4 rounded border border-[var(--color-border)] bg-[var(--color-bg-deep)] text-[11px] font-bold text-[var(--color-text-muted)] tracking-wider uppercase">Intraday Momentum</div>
              <h3 className="font-heading font-bold text-[28px] text-[var(--color-text)] mb-3 group-hover:text-[var(--color-accent)] transition-colors duration-300">Day Trader</h3>
              <p className="text-[var(--color-text-muted)] text-[15px] leading-relaxed">Wait for the perfect setup. Combine price levels with 5m/15m candlestick pattern confirmations to filter out the noise and only take high-probability intraday trades.</p>
            </div>

            <div className="relative z-10 order-1 md:order-2 w-full md:w-auto flex justify-start md:justify-end">
              {/* Mini UI: Chart Setup */}
              <div className="bg-[var(--color-bg-deep)]/80 backdrop-blur-md rounded-xl border border-[var(--color-border)] shadow-[inset_0_1px_1px_var(--glass-inner-border)] p-5 group-hover:-translate-y-2 transition-transform duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[var(--color-bg-deep)] px-3 py-1.5 rounded text-[12px] font-medium text-[var(--color-text)] border border-[var(--color-border)] shadow-inner">15m</div>
                  <div className="bg-[var(--color-accent-glow)] px-3 py-1.5 rounded text-[12px] font-bold text-[var(--color-accent)] border border-[var(--color-accent-border)] shadow-[0_0_10px_rgba(0,173,181,0.2)]">Bullish Engulfing</div>
                </div>
                <div className="flex gap-2 items-end h-16 w-48 border-b border-[var(--color-border)] pb-2 px-1 relative">
                  <div className="absolute top-4 left-0 right-0 border-t border-dashed border-[var(--color-text-muted)] opacity-30"></div>
                  {/* Candlesticks */}
                  <div className="w-3 h-8 bg-red-500/20 border border-red-500/50 rounded-sm mb-4 relative"><div className="w-px h-12 bg-red-500/50 absolute left-1/2 -top-2 -translate-x-1/2"></div></div>
                  <div className="w-3 h-6 bg-red-500/20 border border-red-500/50 rounded-sm mb-2 relative"><div className="w-px h-10 bg-red-500/50 absolute left-1/2 -top-2 -translate-x-1/2"></div></div>
                  <div className="w-3 h-12 bg-[#10B981]/20 border border-[#10B981]/50 rounded-sm relative shadow-[0_0_15px_rgba(16,185,129,0.3)]"><div className="w-px h-14 bg-[#10B981]/50 absolute left-1/2 -top-1 -translate-x-1/2"></div></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Swing Trader (Large) */}
          <div className="bento-card col-span-1 md:col-span-1 lg:col-span-4 bg-[var(--color-bg-card)]/80 backdrop-blur-xl rounded-[2rem] border border-[var(--color-border)] shadow-[inset_0_1px_1px_var(--glass-inner-border)] p-8 flex flex-col md:flex-row justify-between items-start md:items-end group hover:border-[var(--color-accent-border)] hover:shadow-[0_20px_80px_-15px_var(--hover-shadow-accent)] transition-all duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-accent-glow)] to-transparent opacity-0 group-hover:opacity-[0.15] transition-opacity duration-500 pointer-events-none"></div>

            <div className="relative z-10 order-2 md:order-1 max-w-sm mt-10 md:mt-0">
              <div className="inline-block px-2.5 py-1 mb-4 rounded border border-[var(--color-border)] bg-[var(--color-bg-deep)] text-[11px] font-bold text-[var(--color-text-muted)] tracking-wider uppercase">Multi-Day Trends</div>
              <h3 className="font-heading font-bold text-[28px] text-[var(--color-text)] mb-3 group-hover:text-[var(--color-accent)] transition-colors duration-300">Swing Trader</h3>
              <p className="text-[var(--color-text-muted)] text-[15px] leading-relaxed">Let the market come to you. Set alerts for key daily supply/demand zones and get notified when a reversal pattern forms, allowing you to catch major multi-day swings effortlessly.</p>
            </div>

            <div className="relative z-10 order-1 md:order-2 w-full md:w-auto flex justify-start md:justify-end">
              {/* Mini UI: Supply Zone */}
              <div className="bg-[var(--color-bg-deep)]/80 backdrop-blur-md rounded-xl border border-[var(--color-border)] shadow-[inset_0_1px_1px_var(--glass-inner-border)] p-5 group-hover:scale-105 transition-transform duration-500 origin-right relative overflow-hidden w-full max-w-[200px]">
                <div className="text-[10px] text-[var(--color-text-faint)] font-bold tracking-wider uppercase mb-4 flex justify-between"><span>Daily (D1)</span><span>Zone Alert</span></div>
                <div className="relative h-20 w-full">
                  {/* Demand Zone Rectangle */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-[var(--color-accent-glow)] border-t border-[var(--color-accent)] opacity-40"></div>
                  {/* Sine wave or line trend */}
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50">
                    <path d="M 0 10 Q 25 40 50 25 T 100 45" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeDasharray="4 4" />
                    <circle cx="85" cy="40" r="4" fill="var(--color-accent)" className="animate-pulse shadow-[0_0_10px_var(--color-accent)]" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Positional Trader (Small) */}
          <div className="bento-card col-span-1 md:col-span-1 lg:col-span-2 bg-[var(--color-bg-card)]/80 backdrop-blur-xl rounded-[2rem] border border-[var(--color-border)] shadow-[inset_0_1px_1px_var(--glass-inner-border)] p-8 flex flex-col justify-between group hover:border-[var(--color-accent-border)] hover:shadow-[0_20px_80px_-15px_var(--hover-shadow-accent)] transition-all duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tl from-[var(--color-accent-glow)] to-transparent opacity-0 group-hover:opacity-[0.15] transition-opacity duration-500 pointer-events-none"></div>

            <div className="mb-10 relative z-10 w-full">
              {/* Mini UI: Macro Structure */}
              <div className="bg-[var(--color-bg-deep)]/80 backdrop-blur-md rounded-xl border border-[var(--color-border)] shadow-[inset_0_1px_1px_var(--glass-inner-border)] p-4 group-hover:-translate-y-2 transition-transform duration-500">
                <div className="flex gap-2 justify-center mb-4">
                  <div className="w-8 h-8 rounded bg-[var(--color-bg-deep)] border border-[var(--color-border)] flex items-center justify-center text-[12px] font-bold text-[var(--color-text-faint)]">1D</div>
                  <div className="w-8 h-8 rounded bg-[var(--color-accent-glow)] border border-[var(--color-accent)] flex items-center justify-center text-[12px] font-bold text-[var(--color-accent)] shadow-[0_0_10px_rgba(0,173,181,0.2)]">1W</div>
                  <div className="w-8 h-8 rounded bg-[var(--color-bg-deep)] border border-[var(--color-border)] flex items-center justify-center text-[12px] font-bold text-[var(--color-text-faint)]">1M</div>
                </div>
                <div className="text-center">
                  <div className="text-[20px] font-heading font-bold text-[var(--color-text)]">Macro View</div>
                  <div className="text-[11px] text-[var(--color-text-muted)] mt-1">Noise Cancelled</div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-auto">
              <div className="inline-block px-2.5 py-1 mb-4 rounded border border-[var(--color-border)] bg-[var(--color-bg-deep)] text-[11px] font-bold text-[var(--color-text-muted)] tracking-wider uppercase">Macro Structure</div>
              <h3 className="font-heading font-bold text-[28px] text-[var(--color-text)] mb-3 group-hover:text-[var(--color-accent)] transition-colors duration-300">Positional</h3>
              <p className="text-[var(--color-text-muted)] text-[15px] leading-relaxed">Trade the bigger picture. Track weekly and monthly pattern closures at structural support levels without the stress of daily price fluctuations.</p>
            </div>
          </div>

          {/* Card 5: Investor (Full Width Bottom) */}
          <div className="bento-card col-span-1 md:col-span-2 lg:col-span-6 bg-[var(--color-bg-card)]/80 backdrop-blur-xl rounded-[2rem] border border-[var(--color-border)] shadow-[inset_0_1px_1px_var(--glass-inner-border)] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between group hover:border-[var(--color-accent-border)] hover:shadow-[0_20px_80px_-15px_var(--hover-shadow-accent)] transition-all duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-accent-glow)_0%,_transparent_70%)] opacity-0 group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none"></div>
            
            <div className="relative z-10 md:w-1/2 pr-0 md:pr-12 text-center md:text-left mb-10 md:mb-0">
              <div className="inline-block px-3 py-1.5 mb-5 rounded border border-[var(--color-border)] bg-[var(--color-bg-deep)] text-[12px] font-bold text-[var(--color-text-muted)] tracking-wider uppercase">Long-Term Accumulation</div>
              <h3 className="font-heading font-bold text-[36px] md:text-[44px] text-[var(--color-text)] mb-4 group-hover:text-[var(--color-accent)] transition-colors duration-300">Investor</h3>
              <p className="text-[var(--color-text-muted)] text-[16px] md:text-[18px] leading-relaxed max-w-xl mx-auto md:mx-0">
                Automate your accumulation strategy. Set permanent, set-and-forget price alerts for generational buying opportunities and let the platform notify you when your target asset finally reaches your intrinsic value levels.
              </p>
            </div>

            <div className="relative z-10 md:w-1/2 w-full flex justify-center md:justify-end">
              {/* Mini UI: Infinite Timeline */}
              <div className="bg-[var(--color-bg-deep)]/80 backdrop-blur-md rounded-2xl border border-[var(--color-border)] shadow-[inset_0_1px_1px_var(--glass-inner-border)] p-6 md:p-8 w-full max-w-md group-hover:scale-105 transition-transform duration-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)] opacity-[0.05] blur-[40px] rounded-full"></div>
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[rgba(247,147,26,0.1)] flex items-center justify-center text-[#F7931A]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14.86,13.62c0.75-0.5,1.22-1.35,1.22-2.31c0-1.63-1.33-2.96-2.96-2.96h-1.6V6.5h-1.5v1.85h-1.5V6.5H7.02v1.85h-1.5v1.5h1.5v4.3h-1.5v1.5h1.5v1.85h1.5v-1.85h1.5v1.85h1.5v-1.85h1.59c1.63,0,2.96-1.33,2.96-2.96C16.08,14.86,15.58,14.07,14.86,13.62z M10.02,9.85h3.1c0.81,0,1.46,0.66,1.46,1.46s-0.66,1.46-1.46,1.46h-3.1V9.85z M13.12,15.65h-3.1v-2.9h3.1c0.81,0,1.46,0.66,1.46,1.46S13.93,15.65,13.12,15.65z"/></svg>
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-[var(--color-text)] leading-none mb-1">Bitcoin</div>
                      <div className="text-[11px] text-[var(--color-text-faint)] font-medium">Generational Bottom</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[16px] font-heading font-bold text-[var(--color-text)] leading-none mb-1">$45,000</div>
                    <div className="text-[11px] text-[var(--color-accent)] font-bold">Alert Active</div>
                  </div>
                </div>
                
                <div className="w-full bg-[var(--color-bg-deep)] h-2 rounded-full overflow-hidden border border-[var(--color-border)] relative z-10">
                  <div className="h-full w-2/3 bg-gradient-to-r from-[rgba(0,173,181,0.2)] to-[var(--color-accent)] rounded-full relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--color-text)] shadow-[0_0_8px_var(--color-text)]"></div>
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-[var(--color-text-faint)] font-bold relative z-10">
                  <span>Current: $65K</span>
                  <span>Target: $45K</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
