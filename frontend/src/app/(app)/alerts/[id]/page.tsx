"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Volume2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Clock,
  MessageSquare,
  Play,
  Save,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const SYMBOLS = [
  "BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT",
  "ADAUSDT", "DOGEUSDT", "AVAXUSDT", "DOTUSDT", "MATICUSDT",
];

const TIMEFRAMES = ["1m", "3m", "5m", "15m", "30m", "1h", "4h", "1d", "1w"];

const PATTERNS = [
  { value: "hammer", label: "Hammer" },
  { value: "inverted_hammer", label: "Inverted Hammer" },
  { value: "engulfing_bullish", label: "Bullish Engulfing" },
  { value: "engulfing_bearish", label: "Bearish Engulfing" },
  { value: "doji", label: "Doji" },
  { value: "morning_star", label: "Morning Star" },
  { value: "evening_star", label: "Evening Star" },
  { value: "three_white_soldiers", label: "Three White Soldiers" },
  { value: "three_black_crows", label: "Three Black Crows" },
  { value: "shooting_star", label: "Shooting Star" },
];

const CONDITIONS = [
  { value: "price_above", label: "Price crosses above" },
  { value: "price_below", label: "Price crosses below" },
  { value: "pattern_formed", label: "Candlestick pattern formed" },
  { value: "volume_spike", label: "Volume spike detected" },
];

export default function EditAlertPage() {
  const router = useRouter();
  const params = useParams();
  const alertId = params.id as string;
  const supabase = createClient();

  const [symbol, setSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("15m");
  const [conditionType, setConditionType] = useState("price_above");
  const [priceLevel, setPriceLevel] = useState("");
  const [pattern, setPattern] = useState("hammer");
  const [spokenMessage, setSpokenMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchAlert() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
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
        const alert = data.alert || data;

        setSymbol(alert.symbol || "BTCUSDT");
        setTimeframe(alert.timeframe || "15m");
        setSpokenMessage(alert.spoken_message || "");

        if (alert.conditions) {
          setConditionType(alert.conditions.type || "price_above");
          if (alert.conditions.price) {
            setPriceLevel(String(alert.conditions.price));
          }
          if (alert.conditions.pattern) {
            setPattern(alert.conditions.pattern);
          }
        }
      } catch (err) {
        setError("Failed to load alert");
      } finally {
        setFetching(false);
      }
    }

    fetchAlert();
  }, [alertId, supabase, router]);

  function previewSpeak() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(spokenMessage);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const conditions: Record<string, unknown> = {
        type: conditionType,
      };

      if (conditionType === "price_above" || conditionType === "price_below") {
        if (!priceLevel || isNaN(Number(priceLevel))) {
          setError("Please enter a valid price level");
          setLoading(false);
          return;
        }
        conditions.price = Number(priceLevel);
      }

      if (conditionType === "pattern_formed") {
        conditions.pattern = pattern;
      }

      const res = await fetch(`${API_URL}/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          symbol,
          timeframe,
          conditions,
          spoken_message: spokenMessage,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
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
          <div className="w-10 h-10 rounded-xl bg-white/5" />
          <div className="h-8 w-48 bg-white/5 rounded-lg" />
        </div>
        <div className="h-64 bg-white/5 rounded-2xl" />
        <div className="h-48 bg-white/5 rounded-2xl" />
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
        <p className="text-white/40 text-sm">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Alert</h1>
          <p className="text-white/40 text-sm mt-0.5">
            Update your alert conditions and message
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
        {/* Symbol & Timeframe */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white/80">Market Setup</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/60">Symbol</label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 transition-all duration-300 text-sm appearance-none cursor-pointer"
              >
                {SYMBOLS.map((s) => (
                  <option key={s} value={s} className="bg-[#0f0f1a]">{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/60">Timeframe</label>
              <div className="flex flex-wrap gap-2">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                      timeframe === tf
                        ? "gradient-btn text-white shadow-lg shadow-indigo-500/20"
                        : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Condition */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white/80">Condition</h2>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/60">Alert when</label>
            <select
              value={conditionType}
              onChange={(e) => setConditionType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 transition-all duration-300 text-sm appearance-none cursor-pointer"
            >
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value} className="bg-[#0f0f1a]">{c.label}</option>
              ))}
            </select>
          </div>

          {(conditionType === "price_above" || conditionType === "price_below") && (
            <div className="space-y-1.5 animate-slide-down">
              <label className="text-sm font-medium text-white/60">Price level (USDT)</label>
              <input
                type="number"
                step="any"
                value={priceLevel}
                onChange={(e) => setPriceLevel(e.target.value)}
                placeholder="e.g. 71250"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 transition-all duration-300 text-sm"
              />
            </div>
          )}

          {conditionType === "pattern_formed" && (
            <div className="space-y-1.5 animate-slide-down">
              <label className="text-sm font-medium text-white/60">Candlestick pattern</label>
              <div className="grid grid-cols-2 gap-2">
                {PATTERNS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPattern(p.value)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-all duration-200 ${
                      pattern === p.value
                        ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                        : "bg-white/[0.03] border border-white/5 text-white/50 hover:text-white/80 hover:bg-white/5"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Spoken message */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-white/80">Spoken Message</h2>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/60">
              What should StrategyAlert say?
            </label>
            <textarea
              value={spokenMessage}
              onChange={(e) => setSpokenMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 transition-all duration-300 text-sm resize-none"
            />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
            <button
              type="button"
              onClick={previewSpeak}
              className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-all duration-200 shrink-0"
            >
              <Play className="w-4 h-4 ml-0.5" />
            </button>
            <div>
              <p className="text-xs text-cyan-400 font-medium">Preview spoken alert</p>
              <p className="text-xs text-white/30 mt-0.5">Click play to hear how your alert will sound</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3.5 rounded-xl gradient-btn text-white font-semibold text-sm hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white/60 font-medium text-sm hover:bg-white/10 transition-all duration-300"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
