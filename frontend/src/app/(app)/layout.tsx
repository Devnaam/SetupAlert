"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
 LayoutDashboard,
 Bell,
 History,
 CreditCard,
 LogOut,
 Menu,
 X,
 ChevronRight,
 ChevronLeft,
 Volume2,
 LineChart,
} from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const sidebarLinks = [
 { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
 { href: "/charts", label: "Charts", icon: LineChart },
 { href: "/alerts", label: "Create Alert", icon: Bell },
 { href: "/history", label: "History", icon: History },
 { href: "/billing", label: "Billing", icon: CreditCard },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
 const router = useRouter();
 const pathname = usePathname();
 const supabase = createClient();

 const [user, setUser] = useState<User | null>(null);
 const [loading, setLoading] = useState(true);
 const [sidebarOpen, setSidebarOpen] = useState(false);
 const [isCollapsed, setIsCollapsed] = useState(false);

 useEffect(() => {
 async function getUser() {
 const {
 data: { session },
 } = await supabase.auth.getSession();

 if (!session) {
 router.push("/login");
 return;
 }

 setUser(session.user);
 setLoading(false);
 }

 getUser();

 const {
 data: { subscription },
 } = supabase.auth.onAuthStateChange((_event, session) => {
 if (!session) {
 router.push("/login");
 return;
 }
 setUser(session.user);
 });

 return () => subscription.unsubscribe();
 }, [supabase, router]);

 const speakAlert = useCallback((message: string, count: number = 1) => {
 if ("speechSynthesis" in window) {
 for (let i = 0; i < count; i++) {
 const utterance = new SpeechSynthesisUtterance(message);
 
 // Select a natural human voice instead of the default robot
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
 utterance.volume = 1;
 window.speechSynthesis.speak(utterance);
 }
 }
 }, []);

 const showBrowserNotification = useCallback(
 (title: string, body: string) => {
 if ("Notification" in window && Notification.permission === "granted") {
 new Notification(title, {
 body,
 icon: "/favicon.ico",
 badge: "/favicon.ico",
 });
 }
 },
 []
 );

 useEffect(() => {
 if (!user) return;

 if ("Notification" in window && Notification.permission === "default") {
 Notification.requestPermission();
 }

 const channel = supabase
 .channel("alert-events-realtime")
 .on(
 "postgres_changes",
 {
 event: "INSERT",
 schema: "public",
 table: "alert_events",
 filter: `user_id=eq.${user.id}`,
 },
 (payload) => {
 const event = payload.new as {
 spoken_message?: string;
 symbol?: string;
 pattern?: string;
 play_count?: number;
 };

 const message =
 event.spoken_message ||
 `${event.symbol} triggered: ${event.pattern}`;
 
 const playCount = event.play_count || 1;

 speakAlert(message, playCount);
 showBrowserNotification("SetupAlert", message);
 }
 )
 .subscribe();

 return () => {
 supabase.removeChannel(channel);
 };
 }, [user, supabase, speakAlert, showBrowserNotification]);

 async function handleLogout() {
 await supabase.auth.signOut();
 router.push("/login");
 router.refresh();
 }

 if (loading) {
 return (
 <div className="min-h-screen bg-background flex items-center justify-center">
 <div className="flex flex-col items-center gap-4 animate-fade-in">
 <div className="w-12 h-12 rounded-xl gradient-btn flex items-center justify-center animate-pulse">
 <Volume2 className="w-6 h-6 text-text" />
 </div>
 <div className="w-48 h-1 rounded-full bg-surface overflow-hidden">
 <div className="h-full w-1/2 rounded-full bg-brand animate-shimmer" />
 </div>
 </div>
 </div>
 );
 }

 const userInitial =
 user?.user_metadata?.full_name?.[0] ||
 user?.email?.[0]?.toUpperCase() ||
 "U";
 const userName = user?.user_metadata?.full_name || user?.email || "User";

 return (
 <div className="h-screen bg-background flex overflow-hidden">
 {/* Mobile sidebar overlay */}
 {sidebarOpen && (
 <div
 className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
 onClick={() => setSidebarOpen(false)}
 />
 )}

 {/* Sidebar */}
 <aside
 className={`fixed inset-y-0 left-0 z-50 bg-background border-r border-surface flex flex-col transform transition-all duration-300 lg:translate-x-0 lg:static lg:z-auto ${
 sidebarOpen ? "translate-x-0" : "-translate-x-full"
 } ${isCollapsed ? "w-20" : "w-64"}`}
 >
 {/* Sidebar header */}
 <div className={`flex items-center h-16 px-6 border-b border-surface ${isCollapsed ? "justify-center" : "justify-between"}`}>
 <Link
 href="/dashboard"
 className="flex items-center gap-2.5 group"
 >
 <div className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center shrink-0">
 <svg
 className="w-4 h-4 text-text"
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
 {!isCollapsed && (
 <span className="text-lg font-bold gradient-text">
 SetupAlert
 </span>
 )}
 </Link>
 {!isCollapsed && (
 <button
 onClick={() => setSidebarOpen(false)}
 className="lg:hidden text-text hover:text-text transition-colors"
 >
 <X className="w-5 h-5" />
 </button>
 )}
 </div>

 {/* Nav links */}
 <nav className="flex-1 px-3 py-4 space-y-1">
 {sidebarLinks.map((link) => {
 const isActive =
 pathname === link.href ||
 (link.href !== "/dashboard" && pathname?.startsWith(link.href));
 return (
 <Link
 key={link.href}
 href={link.href}
 onClick={() => setSidebarOpen(false)}
 className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
 isActive
 ? "bg-brand/10 text-brand border border-brand"
 : "text-text hover:text-text hover:bg-surface"
 } ${isCollapsed ? "justify-center" : "gap-3"}`}
 title={isCollapsed ? link.label : undefined}
 >
 <link.icon
 className={`w-[18px] h-[18px] shrink-0 ${
 isActive
 ? "text-brand"
 : "text-text group-hover:text-text"
 }`}
 />
 {!isCollapsed && <span>{link.label}</span>}
 {isActive && !isCollapsed && (
 <ChevronRight className="w-4 h-4 ml-auto text-brand/50" />
 )}
 </Link>
 );
 })}
 </nav>

 {/* Sidebar footer */}
 <div className="px-3 py-4 border-t border-surface flex flex-col gap-2">
 <div className={`flex items-center px-3 py-2 ${isCollapsed ? "justify-center" : "gap-3 mb-2"}`}>
 <div className="w-8 h-8 rounded-full gradient-btn flex items-center justify-center text-sm font-bold shrink-0" title={isCollapsed ? userName : undefined}>
 {userInitial}
 </div>
 {!isCollapsed && (
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-text truncate">
 {userName}
 </p>
 <p className="text-xs text-text truncate">{user?.email}</p>
 </div>
 )}
 </div>
 <button
 onClick={handleLogout}
 className={`flex items-center rounded-xl text-sm font-medium text-text hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 w-full ${isCollapsed ? "justify-center p-2.5" : "px-3 py-2.5 gap-3"}`}
 title={isCollapsed ? "Sign out" : undefined}
 >
 <LogOut className="w-[18px] h-[18px] shrink-0" />
 {!isCollapsed && "Sign out"}
 </button>
 
 <button
 onClick={() => setIsCollapsed(!isCollapsed)}
 className={`hidden lg:flex items-center rounded-xl text-sm font-medium text-text/50 hover:text-text hover:bg-surface transition-all duration-200 w-full ${isCollapsed ? "justify-center p-2.5" : "px-3 py-2.5 gap-3"}`}
 title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
 >
 {isCollapsed ? <ChevronRight className="w-[18px] h-[18px] shrink-0" /> : <ChevronLeft className="w-[18px] h-[18px] shrink-0" />}
 {!isCollapsed && "Collapse"}
 </button>
 </div>
 </aside>

 {/* Main content */}
 <div className="flex-1 flex flex-col min-w-0">
 {/* Top bar */}
 <header className="h-16 border-b border-surface flex items-center px-4 lg:px-8 shrink-0 bg-background/80 backdrop-blur-xl sticky top-0 z-30">
 <button
 onClick={() => setSidebarOpen(true)}
 className="lg:hidden text-text hover:text-text transition-colors mr-4"
 >
 <Menu className="w-5 h-5" />
 </button>

 <div className="flex-1" />

 <div className="flex items-center gap-3">
 <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
 <span className="text-xs font-medium text-emerald-400">
 Live
 </span>
 </div>
 </div>
 </header>

 {/* Page content */}
 <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
 </div>
 </div>
 );
}
