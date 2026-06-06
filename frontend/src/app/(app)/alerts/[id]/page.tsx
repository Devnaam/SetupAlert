"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
 ArrowLeft,
 Loader2,
 AlertCircle,
 CheckCircle2,
 TrendingUp,
 Clock,
 MessageSquare,
 Play,
 Save,
 Target,
 CandlestickChart,
 Repeat,
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

export default function EditAlertPage() {
 const router = useRouter();
 const params = useParams();
 const alertId = params.id as string;
 const supabase = createClient();

 const [mode, setMode] = useState<AlertMode>("level_pattern");
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
 const [fetching, setFetching] = useState(true);
 const [success, setSuccess] = useState(false);

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
 async function fetchAlert() {
 try {
 const { data: { session } } = await supabase.auth.getSession();
 if (!session) {
 router.push("/login");
 return;
 }

 const res = await fetch(`${API_URL}/api/alerts/${alertId}`, {
 headers: { Authorization: `Bearer ${session.access_token}` },
 });

 if (!res.ok) {
 setError("Alert not found");
 setFetching(false);
 return;
 }

 const data = await res.json();
 const alert = data.data || data;

 setMode(alert.mode || "level_pattern");
 setSymbol(alert.symbol || "BTCUSDT");
 setTimeframe(alert.timeframe || "15m");
 if (alert.price_level) setPriceLevel(String(alert.price_level));
 if (alert.candle_pattern) setPattern(alert.candle_pattern);
 if (alert.repetition_count) setRepetitionCount(alert.repetition_count);
 if (alert.play_count) setPlayCount(alert.play_count);

 if (alert.custom_message) {
 setSpokenMessage(alert.custom_message);
 setUseCustomMessage(true);
 } else if (alert.generated_message) {
 setSpokenMessage(alert.generated_message);
 }
 } catch {
 setError("Failed to load alert");
 } finally {
 setFetching(false);
 }
 }

 fetchAlert();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [alertId]);

 useEffect(() => {
 if (!useCustomMessage && !fetching) {
 setSpokenMessage(generateSpokenMessage());
 }
 }, [generateSpokenMessage, useCustomMessage, fetching]);

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
 setError(null);
 setLoading(true);

 try {
 const { data: { session } } = await supabase.auth.getSession();
 if (!session) {
 router.push("/login");
 return;
 }

 const body: Record<string, unknown> = { symbol };

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

 const res = await fetch(`${API_URL}/api/alerts/${alertId}`, {
 method: "PUT",
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
 throw new Error(data.error || "Failed to update alert");
 }

 setSuccess(true);
 setTimeout(() => router.push("/dashboard"), 1500);
 } catch (err) {
 setError(err instanceof Error ? err.message : "Something went wrong");
 } finally {
 setLoading(false);
 }
 }

 if (fetching) {
 return (
 <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-xl bg-surface" />
 <div className="h-8 w-48 bg-surface rounded-lg" />
 </div>
 <div className="h-64 bg-surface rounded-2xl" />
 </div>
 );
 }

 if (success) {
 return (
 <div className="max-w-lg mx-auto text-center py-20 animate-fade-in">
 <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
 <CheckCircle2 className="w-10 h-10 text-emerald-400" />
 </div>
 <h2 className="text-2xl font-bold mb-2">Alert updated!</h2>
 <p className="text-text text-sm">Redirecting to dashboard...</p>
 </div>
 );
 }

 return (
 <div className="max-w-2xl mx-auto animate-fade-in">
 <div className="flex items-center gap-4 mb-8">
 <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-surface border border-surface flex items-center justify-center text-text hover:text-text hover:bg-surface transition-all duration-200">
 <ArrowLeft className="w-4 h-4" />
 </Link>
 <div>
 <h1 className="text-2xl font-bold">Edit Alert</h1>
 <p className="text-text text-sm mt-0.5">
 Update your {mode.replace(/_/g, " ")} alert setup
 </p>
 </div>
 </div>

 {error && (
 <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-6 animate-slide-down">
 <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
 <p className="text-sm text-red-400">{error}</p>
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-6">
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
 <option key={s.value} value={s.value} className="bg-[#0f0f1a]">{s.value} — {s.label}</option>
 ))}
 </select>
 </div>
 </div>

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

 <div className="glass rounded-2xl p-6 space-y-5">
 <div className="flex items-center gap-2 mb-1">
 <MessageSquare className="w-4 h-4 text-brand" />
 <h2 className="text-sm font-semibold text-text">Spoken Message</h2>
 </div>
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <label className="text-sm font-medium text-text">What should StrategyAlert say?</label>
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

 <div className="flex items-center gap-3 pt-2">
 <button type="submit" disabled={loading} className="flex-1 py-3.5 rounded-xl gradient-btn text-text font-semibold text-sm hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
 {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving changes...</> : <><Save className="w-4 h-4" /> Save Changes</>}
 </button>
 <Link href="/dashboard" className="px-6 py-3.5 rounded-xl bg-surface border border-surface text-text font-medium text-sm hover:bg-surface transition-all duration-300">
 Cancel
 </Link>
 </div>
 </form>
 </div>
 );
}
