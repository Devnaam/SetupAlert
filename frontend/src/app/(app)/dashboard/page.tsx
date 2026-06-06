"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
 Plus,
 Bell,
 TrendingUp,
 Zap,
 Crown,
 AlertTriangle,
 Volume2,
 Pause,
 Trash2,
 Pencil,
 ToggleLeft,
 ToggleRight,
 Clock,
 Activity,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Alert {
 id: string;
 symbol: string;
 timeframe: string;
 price_level: number | null;
 candle_pattern: string | null;
 mode: string;
 generated_message: string | null;
 custom_message: string | null;
 is_active: boolean;
 created_at: string;
 updated_at: string;
 last_triggered_at: string | null;
}

interface PlanInfo {
 plan: string;
 alert_limit: number;
 alerts_used: number;
}

export default function DashboardPage() {
 const supabase = createClient();
 const [alerts, setAlerts] = useState<Alert[]>([]);
 const [planInfo, setPlanInfo] = useState<PlanInfo>({
 plan: "free",
 alert_limit: 3,
 alerts_used: 0,
 });
 const [loading, setLoading] = useState(true);

 const fetchAlerts = useCallback(async () => {
 try {
 const {
 data: { session },
 } = await supabase.auth.getSession();
 if (!session) return;

 const res = await fetch(`${API_URL}/api/alerts`, {
 headers: { Authorization: `Bearer ${session.access_token}` },
 });

 if (res.ok) {
 const data = await res.json();
 setAlerts(data.data || []);
 }
 } catch (err) {
 console.error("Failed to fetch alerts:", err);
 }
 }, [supabase]);

 const fetchPlan = useCallback(async () => {
 try {
 const {
 data: { session },
 } = await supabase.auth.getSession();
 if (!session) return;

 const res = await fetch(`${API_URL}/api/billing/status`, {
 headers: { Authorization: `Bearer ${session.access_token}` },
 });

 if (res.ok) {
 const data = await res.json();
 setPlanInfo({
 plan: data.plan || "free",
 alert_limit: data.alert_limit || 3,
 alerts_used: data.alerts_used || 0,
 });
 }
 } catch (err) {
 console.error("Failed to fetch plan:", err);
 }
 }, [supabase]);

 useEffect(() => {
 Promise.all([fetchAlerts(), fetchPlan()]).finally(() => setLoading(false));
 }, [fetchAlerts, fetchPlan]);

 async function toggleAlert(id: string, currentState: boolean) {
 try {
 const {
 data: { session },
 } = await supabase.auth.getSession();
 if (!session) return;

 await fetch(`${API_URL}/api/alerts/${id}/toggle`, {
 method: "POST",
 headers: {
 Authorization: `Bearer ${session.access_token}`,
 },
 });

 setAlerts((prev) =>
 prev.map((a) => (a.id === id ? { ...a, is_active: !currentState } : a))
 );
 } catch (err) {
 console.error("Failed to toggle alert:", err);
 }
 }

 async function deleteAlert(id: string) {
 if (!confirm("Are you sure you want to delete this alert?")) return;

 try {
 const {
 data: { session },
 } = await supabase.auth.getSession();
 if (!session) return;

 await fetch(`${API_URL}/api/alerts/${id}`, {
 method: "DELETE",
 headers: { Authorization: `Bearer ${session.access_token}` },
 });

 setAlerts((prev) => prev.filter((a) => a.id !== id));
 } catch (err) {
 console.error("Failed to delete alert:", err);
 }
 }

 const usagePercent = planInfo.alert_limit
 ? (planInfo.alerts_used / planInfo.alert_limit) * 100
 : 0;
 const isNearLimit = usagePercent >= 80;

 if (loading) {
 return (
 <div className="space-y-6 animate-pulse">
 <div className="h-10 w-48 bg-surface rounded-xl" />
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {[1, 2, 3].map((i) => (
 <div key={i} className="h-48 bg-surface rounded-2xl" />
 ))}
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6 animate-fade-in">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
 <p className="text-text text-sm mt-1">
 Manage your trading alerts
 </p>
 </div>

 <div className="flex items-center gap-3">
 {/* Plan badge */}
 <div
 className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
 planInfo.plan === "pro"
 ? "bg-brand/10 text-brand border border-brand"
 : "bg-surface text-text border border-surface"
 }`}
 >
 {planInfo.plan === "pro" ? (
 <Crown className="w-3.5 h-3.5" />
 ) : (
 <Zap className="w-3.5 h-3.5" />
 )}
 {planInfo.plan === "pro" ? "Pro" : "Free"} Plan
 </div>

 {/* Usage badge */}
 <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-surface text-xs font-medium text-text">
 <Activity className="w-3.5 h-3.5" />
 {planInfo.alerts_used} / {planInfo.alert_limit} alerts
 </div>

 {/* Create button */}
 <Link
 href="/alerts"
 className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-btn text-text text-sm font-semibold hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300"
 >
 <Plus className="w-4 h-4" />
 <span className="hidden sm:inline">Create Alert</span>
 </Link>
 </div>
 </div>

 {/* Near-limit warning */}
 {isNearLimit && planInfo.plan === "free" && (
 <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 animate-slide-down">
 <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
 <div className="flex-1">
 <p className="text-sm font-medium text-amber-400">
 You&apos;re running low on alerts
 </p>
 <p className="text-xs text-amber-400/60 mt-0.5">
 {planInfo.alerts_used} of {planInfo.alert_limit} alerts used.
 Upgrade to Pro for unlimited alerts.
 </p>
 </div>
 <Link
 href="/billing"
 className="shrink-0 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-all duration-200"
 >
 Upgrade
 </Link>
 </div>
 )}

 {/* Usage progress bar */}
 {planInfo.plan === "free" && (
 <div className="glass rounded-xl p-4">
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs text-text">Alert usage</span>
 <span className="text-xs text-text font-medium">
 {usagePercent.toFixed(0)}%
 </span>
 </div>
 <div className="w-full h-1.5 rounded-full bg-surface overflow-hidden">
 <div
 className={`h-full rounded-full transition-all duration-500 ${
 isNearLimit
 ? "bg-brand from-amber-500 to-red-500"
 : "bg-brand "
 }`}
 style={{ width: `${Math.min(usagePercent, 100)}%` }}
 />
 </div>
 </div>
 )}

 {/* Alert cards */}
 {alerts.length === 0 ? (
 <div className="glass rounded-2xl p-12 text-center animate-slide-up">
 <div className="w-20 h-20 rounded-2xl bg-brand/10 border border-brand flex items-center justify-center mx-auto mb-6">
 <Bell className="w-10 h-10 text-brand" />
 </div>
 <h2 className="text-xl font-bold mb-2">No alerts yet</h2>
 <p className="text-text text-sm max-w-md mx-auto mb-6">
 Create your first alert to start receiving spoken notifications when
 your trading setups trigger.
 </p>
 <Link
 href="/alerts"
 className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-btn text-text font-semibold text-sm hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300"
 >
 <Plus className="w-4 h-4" />
 Create your first alert
 </Link>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 {alerts.map((alert, index) => (
 <div
 key={alert.id}
 className={`glass rounded-2xl p-5 group hover:bg-white/[0.07] transition-all duration-300 ${
 !alert.is_active ? "opacity-60" : ""
 }`}
 style={{ animationDelay: `${index * 80}ms` }}
 >
 {/* Card header */}
 <div className="flex items-start justify-between mb-4">
 <div className="flex items-center gap-3">
 <div
 className={`w-10 h-10 rounded-xl flex items-center justify-center ${
 alert.is_active
 ? "bg-brand/10 border border-brand"
 : "bg-surface border border-surface"
 }`}
 >
 <TrendingUp
 className={`w-5 h-5 ${
 alert.is_active ? "text-brand" : "text-text"
 }`}
 />
 </div>
 <div>
 <h3 className="font-bold text-text">{alert.symbol}</h3>
 <span className="text-xs text-text">
 {alert.timeframe}
 </span>
 </div>
 </div>

 <div
 className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
 alert.is_active
 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
 : "bg-surface text-text border border-surface"
 }`}
 >
 <div
 className={`w-1.5 h-1.5 rounded-full ${
 alert.is_active
 ? "bg-emerald-400 animate-pulse"
 : "bg-white/30"
 }`}
 />
 {alert.is_active ? "Active" : "Paused"}
 </div>
 </div>

 {/* Spoken message preview */}
 <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.03] border border-surface mb-4">
 <Volume2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
 <p className="text-xs text-text line-clamp-2 leading-relaxed">
 &quot;{alert.generated_message || `${alert.symbol} at ${alert.price_level}`}&quot;
 </p>
 </div>

 {/* Meta */}
 <div className="flex items-center gap-3 text-xs text-text mb-4">
 <div className="flex items-center gap-1">
 <Clock className="w-3 h-3" />
 {new Date(alert.created_at).toLocaleDateString()}
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center gap-2 pt-3 border-t border-surface">
 <button
 onClick={() => toggleAlert(alert.id, alert.is_active)}
 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text hover:text-text hover:bg-surface transition-all duration-200"
 >
 {alert.is_active ? (
 <ToggleRight className="w-4 h-4 text-emerald-400" />
 ) : (
 <ToggleLeft className="w-4 h-4" />
 )}
 {alert.is_active ? "Pause" : "Resume"}
 </button>

 <Link
 href={`/alerts/${alert.id}`}
 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text hover:text-text hover:bg-surface transition-all duration-200"
 >
 <Pencil className="w-3.5 h-3.5" />
 Edit
 </Link>

 <button
 onClick={() => deleteAlert(alert.id)}
 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 ml-auto"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 );
}
