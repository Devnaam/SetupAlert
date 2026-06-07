"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function PricingSection() {
  const [pricingMode, setPricingMode] = useState<"monthly" | "annual">("monthly");
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stickyStyle, setStickyStyle] = useState<React.CSSProperties>({});
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    const handleResize = () => {
      const el = document.getElementById("pricing");
      if (el) {
        const height = el.offsetHeight;
        if (window.innerHeight >= height) {
          // If screen is taller than or equal to the section height, stick to top
          setStickyStyle({ position: "sticky", top: "0px" });
        } else {
          // If section is taller than screen (e.g. mobile), stick to top with a negative offset 
          // so it only pins when the bottom of the section hits the bottom of the screen!
          setStickyStyle({ position: "sticky", top: `${window.innerHeight - height}px` });
        }
      }
    };

    handleResize();
    const timeout = setTimeout(handleResize, 200);
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.removeChild(script);
      clearTimeout(timeout);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/signup");
        return;
      }

      const res = await fetch(`${API_URL}/api/billing/create-subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ planName: pricingMode }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create subscription");
      }

      const data = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        subscription_id: data.data?.id || data.subscription_id,
        name: "SetupAlert",
        description: `Pro Plan (${pricingMode === "monthly" ? "Monthly" : "Annual"})`,
        handler: async function (response: any) {
          try {
            router.push("/dashboard");
          } catch (err) {
            console.error("Post payment error:", err);
          }
        },
        prefill: {
          email: session.user.email,
        },
        theme: {
          color: "#6366f1", 
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setError("Payment failed: " + response.error.description);
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUpgradeLoading(false);
    }
  };

  return (
    <section id="pricing" style={stickyStyle} className="relative min-h-screen flex flex-col justify-center bg-[var(--color-bg-deep)] py-16 md:py-20 border-t border-[var(--color-border)] z-20 overflow-hidden">
      {/* Soft background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--color-accent)]/5 blur-[120px] rounded-full"></div>
      </div>
      
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="mb-10 text-center">
          <h2 className="font-heading font-extrabold text-[36px] md:text-[44px] text-[var(--color-text)] tracking-tight mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-[15px] md:text-[16px] text-[var(--color-text-muted)] max-w-2xl mx-auto mb-8">
            Start tracking your setups for free, or upgrade to Pro for unlimited power and zero restrictions.
          </p>

          {error && (
            <div className="max-w-md mx-auto mb-8 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-[14px]">
              {error}
            </div>
          )}

          {/* Elegant Pill Switch */}
          <div className="flex justify-center">
            <div className="bg-[var(--color-bg-card)] p-1.5 rounded-full border border-[var(--color-border)] inline-flex relative shadow-sm">
              <button 
                onClick={() => setPricingMode("monthly")}
                className={`relative z-10 w-32 py-2.5 rounded-full text-[15px] font-semibold transition-colors duration-300 focus-ring outline-none ${pricingMode === "monthly" ? "text-[var(--color-bg-deep)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setPricingMode("annual")}
                className={`relative z-10 w-32 py-2.5 rounded-full text-[15px] font-semibold transition-colors duration-300 focus-ring outline-none ${pricingMode === "annual" ? "text-[var(--color-bg-deep)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`}
              >
                Annual
              </button>
              {/* Active slider background */}
              <div 
                className="absolute top-1.5 bottom-1.5 left-1.5 w-32 bg-[var(--color-text)] rounded-full transition-transform duration-300 ease-out shadow-md"
                style={{ transform: pricingMode === "annual" ? "translateX(100%)" : "translateX(0)" }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch max-w-4xl mx-auto">
          
          {/* Free Tier */}
          <div className="bg-[var(--color-bg-card)] rounded-3xl p-8 lg:p-10 border border-[var(--color-border)] shadow-sm flex flex-col transition-transform hover:-translate-y-1 duration-300">
            <h3 className="font-heading font-semibold text-[20px] text-[var(--color-text-muted)] mb-1">Free</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-heading font-extrabold text-[40px] text-[var(--color-text)] tracking-tight">₹0</span>
              <span className="text-[var(--color-text-muted)] font-medium">/month</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-grow text-[14px] text-[var(--color-text)]">
              <li className="flex gap-3 items-center">
                <div className="w-5 h-5 rounded-full bg-[var(--color-text-muted)]/10 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                3 active alerts
              </li>
              <li className="flex gap-3 items-center">
                <div className="w-5 h-5 rounded-full bg-[var(--color-text-muted)]/10 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                10 basic symbols
              </li>
              <li className="flex gap-3 items-center">
                <div className="w-5 h-5 rounded-full bg-[var(--color-text-muted)]/10 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                Browser voice alerts
              </li>
              <li className="flex gap-3 items-center">
                <div className="w-5 h-5 rounded-full bg-[var(--color-text-muted)]/10 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                Basic 7-day history
              </li>
            </ul>
            
            <Link href="/signup" className="mt-auto w-full block text-center min-h-[48px] leading-[48px] bg-transparent text-[var(--color-text)] border-2 border-[var(--color-border)] hover:border-[var(--color-text)] rounded-xl text-[15px] font-semibold transition-colors focus-ring outline-none">
              Get Started Free
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="bg-gradient-to-b from-[var(--color-accent)]/10 to-[var(--color-bg-card)] rounded-3xl p-8 lg:p-10 ring-2 ring-[var(--color-accent)] relative flex flex-col shadow-2xl transition-transform hover:-translate-y-1 duration-300">
            <div className="absolute -top-3.5 inset-x-0 flex justify-center">
              <div className="bg-[var(--color-accent)] text-[var(--color-btn-text)] text-[12px] font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-md">
                {pricingMode === "annual" ? "Best Value" : "Most Popular"}
              </div>
            </div>

            <h3 className="font-heading font-semibold text-[20px] text-[var(--color-accent)] mb-1">Pro</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-heading font-extrabold text-[40px] text-[var(--color-text)] tracking-tight">
                {pricingMode === "monthly" ? "₹299" : "₹208"}
              </span>
              <span className="text-[var(--color-text-muted)] font-medium">/month</span>
            </div>
            
            {/* Height placeholder to prevent jumping */}
            <div className="h-5 mb-5">
              {pricingMode === "annual" && (
                <span className="text-[13px] text-[var(--color-accent)] font-medium">Billed ₹2,499 yearly. Save 2 months.</span>
              )}
            </div>
            
            <ul className="space-y-4 mb-8 flex-grow text-[14px] text-[var(--color-text)]">
              <li className="flex gap-3 items-center">
                <div className="w-5 h-5 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <strong className="font-semibold">25 active alerts</strong>
              </li>
              <li className="flex gap-3 items-center">
                <div className="w-5 h-5 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                All symbols supported
              </li>
              <li className="flex gap-3 items-center">
                <div className="w-5 h-5 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                All alert types (Level + Pattern)
              </li>
              <li className="flex gap-3 items-center">
                <div className="w-5 h-5 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                Full trigger history
              </li>
              <li className="flex gap-3 items-center">
                <div className="w-5 h-5 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                Voice preview testing
              </li>
            </ul>
            
            <button 
              onClick={handleUpgrade}
              disabled={upgradeLoading}
              className="mt-auto w-full flex items-center justify-center min-h-[48px] bg-[var(--color-accent)] text-[var(--color-btn-text)] rounded-xl text-[15px] font-bold hover:opacity-90 hover:shadow-lg transition-all duration-300 focus-ring outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {upgradeLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-[var(--color-btn-text)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : null}
              {upgradeLoading ? "Processing..." : (pricingMode === "monthly" ? "Start Pro" : "Start Annual")}
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
