"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
 Crown,
 Zap,
 Check,
 X,
 CreditCard,
 Shield,
 Volume2,
 Bell,
 TrendingUp,
 BarChart3,
 Loader2,
 AlertCircle,
 ExternalLink,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";



interface SubscriptionInfo {
 plan: string;
 status: string;
 alert_limit: number;
 alerts_used: number;
 current_period_end?: string;
 razorpay_subscription_id?: string;
}

const FREE_FEATURES = [
 { text: "Up to 3 alerts", included: true },
 { text: "Spoken alert notifications", included: true },
 { text: "Basic candlestick patterns", included: true },
 { text: "Alert history (7 days)", included: true },
 { text: "Unlimited alerts", included: false },
 { text: "Priority pattern detection", included: false },
 { text: "Multi-timeframe alerts", included: false },
 { text: "Email & webhook notifications", included: false },
];

const PRO_FEATURES = [
 { text: "Unlimited alerts", included: true },
 { text: "Spoken alert notifications", included: true },
 { text: "All candlestick patterns", included: true },
 { text: "Alert history (unlimited)", included: true },
 { text: "Priority pattern detection", included: true },
 { text: "Multi-timeframe alerts", included: true },
 { text: "Email & webhook notifications", included: true },
 { text: "Priority support", included: true },
];

export default function BillingPage() {
 const supabase = createClient();
 const [subscription, setSubscription] = useState<SubscriptionInfo>({
 plan: "free",
 status: "active",
 alert_limit: 3,
 alerts_used: 0,
 });
 const [loading, setLoading] = useState(true);
 const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
 "monthly"
 );
 const [upgradeLoading, setUpgradeLoading] = useState(false);
 const [cancelLoading, setCancelLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const fetchSubscription = useCallback(async () => {
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
 setSubscription({
 plan: data.plan || "free",
 status: data.status || "active",
 alert_limit: data.alert_limit || 3,
 alerts_used: data.alerts_used || 0,
 current_period_end: data.current_period_end,
 razorpay_subscription_id: data.razorpay_subscription_id,
 });
 }
 } catch (err) {
 console.error("Failed to fetch subscription:", err);
 } finally {
 setLoading(false);
 }
 }, [supabase]);

 useEffect(() => {
 fetchSubscription();
 }, [fetchSubscription]);

 useEffect(() => {
 const script = document.createElement("script");
 script.src = "https://checkout.razorpay.com/v1/checkout.js";
 script.async = true;
 document.body.appendChild(script);
 return () => {
 document.body.removeChild(script);
 };
 }, []);

 async function handleUpgrade() {
 setUpgradeLoading(true);
 setError(null);

 try {
 const {
 data: { session },
 } = await supabase.auth.getSession();
 if (!session) return;

 const res = await fetch(`${API_URL}/api/billing/create-subscription`, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 Authorization: `Bearer ${session.access_token}`,
 },
 body: JSON.stringify({ billing_cycle: billingCycle }),
 });

 if (!res.ok) {
 const data = await res.json();
 throw new Error(data.error || "Failed to create subscription");
 }

 const data = await res.json();

 const options = {
 key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
 subscription_id: data.subscription_id,
 name: "SetupAlert",
 description: `Pro Plan (${billingCycle === "monthly" ? "Monthly" : "Annual"})`,
 handler: async function (response: any) {
 try {
 const verifyRes = await fetch(
 `${API_URL}/api/billing/verify-payment`,
 {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 Authorization: `Bearer ${session.access_token}`,
 },
 body: JSON.stringify({
 razorpay_payment_id: response.razorpay_payment_id,
 razorpay_subscription_id:
 response.razorpay_subscription_id,
 razorpay_signature: response.razorpay_signature,
 }),
 }
 );

 if (verifyRes.ok) {
 await fetchSubscription();
 }
 } catch (err) {
 console.error("Payment verification failed:", err);
 }
 },
 prefill: {
 email: session.user.email,
 },
 theme: {
 color: "#6366f1",
 },
 };

 const rzp = new window.Razorpay(options);
 rzp.open();
 } catch (err) {
 setError(err instanceof Error ? err.message : "Something went wrong");
 } finally {
 setUpgradeLoading(false);
 }
 }

 async function handleCancel() {
 if (
 !confirm(
 "Are you sure you want to cancel your Pro subscription? You will lose access to Pro features at the end of the current billing period."
 )
 ) {
 return;
 }

 setCancelLoading(true);
 setError(null);

 try {
 const {
 data: { session },
 } = await supabase.auth.getSession();
 if (!session) return;

 const res = await fetch(`${API_URL}/api/billing/cancel-subscription`, {
 method: "POST",
 headers: {
 Authorization: `Bearer ${session.access_token}`,
 },
 });

 if (!res.ok) {
 const data = await res.json();
 throw new Error(data.error || "Failed to cancel subscription");
 }

 await fetchSubscription();
 } catch (err) {
 setError(err instanceof Error ? err.message : "Something went wrong");
 } finally {
 setCancelLoading(false);
 }
 }

 const monthlyPrice = 299;
 const annualPrice = 2499;
 const monthlySavings = Math.round(
 ((monthlyPrice * 12 - annualPrice) / (monthlyPrice * 12)) * 100
 );

 if (loading) {
 return (
 <div className="space-y-6 animate-pulse">
 <div className="h-10 w-64 bg-surface rounded-xl" />
 <div className="h-32 bg-surface rounded-2xl" />
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="h-96 bg-surface rounded-2xl" />
 <div className="h-96 bg-surface rounded-2xl" />
 </div>
 </div>
 );
 }

 return (
 <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
 {/* Header */}
 <div>
 <h1 className="text-2xl lg:text-3xl font-bold">Billing & Plans</h1>
 <p className="text-text text-sm mt-1">
 Manage your subscription and billing
 </p>
 </div>

 {error && (
 <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 animate-slide-down">
 <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
 <p className="text-sm text-red-400">{error}</p>
 </div>
 )}

 {/* Current subscription */}
 <div className="glass rounded-2xl p-6">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div
 className={`w-12 h-12 rounded-xl flex items-center justify-center ${
 subscription.plan === "pro"
 ? "bg-brand/10 border border-brand"
 : "bg-surface border border-surface"
 }`}
 >
 {subscription.plan === "pro" ? (
 <Crown className="w-6 h-6 text-brand" />
 ) : (
 <Zap className="w-6 h-6 text-text" />
 )}
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h2 className="text-lg font-bold">
 {subscription.plan === "pro" ? "Pro" : "Free"} Plan
 </h2>
 <span
 className={`px-2 py-0.5 rounded-full text-xs font-medium ${
 subscription.status === "active"
 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
 : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
 }`}
 >
 {subscription.status}
 </span>
 </div>
 <p className="text-sm text-text mt-0.5">
 {subscription.alerts_used} of {subscription.alert_limit} alerts
 used
 {subscription.current_period_end &&
 ` · Renews ${new Date(
 subscription.current_period_end
 ).toLocaleDateString()}`}
 </p>
 </div>
 </div>

 {subscription.plan === "pro" && (
 <button
 onClick={handleCancel}
 disabled={cancelLoading}
 className="px-4 py-2 rounded-lg bg-surface border border-surface text-sm text-text hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/20 transition-all duration-200 disabled:opacity-50"
 >
 {cancelLoading ? (
 <Loader2 className="w-4 h-4 animate-spin" />
 ) : (
 "Cancel subscription"
 )}
 </button>
 )}
 </div>
 </div>

 {/* Billing cycle toggle */}
 <div className="flex items-center justify-center gap-3">
 <span
 className={`text-sm font-medium ${
 billingCycle === "monthly" ? "text-text" : "text-text"
 }`}
 >
 Monthly
 </span>
 <button
 onClick={() =>
 setBillingCycle((c) =>
 c === "monthly" ? "annual" : "monthly"
 )
 }
 className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
 billingCycle === "annual"
 ? "bg-brand "
 : "bg-surface"
 }`}
 >
 <div
 className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 ${
 billingCycle === "annual" ? "left-7" : "left-0.5"
 }`}
 />
 </button>
 <span
 className={`text-sm font-medium ${
 billingCycle === "annual" ? "text-text" : "text-text"
 }`}
 >
 Annual
 </span>
 {billingCycle === "annual" && (
 <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20 animate-slide-down">
 Save {monthlySavings}%
 </span>
 )}
 </div>

 {/* Pricing cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Free plan */}
 <div
 className={`glass rounded-2xl p-6 ${
 subscription.plan === "free"
 ? "ring-1 ring-white/20"
 : ""
 }`}
 >
 <div className="flex items-center gap-3 mb-4">
 <div className="w-10 h-10 rounded-xl bg-surface border border-surface flex items-center justify-center">
 <Zap className="w-5 h-5 text-text" />
 </div>
 <div>
 <h3 className="font-bold text-text">Free</h3>
 <p className="text-xs text-text">Get started with basics</p>
 </div>
 </div>

 <div className="mb-6">
 <div className="flex items-baseline gap-1">
 <span className="text-4xl font-bold text-text">₹0</span>
 <span className="text-sm text-text">/month</span>
 </div>
 </div>

 <div className="space-y-3 mb-6">
 {FREE_FEATURES.map((feature, i) => (
 <div key={i} className="flex items-center gap-3">
 {feature.included ? (
 <Check className="w-4 h-4 text-emerald-400 shrink-0" />
 ) : (
 <X className="w-4 h-4 text-text/20 shrink-0" />
 )}
 <span
 className={`text-sm ${
 feature.included ? "text-text" : "text-text"
 }`}
 >
 {feature.text}
 </span>
 </div>
 ))}
 </div>

 {subscription.plan === "free" ? (
 <div className="w-full py-3 rounded-xl bg-surface border border-surface text-center text-sm font-medium text-text">
 Current plan
 </div>
 ) : (
 <div className="w-full py-3 rounded-xl bg-surface border border-surface text-center text-sm font-medium text-text">
 Free tier
 </div>
 )}
 </div>

 {/* Pro plan */}
 <div className="relative glass rounded-2xl p-6 ring-1 ring-brand">
 <div className="absolute -top-3 left-1/2 -translate-x-1/2">
 <span className="px-3 py-1 rounded-full bg-brand text-xs font-bold text-text shadow-lg shadow-brand">
 RECOMMENDED
 </span>
 </div>

 <div className="flex items-center gap-3 mb-4 mt-2">
 <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand flex items-center justify-center">
 <Crown className="w-5 h-5 text-brand" />
 </div>
 <div>
 <h3 className="font-bold text-text">Pro</h3>
 <p className="text-xs text-text">
 For serious traders
 </p>
 </div>
 </div>

 <div className="mb-6">
 <div className="flex items-baseline gap-1">
 <span className="text-4xl font-bold gradient-text">
 ₹{billingCycle === "monthly" ? monthlyPrice : Math.round(annualPrice / 12)}
 </span>
 <span className="text-sm text-text">/month</span>
 </div>
 {billingCycle === "annual" && (
 <p className="text-xs text-text mt-1">
 ₹{annualPrice} billed annually
 </p>
 )}
 </div>

 <div className="space-y-3 mb-6">
 {PRO_FEATURES.map((feature, i) => (
 <div key={i} className="flex items-center gap-3">
 <Check className="w-4 h-4 text-brand shrink-0" />
 <span className="text-sm text-text">{feature.text}</span>
 </div>
 ))}
 </div>

 {subscription.plan === "pro" ? (
 <div className="w-full py-3 rounded-xl bg-brand/10 border border-brand text-center text-sm font-medium text-brand">
 Current plan
 </div>
 ) : (
 <button
 onClick={handleUpgrade}
 disabled={upgradeLoading}
 className="w-full py-3 rounded-xl gradient-btn text-text font-semibold text-sm hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
 >
 {upgradeLoading ? (
 <>
 <Loader2 className="w-4 h-4 animate-spin" />
 Processing...
 </>
 ) : (
 <>
 <Crown className="w-4 h-4" />
 Upgrade to Pro
 </>
 )}
 </button>
 )}
 </div>
 </div>

 {/* Secure payments notice */}
 <div className="flex items-center justify-center gap-2 text-xs text-text">
 <Shield className="w-3.5 h-3.5" />
 <span>
 Secure payments powered by Razorpay. Cancel anytime.
 </span>
 </div>
 </div>
 );
}
