import Link from 'next/link';

export default function LandingPage() {
  return (
    <>
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 flex justify-between items-center w-full px-gutter h-16 max-w-7xl mx-auto bg-background border-b border-outline-variant flat no shadows">
        <div className="flex items-center gap-gutter">
          <Link href="/" className="font-headline-md text-headline-md font-bold text-primary">
            StrategyAlert.in
          </Link>
          <div className="hidden md:flex gap-4">
            <Link href="#features" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="#faq" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">
              FAQ
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:text-primary transition-colors p-1">
            <span className="material-symbols-outlined" data-icon="light_mode">light_mode</span>
          </button>
          <Link href="/login" className="hidden md:inline-flex font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors font-medium">
            Login
          </Link>
          <Link href="/signup" className="font-body-sm text-body-sm bg-primary text-on-primary px-4 py-2 rounded-lg font-medium hover:bg-primary-container hover:text-on-primary-container transition-colors">
            Sign Up
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-margin-mobile md:px-gutter">
        {/* Hero Section */}
        <section className="py-24 md:py-32 flex flex-col lg:flex-row items-center gap-16 relative">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-container/20 via-background to-background opacity-40"></div>
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <h1 className="font-headline-xl text-headline-xl text-on-surface">Never Miss Your Setup Again.</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto lg:mx-0 text-lg">Create strategy-based trading alerts using price levels, candlestick patterns, and timeframes. Get notified exactly when your setup forms.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="bg-primary text-on-primary px-8 py-3 rounded-lg font-body-md font-medium hover:bg-primary-container hover:text-on-primary-container transition-colors ambient-shadow">Create Free Alert</button>
              <button className="border border-outline text-on-surface px-8 py-3 rounded-lg font-body-md font-medium hover:bg-surface-container transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined" data-icon="play_circle">play_circle</span> Watch Demo
              </button>
            </div>
          </div>
          <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
            {/* Mockup Composite */}
            <div className="relative w-full aspect-square md:aspect-video lg:aspect-square bg-surface-container rounded-xl border border-outline-variant overflow-hidden ambient-shadow flex items-center justify-center">
              <img alt="Trading chart background" className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale" data-alt="A clean, minimalist high-tech trading interface displayed on a monitor." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCx1TZLIazV1Nd5WVSlAk7eL8w6Bc4ThK_024q0xJQNJZ7rs1lCMi6Jrl3NlJ644pJwelqfkor1LG69S97c2uQoXHlgOnbZFK7mzffai5XkHUwxdYwiUEBySISHVz-gCWiLdilM-pSrsbak8Hck4pwiet_lfB1yvbYAhGFDGtfZjQjv4rkJnvSjOksa4doFZZPQUc5Zg_2kqYdNmm-cd_NqyXzitLywqwsuLIzfAe8rof6-vh4l-64hSpQ7I26qiae28cidTzQXqg" />
              {/* Alert Card Mockup */}
              <div className="relative z-10 w-3/4 glass-panel p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4 border-b border-outline-variant pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">ACTIVE ALERT</span>
                  </div>
                  <span className="font-label-md text-label-md font-mono text-on-surface">BTC/USDT</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Condition</p>
                    <p className="font-body-md text-body-md font-medium text-on-surface">Price &gt; 71,250 &amp; Hammer (15m)</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Current Price</p>
                      <p className="font-label-md text-label-md font-mono text-on-surface">71,242.50</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Action</p>
                      <p className="font-body-sm text-body-sm text-primary font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm" data-icon="record_voice_over">record_voice_over</span> Spoken
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Notification Popup Mockup */}
              <div className="absolute bottom-4 right-4 z-20 bg-surface-container-high text-on-surface p-4 rounded-lg shadow-xl border border-outline-variant flex items-start gap-3 w-64 translate-y-2 opacity-90">
                <span className="material-symbols-outlined text-[#F59E0B]" data-icon="notifications_active" data-weight="fill">notifications_active</span>
                <div>
                  <p className="font-body-sm text-body-sm font-semibold mb-1">Alert Triggered</p>
                  <p className="font-body-sm text-[12px] text-on-surface-variant">BTCUSDT formed a Hammer at 71,250 on 15m.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-24 border-t border-outline-variant">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">The blind spot in trading alerts.</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Standard alerts only tell you price crossed a line. StrategyAlert tells you exactly what happened in the context of your trading plan.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Generic Alert */}
            <div className="bg-surface-container p-8 rounded-xl border border-outline-variant">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-error" data-icon="close">close</span>
                </div>
                <h3 className="font-body-md text-body-md font-semibold text-on-surface">Generic Price Alert</h3>
              </div>
              <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant mb-4">
                <p className="font-label-md text-label-md font-mono text-on-surface-variant mb-1">10:45 AM</p>
                <p className="font-body-sm text-body-sm text-on-surface">"BTC hit 71,250"</p>
              </div>
              <ul className="space-y-3 font-body-sm text-body-sm text-on-surface-variant">
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-error text-sm mt-0.5" data-icon="remove">remove</span> Is it a breakout or fakeout?</li>
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-error text-sm mt-0.5" data-icon="remove">remove</span> Requires you to immediately check charts</li>
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-error text-sm mt-0.5" data-icon="remove">remove</span> Easy to miss context in fast markets</li>
              </ul>
            </div>
            {/* Strategy Alert */}
            <div className="bg-surface-container-high p-8 rounded-xl border border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary-container" data-icon="check">check</span>
                </div>
                <h3 className="font-body-md text-body-md font-semibold text-primary">Context-Aware Spoken Alert</h3>
              </div>
              <div className="bg-surface-container p-4 rounded-lg border border-outline-variant mb-4 shadow-sm relative z-10">
                <p className="font-label-md text-label-md font-mono text-on-surface-variant mb-1 flex items-center justify-between">
                  10:45 AM
                  <span className="material-symbols-outlined text-primary text-sm animate-pulse" data-icon="volume_up">volume_up</span>
                </p>
                <p className="font-body-sm text-body-sm font-medium text-on-surface">"BTC hit 71,250 and formed a Hammer candle on 15m timeframe."</p>
              </div>
              <ul className="space-y-3 font-body-sm text-body-sm text-on-surface-variant relative z-10">
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-[#10B981] text-sm mt-0.5" data-icon="done">done</span> Know the setup before looking</li>
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-[#10B981] text-sm mt-0.5" data-icon="done">done</span> Audio delivery keeps eyes on other charts</li>
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-[#10B981] text-sm mt-0.5" data-icon="done">done</span> Institutional-grade precision</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-xl px-gutter flex flex-col md:flex-row justify-between items-center bg-background border-t border-outline-variant flat no shadows">
        <div className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-4 md:mb-0">
          © {new Date().getFullYear()} StrategyAlert.in
        </div>
        <div className="flex gap-gutter">
          <Link href="/privacy" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface default link transitions">Privacy Policy</Link>
          <Link href="/terms" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface default link transitions">Terms of Service</Link>
          <Link href="/support" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface default link transitions">Contact Support</Link>
        </div>
      </footer>
    </>
  );
}
