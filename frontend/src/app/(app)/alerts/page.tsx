"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
 ArrowLeft,
 Plus,
 Loader2,
 AlertCircle,
 CheckCircle2,
 Crown,
 TrendingUp,
 Clock,
 MessageSquare,
 Play,
 CandlestickChart,
 Target,
 Repeat,
 DollarSign,
 Layers,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const SYMBOLS = [
 { value: "BTCUSDT", label: "Bitcoin / USDT" },
 { value: "ETHUSDT", label: "Ethereum / USDT" },
 { value: "BNBUSDT", label: "BNB / USDT" },
 { value: "SOLUSDT", label: "Solana / USDT" },
 { value: "XRPUSDT", label: "XRP / USDT" },
 { value: "ADAUSDT", label: "Cardano / USDT" },
 { value: "DOGEUSDT", label: "Dogecoin / USDT" },
 { value: "AVAXUSDT", label: "Avalanche / USDT" },
 { value: "LINKUSDT", label: "Chainlink / USDT" },
 { value: "MATICUSDT", label: "Polygon / USDT" },
];

const TIMEFRAMES = {
  "Minutes": [
    { value: "1m", label: "1 minute" },
    { value: "3m", label: "3 minutes" },
    { value: "5m", label: "5 minutes" },
    { value: "15m", label: "15 minutes" },
    { value: "30m", label: "30 minutes" }
  ],
  "Hours": [
    { value: "1h", label: "1 hour" },
    { value: "2h", label: "2 hours" },
    { value: "4h", label: "4 hours" },
    { value: "6h", label: "6 hours" },
    { value: "8h", label: "8 hours" },
    { value: "12h", label: "12 hours" }
  ],
  "Days": [
    { value: "1d", label: "1 day" },
    { value: "3d", label: "3 days" },
    { value: "1w", label: "1 week" },
    { value: "1M", label: "1 month" }
  ]
};

const PATTERNS = [
 { value: "hammer", label: "Hammer" },
 { value: "inverted-hammer", label: "Inverted Hammer" },
 { value: "bullish-engulfing", label: "Bullish Engulfing" },
 { value: "bearish-engulfing", label: "Bearish Engulfing" },
 { value: "doji", label: "Doji" },
 { value: "shooting-star", label: "Shooting Star" },
 { value: "morning-star", label: "Morning Star" },
 { value: "evening-star", label: "Evening Star" },
];

const PATTERN_DISPLAY_NAMES: Record<string, string> = {
 hammer: "hammer",
 "inverted-hammer": "inverted hammer",
 "bullish-engulfing": "bullish engulfing",
 "bearish-engulfing": "bearish engulfing",
 doji: "doji",
 "shooting-star": "shooting star",
 "morning-star": "morning star",
 "evening-star": "evening star",
};

export type AlertMode = "price" | "pattern" | "repeated_pattern" | "level_pattern";

export default function CreateAlertPage() {
 const router = useRouter();
 const supabase = createClient();

 const [step, setStep] = useState<1 | 2>(1);
 const [mode, setMode] = useState<AlertMode | null>(null);

 const [symbol, setSymbol] = useState("BTCUSDT");
 const [priceLevel, setPriceLevel] = useState("");
 const [pattern, setPattern] = useState("hammer");
 const [timeframe, setTimeframe] = useState("15m");
 const [repetitionCount, setRepetitionCount] = useState(2);
 
 const [spokenMessage, setSpokenMessage] = useState("");
 const [useCustomMessage, setUseCustomMessage] = useState(false);
 const [playCount, setPlayCount] = useState(1);

 const [error, setError] = useState<string | null>(null);
 const [loading, setLoading] = useState(false);
 const [success, setSuccess] = useState(false);
 const [atLimit, setAtLimit] = useState(false);
 const [checkingLimit, setCheckingLimit] = useState(true);

 const generateSpokenMessage = useCallback(() => {
 if (!mode) return "";
 const patternName = PATTERN_DISPLAY_NAMES[pattern] || pattern;
 const formattedPrice = priceLevel ? Number(priceLevel).toLocaleString() : "[price]";

 switch (mode) {
 case "price":
 return `${symbol} touched ${formattedPrice}.`;
 case "pattern":
 return `${symbol} formed a ${patternName} candle on the ${timeframe} timeframe.`;
 case "repeated_pattern": {
 const numToWord: Record<number, string> = { 2: "two", 3: "three", 4: "four", 5: "five" };
 const word = numToWord[repetitionCount] || String(repetitionCount);
 return `${symbol} formed ${word} consecutive ${patternName} candles on the ${timeframe} timeframe.`;
 }
 case "level_pattern":
 return `${symbol} touched ${formattedPrice} and formed a ${patternName} candle on the ${timeframe} timeframe.`;
 default:
 return "";
 }
 }, [mode, symbol, priceLevel, pattern, timeframe, repetitionCount]);

 useEffect(() => {
 if (!useCustomMessage) {
 setSpokenMessage(generateSpokenMessage());
 }
 }, [generateSpokenMessage, useCustomMessage]);

 useEffect(() => {
 async function checkLimit() {
 try {
 const { data: { session } } = await supabase.auth.getSession();
 if (!session) return;
 const res = await fetch(`${API_URL}/api/billing/status`, {
 headers: { Authorization: `Bearer ${session.access_token}` },
 });
 if (res.ok) {
 const data = await res.json();
 setAtLimit(data.alerts_used >= data.alert_limit && data.plan !== "pro");
 }
 } catch (err) {
 console.error("Failed to check limits:", err);
 } finally {
 setCheckingLimit(false);
 }
 }
 checkLimit();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 function previewSpeak() {
 if ("speechSynthesis" in window) {
 window.speechSynthesis.cancel();
 const utterance = new SpeechSynthesisUtterance(spokenMessage);
 
 const voices = window.speechSynthesis.getVoices();
 const preferredVoices = [
 "Google US English",
 "Google UK English Female",
 "Microsoft Zira",
 "Samantha",
 ];
 
 for (const preferred of preferredVoices) {
 const found = voices.find(v => v.name.includes(preferred));
 if (found) {
 utterance.voice = found;
 break;
 }
 }

 utterance.rate = 0.95;
 utterance.pitch = 1.05;
 window.speechSynthesis.speak(utterance);
 }
 }

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 if (!mode) return;
 setError(null);
 setLoading(true);

 try {
 const { data: { session } } = await supabase.auth.getSession();
 if (!session) {
 router.push("/login");
 return;
 }

 const body: Record<string, unknown> = { mode, symbol };

 if (mode === "price" || mode === "level_pattern") {
 if (!priceLevel || isNaN(Number(priceLevel)) || Number(priceLevel) <= 0) {
 throw new Error("Please enter a valid positive price level.");
 }
 body.price_level = Number(priceLevel);
 }

 if (mode === "pattern" || mode === "repeated_pattern" || mode === "level_pattern") {
 body.candle_pattern = pattern;
 body.timeframe = timeframe;
 }

 if (mode === "repeated_pattern") {
 body.repetition_count = repetitionCount;
 }

 body.play_count = playCount;
 body.custom_message = useCustomMessage ? spokenMessage : null;

 const res = await fetch(`${API_URL}/api/alerts`, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 Authorization: `Bearer ${session.access_token}`,
 },
 body: JSON.stringify(body),
 });

 if (!res.ok) {
 const data = await res.json();
 if (data.details && Array.isArray(data.details)) {
 throw new Error(data.details.join(" "));
 }
 throw new Error(data.error || "Failed to create alert");
 }

 setSuccess(true);
 setTimeout(() => router.push("/dashboard"), 1500);
 } catch (err) {
 setError(err instanceof Error ? err.message : "Something went wrong");
 } finally {
 setLoading(false);
 }
 }

 if (checkingLimit) {
 return (
 <div className="flex items-center justify-center py-20 animate-pulse">
 <Loader2 className="w-6 h-6 text-brand animate-spin" />
 </div>
 );
 }

 if (atLimit) {
 return (
 <div className="max-w-lg mx-auto text-center py-20 animate-slide-up">
 <div className="w-20 h-20 rounded-2xl bg-brand/10 border border-brand flex items-center justify-center mx-auto mb-6">
 <Crown className="w-10 h-10 text-brand" />
 </div>
 <h2 className="text-2xl font-bold mb-2">Alert limit reached</h2>
 <p className="text-text text-sm max-w-md mx-auto mb-8">
 You&apos;ve reached the maximum number of alerts on the Free plan. Upgrade to Pro for up to 25 active alerts.
 </p>
 <div className="flex items-center justify-center gap-3">
 <Link href="/billing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-btn text-text font-semibold text-sm hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300">
 <Crown className="w-4 h-4" /> Upgrade to Pro
 </Link>
 <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface border border-surface text-text font-medium text-sm hover:bg-surface transition-all duration-300">
 Back to Dashboard
 </Link>
 </div>
 </div>
 );
 }

 if (success) {
 return (
 <div className="max-w-lg mx-auto text-center py-20 animate-fade-in">
 <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
 <CheckCircle2 className="w-10 h-10 text-emerald-400" />
 </div>
 <h2 className="text-2xl font-bold mb-2">Alert created!</h2>
 <p className="text-text text-sm">Redirecting to dashboard...</p>
 </div>
 );
 }

 return (
 <div className="max-w-3xl mx-auto animate-fade-in">
 {/* Header */}
 <div className="flex items-center gap-4 mb-8">
 {step === 1 ? (
 <Link
 href="/dashboard"
 className="w-10 h-10 rounded-xl bg-surface border border-surface flex items-center justify-center text-text hover:text-text hover:bg-surface transition-all duration-200"
 >
 <ArrowLeft className="w-4 h-4" />
 </Link>
 ) : (
 <button
 type="button"
 onClick={() => setStep(1)}
 className="w-10 h-10 rounded-xl bg-surface border border-surface flex items-center justify-center text-text hover:text-text hover:bg-surface transition-all duration-200"
 >
 <ArrowLeft className="w-4 h-4" />
 </button>
 )}
 <div>
 <h1 className="text-2xl font-bold">Create Alert</h1>
 <p className="text-text text-sm mt-0.5">
 {step === 1 ? "Step 1: Choose alert type" : "Step 2: Configure alert conditions"}
 </p>
 </div>
 </div>

 {error && (
 <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-6 animate-slide-down">
 <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
 <p className="text-sm text-red-400">{error}</p>
 </div>
 )}

 {step === 1 ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <button
 onClick={() => { setMode("price"); setStep(2); }}
 className="glass p-6 rounded-2xl text-left hover:bg-white/[0.05] border border-surface hover:border-brand transition-all duration-300 group"
 >
 <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
 <DollarSign className="w-6 h-6 text-brand" />
 </div>
 <h3 className="text-lg font-bold text-text mb-2">Price Alert</h3>
 <p className="text-sm text-text">Get notified when a symbol touches a specific price level.</p>
 </button>

 <button
 onClick={() => { setMode("pattern"); setStep(2); }}
 className="glass p-6 rounded-2xl text-left hover:bg-white/[0.05] border border-surface hover:border-brand transition-all duration-300 group"
 >
 <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
 <CandlestickChart className="w-6 h-6 text-brand" />
 </div>
 <h3 className="text-lg font-bold text-text mb-2">Pattern Alert</h3>
 <p className="text-sm text-text">Get notified when a specific candlestick pattern forms.</p>
 </button>

 <button
 onClick={() => { setMode("repeated_pattern"); setStep(2); }}
 className="glass p-6 rounded-2xl text-left hover:bg-white/[0.05] border border-surface hover:border-pink-500/30 transition-all duration-300 group"
 >
 <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
 <Repeat className="w-6 h-6 text-pink-400" />
 </div>
 <h3 className="text-lg font-bold text-text mb-2">Repeated Pattern Alert</h3>
 <p className="text-sm text-text">Get notified when multiple identical patterns form consecutively.</p>
 </button>

 <button
 onClick={() => { setMode("level_pattern"); setStep(2); }}
 className="glass p-6 rounded-2xl text-left hover:bg-white/[0.05] border border-surface hover:border-emerald-500/30 transition-all duration-300 group"
 >
 <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
 <Layers className="w-6 h-6 text-emerald-400" />
 </div>
 <h3 className="text-lg font-bold text-text mb-2">Level + Pattern Alert</h3>
 <p className="text-sm text-text">High conviction setup: Pattern forms exactly at your price level.</p>
 </button>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
 {/* Symbol (Always Required) */}
 <div className="glass rounded-2xl p-6 space-y-5">
 <div className="flex items-center gap-2 mb-1">
 <TrendingUp className="w-4 h-4 text-brand" />
 <h2 className="text-sm font-semibold text-text">Market Symbol</h2>
 </div>
 <div className="space-y-1.5">
 <label className="text-sm font-medium text-text">Symbol</label>
 <select
 value={symbol}
 onChange={(e) => setSymbol(e.target.value)}
 className="w-full px-4 py-3 rounded-xl bg-surface border border-surface text-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all duration-300 text-sm appearance-none cursor-pointer"
 >
 {SYMBOLS.map((s) => (
 <option key={s.value} value={s.value} className="bg-[#0f0f1a]">
 {s.value} — {s.label}
 </option>
 ))}
 </select>
 </div>
 </div>

 {/* Timeframe & Pattern (Required for pattern, repeated_pattern, level_pattern) */}
 {(mode === "pattern" || mode === "repeated_pattern" || mode === "level_pattern") && (
 <div className="glass rounded-2xl p-6 space-y-5 animate-slide-down">
 <div className="flex items-center gap-2 mb-1">
 <CandlestickChart className="w-4 h-4 text-brand" />
 <h2 className="text-sm font-semibold text-text">Pattern Setup</h2>
 </div>

  <div className="space-y-1.5">
  <label className="text-sm font-medium text-text">Timeframe</label>
  <div className="relative">
  <select
    value={timeframe}
    onChange={(e) => setTimeframe(e.target.value)}
    className="w-full px-4 py-3 pl-10 rounded-xl bg-surface border border-surface text-text focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/25 transition-all duration-300 text-sm appearance-none cursor-pointer"
  >
    {Object.entries(TIMEFRAMES).map(([group, options]) => (
      <optgroup key={group} label={group} className="bg-background text-text/50 font-semibold">
        {options.map((tf) => (
          <option key={tf.value} value={tf.value} className="bg-background text-text font-normal">
            {tf.label} {timeframe === tf.value ? "(Currently selected)" : ""}
          </option>
        ))}
      </optgroup>
    ))}
  </select>
  <Clock className="w-4 h-4 text-brand absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
    <svg className="w-4 h-4 text-text/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
  </div>
  </div>

 <div className="space-y-1.5">
 <label className="text-sm font-medium text-text">Candlestick Pattern</label>
 <div className="grid grid-cols-2 gap-2">
 {PATTERNS.map((p) => (
 <button
 key={p.value}
 type="button"
 onClick={() => setPattern(p.value)}
 className={`px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-all duration-200 ${
 pattern === p.value
 ? "bg-brand/10 text-brand border border-brand shadow-sm"
 : "bg-white/[0.03] border border-surface text-text hover:text-text hover:bg-surface"
 }`}
 >
 {p.label}
 </button>
 ))}
 </div>
 </div>
 </div>
 )}

 {/* Repetition Count (Only for repeated_pattern) */}
 {mode === "repeated_pattern" && (
 <div className="glass rounded-2xl p-6 space-y-5 animate-slide-down">
 <div className="flex items-center gap-2 mb-1">
 <Repeat className="w-4 h-4 text-pink-400" />
 <h2 className="text-sm font-semibold text-text">Repetition Count</h2>
 </div>
 <div className="space-y-1.5">
 <label className="text-sm font-medium text-text">Number of consecutive candles</label>
 <div className="flex items-center gap-4">
 <input
 type="range"
 min="2"
 max="5"
 value={repetitionCount}
 onChange={(e) => setRepetitionCount(Number(e.target.value))}
 className="flex-1 h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-pink-500"
 />
 <span className="text-xl font-bold w-6 text-center text-pink-400">{repetitionCount}</span>
 </div>
 </div>
 </div>
 )}

 {/* Price Level (Only for price, level_pattern) */}
 {(mode === "price" || mode === "level_pattern") && (
 <div className="glass rounded-2xl p-6 space-y-5 animate-slide-down">
 <div className="flex items-center gap-2 mb-1">
 <Target className="w-4 h-4 text-brand" />
 <h2 className="text-sm font-semibold text-text">Price Level</h2>
 </div>
 <div className="space-y-1.5">
 <label className="text-sm font-medium text-text">Alert when price touches this level (USDT)</label>
 <input
 type="number"
 step="any"
 value={priceLevel}
 onChange={(e) => setPriceLevel(e.target.value)}
 placeholder="e.g. 71250"
 required
 className="w-full px-4 py-3 rounded-xl bg-surface border border-surface text-text placeholder:text-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all duration-300 text-sm"
 />
 </div>
 </div>
 )}

 {/* Spoken Message Preview */}
 <div className="glass rounded-2xl p-6 space-y-5">
 <div className="flex items-center gap-2 mb-1">
 <MessageSquare className="w-4 h-4 text-brand" />
 <h2 className="text-sm font-semibold text-text">Spoken Message</h2>
 </div>
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <label className="text-sm font-medium text-text">What should SetupAlert say?</label>
 <button
 type="button"
 onClick={() => {
 setUseCustomMessage(!useCustomMessage);
 if (useCustomMessage) setSpokenMessage(generateSpokenMessage());
 }}
 className="text-xs text-brand hover:text-brand transition-colors"
 >
 {useCustomMessage ? "Use default" : "Customize"}
 </button>
 </div>
 <textarea
 value={spokenMessage}
 onChange={(e) => setSpokenMessage(e.target.value)}
 rows={3}
 readOnly={!useCustomMessage}
 className={`w-full px-4 py-3 rounded-xl bg-surface border border-surface text-text placeholder:text-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all duration-300 text-sm resize-none ${!useCustomMessage ? "opacity-70 cursor-default" : ""}`}
 />
 </div>
 <div className="flex items-center gap-3 p-3 rounded-xl bg-brand/10 border border-brand">
 <button
 type="button"
 onClick={previewSpeak}
 className="w-10 h-10 rounded-xl bg-brand/10 border border-brand flex items-center justify-center text-brand hover:bg-brand/10 transition-all duration-200 shrink-0"
 >
 <Play className="w-4 h-4 ml-0.5" />
 </button>
 <div>
 <p className="text-xs text-brand font-medium">Preview spoken alert</p>
 <p className="text-xs text-text mt-0.5">Click play to hear how your alert will sound</p>
 </div>
 </div>

 <div className="space-y-1.5 pt-2">
 <label className="text-sm font-medium text-text">Play Count</label>
 <div className="flex items-center gap-4">
 <input
 type="range"
 min="1"
 max="10"
 value={playCount}
 onChange={(e) => setPlayCount(Number(e.target.value))}
 className="flex-1 h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-brand"
 />
 <span className="text-xl font-bold w-6 text-center text-brand">{playCount}</span>
 </div>
 <p className="text-[10px] text-text mt-1">How many times should the alert voice repeat?</p>
 </div>
 </div>

 {/* Submit */}
 <div className="flex items-center gap-3 pt-2">
 <button
 type="submit"
 disabled={loading}
 className="flex-1 py-3.5 rounded-xl gradient-btn text-text font-semibold text-sm hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
 >
 {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating alert...</> : <><Plus className="w-4 h-4" /> Save Alert</>}
 </button>
 </div>
 </form>
 )}
 </div>
 );
}
