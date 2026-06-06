'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
 LayoutDashboard,
 Plus,
 Clock,
 CreditCard,
 ChevronLeft,
 ChevronRight,
} from 'lucide-react';

const sidebarItems = [
 { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
 { href: '/dashboard/create', label: 'Create Alert', icon: Plus },
 { href: '/history', label: 'History', icon: Clock },
 { href: '/billing', label: 'Billing', icon: CreditCard },
];

export function Sidebar() {
 const pathname = usePathname();
 const [collapsed, setCollapsed] = useState(false);

 return (
 <>
 {/* Desktop Sidebar */}
 <aside
 className={`
 hidden lg:flex flex-col h-[calc(100vh-64px)] sticky top-16
 bg-background/50 backdrop-blur-xl border-r border-surface/[0.06]
 transition-all duration-300 ease-out
 ${collapsed ? 'w-[72px]' : 'w-60'}
 `}
 >
 <div className="flex-1 py-4 px-3 space-y-1">
 {sidebarItems.map((item) => {
 const Icon = item.icon;
 const isActive =
 pathname === item.href ||
 (item.href !== '/dashboard' && pathname?.startsWith(item.href));
 const isDashboardActive =
 item.href === '/dashboard' && pathname === '/dashboard';

 const active = isActive || isDashboardActive;

 return (
 <Link
 key={item.href}
 href={item.href}
 title={collapsed ? item.label : undefined}
 className={`
 flex items-center gap-3 px-3 py-2.5 rounded-xl
 text-sm font-medium transition-all duration-200
 group relative
 ${active
 ? 'text-text bg-brand /15 /15 border border-brand'
 : 'text-gray-400 hover:text-text hover:bg-surface border border-transparent'
 }
 `}
 >
 <Icon
 className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
 active ? 'text-brand' : 'text-gray-500 group-hover:text-gray-300'
 }`}
 />
 {!collapsed && <span>{item.label}</span>}
 {active && (
 <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand/10 rounded-r-full" />
 )}
 </Link>
 );
 })}
 </div>

 {/* Collapse button */}
 <div className="p-3 border-t border-surface">
 <button
 onClick={() => setCollapsed(!collapsed)}
 className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-500 hover:text-gray-300 hover:bg-surface transition-all duration-200"
 >
 {collapsed ? (
 <ChevronRight className="h-4 w-4" />
 ) : (
 <>
 <ChevronLeft className="h-4 w-4" />
 <span>Collapse</span>
 </>
 )}
 </button>
 </div>
 </aside>

 {/* Mobile Bottom Nav */}
 <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-surface/[0.06]">
 <div className="flex items-center justify-around py-2 px-2">
 {sidebarItems.map((item) => {
 const Icon = item.icon;
 const isActive =
 pathname === item.href ||
 (item.href !== '/dashboard' && pathname?.startsWith(item.href));
 const isDashboardActive =
 item.href === '/dashboard' && pathname === '/dashboard';
 const active = isActive || isDashboardActive;

 return (
 <Link
 key={item.href}
 href={item.href}
 className={`
 flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl
 transition-all duration-200 min-w-[60px]
 ${active
 ? 'text-brand'
 : 'text-gray-500 hover:text-gray-300'
 }
 `}
 >
 <Icon className="h-5 w-5" />
 <span className="text-[10px] font-medium">{item.label}</span>
 </Link>
 );
 })}
 </div>
 </div>
 </>
 );
}
