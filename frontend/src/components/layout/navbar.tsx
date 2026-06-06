'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
 Bell,
 ChevronDown,
 LogOut,
 Settings,
 User,
 Menu,
 X,
} from 'lucide-react';

const navLinks = [
 { href: '/dashboard', label: 'Dashboard' },
 { href: '/history', label: 'History' },
 { href: '/billing', label: 'Billing' },
];

export function Navbar() {
 const pathname = usePathname();
 const [menuOpen, setMenuOpen] = useState(false);
 const [userMenuOpen, setUserMenuOpen] = useState(false);
 const userMenuRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 function handleClickOutside(e: MouseEvent) {
 if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
 setUserMenuOpen(false);
 }
 }
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 return (
 <nav className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-surface/[0.06]">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex items-center justify-between h-16">
 {/* Logo */}
 <Link href="/dashboard" className="flex items-center gap-2 group">
 <div className="w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-lg shadow-brand">
 <Bell className="h-4 w-4 text-text" />
 </div>
 <span className="text-xl font-bold bg-brand bg-clip-text text-transparent">
 SetupAlert
 </span>
 </Link>

 {/* Desktop Nav */}
 <div className="hidden md:flex items-center gap-1">
 {navLinks.map((link) => {
 const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
 return (
 <Link
 key={link.href}
 href={link.href}
 className={`
 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
 ${isActive
 ? 'text-text bg-surface'
 : 'text-gray-400 hover:text-text hover:bg-surface'
 }
 `}
 >
 {link.label}
 </Link>
 );
 })}
 </div>

 {/* Right side */}
 <div className="flex items-center gap-3">
 {/* User dropdown */}
 <div className="relative" ref={userMenuRef}>
 <button
 onClick={() => setUserMenuOpen(!userMenuOpen)}
 className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm text-gray-300 hover:text-text hover:bg-surface transition-all duration-200"
 >
 <div className="w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center">
 <User className="h-3.5 w-3.5 text-text" />
 </div>
 <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
 </button>

 {userMenuOpen && (
 <div className="absolute right-0 mt-2 w-48 bg-[#12121a]/95 backdrop-blur-xl border border-surface rounded-xl shadow-2xl shadow-black/50 py-1 animate-in fade-in zoom-in-95 duration-200">
 <Link
 href="/settings"
 className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:text-text hover:bg-surface transition-colors duration-200"
 onClick={() => setUserMenuOpen(false)}
 >
 <Settings className="h-4 w-4" />
 Settings
 </Link>
 <button
 onClick={() => {
 setUserMenuOpen(false);
 window.location.href = '/auth/logout';
 }}
 className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-300 hover:text-red-400 hover:bg-surface transition-colors duration-200"
 >
 <LogOut className="h-4 w-4" />
 Logout
 </button>
 </div>
 )}
 </div>

 {/* Mobile menu toggle */}
 <button
 onClick={() => setMenuOpen(!menuOpen)}
 className="md:hidden p-2 rounded-xl text-gray-400 hover:text-text hover:bg-surface transition-colors duration-200"
 >
 {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
 </button>
 </div>
 </div>
 </div>

 {/* Mobile Nav */}
 {menuOpen && (
 <div className="md:hidden border-t border-surface bg-background/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
 <div className="px-4 py-3 space-y-1">
 {navLinks.map((link) => {
 const isActive = pathname === link.href;
 return (
 <Link
 key={link.href}
 href={link.href}
 onClick={() => setMenuOpen(false)}
 className={`
 block px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
 ${isActive
 ? 'text-text bg-surface'
 : 'text-gray-400 hover:text-text hover:bg-surface'
 }
 `}
 >
 {link.label}
 </Link>
 );
 })}
 </div>
 </div>
 )}
 </nav>
 );
}
