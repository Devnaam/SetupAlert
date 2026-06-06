"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
 History as HistoryIcon,
 Search,
 Filter,
 ChevronLeft,
 ChevronRight,
 Volume2,
 TrendingUp,
 Clock,
 Calendar,
 Zap,
 X,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface AlertEvent {
 id: string;
 alert_id: string;
 symbol: string;
 timeframe: string;
 pattern: string;
 spoken_message: string;
 price_at_trigger: number;
 triggered_at: string;
 conditions: Record<string, unknown>;
}

const SYMBOL_OPTIONS = [
 "All",
 "BTCUSDT",
 "ETHUSDT",
 "BNBUSDT",
 "SOLUSDT",
 "XRPUSDT",
];
const TIMEFRAME_OPTIONS = [
 "All",
 "1m",
 "5m",
 "15m",
 "30m",
 "1h",
 "4h",
 "1d",
];
const PATTERN_OPTIONS = [
 "All",
 "hammer",
 "doji",
 "bullish-engulfing",
 "bearish-engulfing",
 "morning-star",
 "evening-star",
 "shooting-star",
];

export default function HistoryPage() {
 const supabase = createClient();
 const [events, setEvents] = useState<AlertEvent[]>([]);
 const [loading, setLoading] = useState(true);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [total, setTotal] = useState(0);

 const [symbolFilter, setSymbolFilter] = useState("All");
 const [timeframeFilter, setTimeframeFilter] = useState("All");
 const [patternFilter, setPatternFilter] = useState("All");
 const [showFilters, setShowFilters] = useState(false);

 const fetchEvents = useCallback(async () => {
 setLoading(true);
 try {
 const {
 data: { session },
 } = await supabase.auth.getSession();
 if (!session) return;

 const params = new URLSearchParams({
 page: String(page),
 limit: "20",
 });

 if (symbolFilter !== "All") params.set("symbol", symbolFilter);
 if (timeframeFilter !== "All") params.set("timeframe", timeframeFilter);
 if (patternFilter !== "All") params.set("pattern", patternFilter);

 const res = await fetch(`${API_URL}/api/history?${params}`, {
 headers: { Authorization: `Bearer ${session.access_token}` },
 });

 if (res.ok) {
 const data = await res.json();
 setEvents(data.data || []);
 setTotalPages(data.pagination?.totalPages || 1);
 setTotal(data.pagination?.total || 0);
 }
 } catch (err) {
 console.error("Failed to fetch events:", err);
 } finally {
 setLoading(false);
 }
 }, [supabase, page, symbolFilter, timeframeFilter, patternFilter]);

 useEffect(() => {
 fetchEvents();
 }, [fetchEvents]);

 function replaySpeak(message: string) {
 if ("speechSynthesis" in window) {
 window.speechSynthesis.cancel();
 const utterance = new SpeechSynthesisUtterance(message);
 utterance.rate = 0.9;
 window.speechSynthesis.speak(utterance);
 }
 }

 function clearFilters() {
 setSymbolFilter("All");
 setTimeframeFilter("All");
 setPatternFilter("All");
 setPage(1);
 }

 const hasActiveFilters =
 symbolFilter !== "All" ||
 timeframeFilter !== "All" ||
 patternFilter !== "All";

 return (
 <div className="space-y-6 animate-fade-in">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl lg:text-3xl font-bold">Alert History</h1>
 <p className="text-text text-sm mt-1">
 {total} total events triggered
 </p>
 </div>

 <button
 onClick={() => setShowFilters(!showFilters)}
 className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
 showFilters || hasActiveFilters
 ? "bg-brand/10 text-brand border border-brand"
 : "bg-surface border border-surface text-text hover:bg-surface"
 }`}
 >
 <Filter className="w-4 h-4" />
 Filters
 {hasActiveFilters && (
 <span className="w-5 h-5 rounded-full bg-brand/10 text-text text-xs flex items-center justify-center">
 {[symbolFilter, timeframeFilter, patternFilter].filter(
 (f) => f !== "All"
 ).length}
 </span>
 )}
 </button>
 </div>

 {/* Filters */}
 {showFilters && (
 <div className="glass rounded-xl p-5 animate-slide-down">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-semibold text-text">
 Filter events
 </h3>
 {hasActiveFilters && (
 <button
 onClick={clearFilters}
 className="flex items-center gap-1 text-xs text-brand hover:text-brand transition-colors"
 >
 <X className="w-3 h-3" />
 Clear all
 </button>
 )}
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-text">
 Symbol
 </label>
 <select
 value={symbolFilter}
 onChange={(e) => {
 setSymbolFilter(e.target.value);
 setPage(1);
 }}
 className="w-full px-3 py-2.5 rounded-lg bg-surface border border-surface text-text text-sm focus:outline-none focus:border-brand transition-all duration-200 appearance-none cursor-pointer"
 >
 {SYMBOL_OPTIONS.map((s) => (
 <option key={s} value={s} className="bg-[#0f0f1a]">
 {s}
 </option>
 ))}
 </select>
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-medium text-text">
 Timeframe
 </label>
 <select
 value={timeframeFilter}
 onChange={(e) => {
 setTimeframeFilter(e.target.value);
 setPage(1);
 }}
 className="w-full px-3 py-2.5 rounded-lg bg-surface border border-surface text-text text-sm focus:outline-none focus:border-brand transition-all duration-200 appearance-none cursor-pointer"
 >
 {TIMEFRAME_OPTIONS.map((t) => (
 <option key={t} value={t} className="bg-[#0f0f1a]">
 {t}
 </option>
 ))}
 </select>
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-medium text-text">
 Pattern
 </label>
 <select
 value={patternFilter}
 onChange={(e) => {
 setPatternFilter(e.target.value);
 setPage(1);
 }}
 className="w-full px-3 py-2.5 rounded-lg bg-surface border border-surface text-text text-sm focus:outline-none focus:border-brand transition-all duration-200 appearance-none cursor-pointer"
 >
 {PATTERN_OPTIONS.map((p) => (
 <option key={p} value={p} className="bg-[#0f0f1a]">
 {p === "All"
 ? "All"
 : p
 .replace(/-/g, " ")
 .replace(/\b\w/g, (l) => l.toUpperCase())}
 </option>
 ))}
 </select>
 </div>
 </div>
 </div>
 )}

 {/* Events */}
 {loading ? (
 <div className="space-y-3">
 {[1, 2, 3, 4, 5].map((i) => (
 <div
 key={i}
 className="h-20 bg-surface rounded-xl animate-pulse"
 />
 ))}
 </div>
 ) : events.length === 0 ? (
 <div className="glass rounded-2xl p-12 text-center animate-slide-up">
 <div className="w-20 h-20 rounded-2xl bg-surface border border-surface flex items-center justify-center mx-auto mb-6">
 <HistoryIcon className="w-10 h-10 text-text/20" />
 </div>
 <h2 className="text-xl font-bold mb-2">No events yet</h2>
 <p className="text-text text-sm max-w-md mx-auto">
 {hasActiveFilters
 ? "No events match your current filters. Try adjusting or clearing your filters."
 : "When your alerts trigger, they will appear here. Create an alert to get started."}
 </p>
 </div>
 ) : (
 <>
 {/* Event list */}
 <div className="space-y-2">
 {events.map((event, index) => (
 <div
 key={event.id}
 className="glass rounded-xl p-4 hover:bg-white/[0.07] transition-all duration-200 group"
 style={{ animationDelay: `${index * 50}ms` }}
 >
 <div className="flex items-center gap-4">
 {/* Icon */}
 <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand flex items-center justify-center shrink-0">
 <Zap className="w-5 h-5 text-brand" />
 </div>

 {/* Content */}
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1">
 <span className="font-bold text-text text-sm">
 {event.symbol}
 </span>
 <span className="px-2 py-0.5 rounded-full bg-surface text-xs text-text border border-surface">
 {event.timeframe}
 </span>
 {event.pattern && (
 <span className="px-2 py-0.5 rounded-full bg-brand/10 text-xs text-brand border border-brand">
 {event.pattern
 .replace(/-/g, " ")
 .replace(/\b\w/g, (l: string) => l.toUpperCase())}
 </span>
 )}
 </div>
 <p className="text-xs text-text truncate">
 &quot;{event.spoken_message}&quot;
 </p>
 </div>

 {/* Meta */}
 <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
 {event.price_at_trigger && (
 <span className="text-sm font-medium text-text">
 ${event.price_at_trigger.toLocaleString()}
 </span>
 )}
 <span className="text-xs text-text flex items-center gap-1">
 <Clock className="w-3 h-3" />
 {new Date(event.triggered_at).toLocaleString()}
 </span>
 </div>

 {/* Replay */}
 <button
 onClick={() => replaySpeak(event.spoken_message)}
 className="w-9 h-9 rounded-lg bg-surface border border-surface flex items-center justify-center text-text hover:text-brand hover:bg-brand/10 hover:border-brand transition-all duration-200 shrink-0 opacity-0 group-hover:opacity-100"
 title="Replay spoken alert"
 >
 <Volume2 className="w-4 h-4" />
 </button>
 </div>
 </div>
 ))}
 </div>

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="flex items-center justify-between pt-4">
 <p className="text-xs text-text">
 Page {page} of {totalPages} · {total} total events
 </p>
 <div className="flex items-center gap-2">
 <button
 onClick={() => setPage(Math.max(1, page - 1))}
 disabled={page <= 1}
 className="w-9 h-9 rounded-lg bg-surface border border-surface flex items-center justify-center text-text hover:text-text hover:bg-surface transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
 >
 <ChevronLeft className="w-4 h-4" />
 </button>

 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
 let pageNum: number;
 if (totalPages <= 5) {
 pageNum = i + 1;
 } else if (page <= 3) {
 pageNum = i + 1;
 } else if (page >= totalPages - 2) {
 pageNum = totalPages - 4 + i;
 } else {
 pageNum = page - 2 + i;
 }

 return (
 <button
 key={pageNum}
 onClick={() => setPage(pageNum)}
 className={`w-9 h-9 rounded-lg text-xs font-medium transition-all duration-200 ${
 page === pageNum
 ? "gradient-btn text-text"
 : "bg-surface border border-surface text-text hover:text-text hover:bg-surface"
 }`}
 >
 {pageNum}
 </button>
 );
 })}

 <button
 onClick={() => setPage(Math.min(totalPages, page + 1))}
 disabled={page >= totalPages}
 className="w-9 h-9 rounded-lg bg-surface border border-surface flex items-center justify-center text-text hover:text-text hover:bg-surface transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
 >
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 </div>
 )}
 </>
 )}
 </div>
 );
}
