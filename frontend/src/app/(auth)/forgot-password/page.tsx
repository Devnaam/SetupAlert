"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
 const supabase = createClient();

 const [email, setEmail] = useState("");
 const [error, setError] = useState<string | null>(null);
 const [loading, setLoading] = useState(false);
 const [sent, setSent] = useState(false);

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 setError(null);
 setLoading(true);

 const { error: authError } = await supabase.auth.resetPasswordForEmail(
 email,
 {
 redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
 }
 );

 if (authError) {
 setError(authError.message);
 setLoading(false);
 return;
 }

 setSent(true);
 setLoading(false);
 }

 return (
 <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
 {/* Background effects */}
 <div className="absolute inset-0 bg-background" />
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand/10 blur-[150px] animate-pulse-glow" />

 <div className="relative w-full max-w-md animate-slide-up">
 {/* Logo */}
 <div className="text-center mb-8">
 <Link href="/" className="inline-flex items-center gap-2 group">
 <div className="w-10 h-10 rounded-xl gradient-btn flex items-center justify-center">
 <svg
 className="w-5 h-5 text-text"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 strokeWidth={2}
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.636 18.364a9 9 0 010-12.728M8.464 15.536a5 5 0 010-7.072"
 />
 </svg>
 </div>
 <span className="text-xl font-bold gradient-text">
 SetupAlert
 </span>
 </Link>
 </div>

 {/* Card */}
 <div className="glass rounded-2xl p-8">
 {sent ? (
 <div className="text-center animate-fade-in">
 <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
 <CheckCircle2 className="w-8 h-8 text-emerald-400" />
 </div>
 <h1 className="text-2xl font-bold mb-2">Check your email</h1>
 <p className="text-text text-sm mb-6">
 We&apos;ve sent a password reset link to{" "}
 <span className="text-text font-medium">{email}</span>.
 Check your inbox and follow the instructions to reset your
 password.
 </p>
 <p className="text-text text-xs mb-6">
 Didn&apos;t receive the email? Check your spam folder or{" "}
 <button
 onClick={() => setSent(false)}
 className="text-brand hover:text-brand transition-colors underline"
 >
 try again
 </button>
 </p>
 <Link
 href="/login"
 className="inline-flex items-center gap-2 text-sm text-brand hover:text-brand transition-colors"
 >
 <ArrowLeft className="w-4 h-4" />
 Back to sign in
 </Link>
 </div>
 ) : (
 <>
 <h1 className="text-2xl font-bold text-center mb-2">
 Reset your password
 </h1>
 <p className="text-text text-center mb-8 text-sm">
 Enter your email address and we&apos;ll send you a link to reset
 your password.
 </p>

 {/* Error */}
 {error && (
 <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4 animate-slide-down">
 <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
 <p className="text-sm text-red-400">{error}</p>
 </div>
 )}

 {/* Form */}
 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="space-y-1.5">
 <label className="text-sm font-medium text-text">
 Email address
 </label>
 <div className="relative">
 <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text" />
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 placeholder="you@example.com"
 className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-surface text-text placeholder:text-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all duration-300 text-sm"
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full py-3 rounded-xl gradient-btn text-text font-semibold text-sm hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
 >
 {loading ? (
 <>
 <Loader2 className="w-4 h-4 animate-spin" />
 Sending link...
 </>
 ) : (
 "Send reset link"
 )}
 </button>
 </form>

 <p className="text-center text-sm text-text mt-6">
 <Link
 href="/login"
 className="inline-flex items-center gap-1 text-brand hover:text-brand transition-colors"
 >
 <ArrowLeft className="w-3.5 h-3.5" />
 Back to sign in
 </Link>
 </p>
 </>
 )}
 </div>
 </div>
 </div>
 );
}
