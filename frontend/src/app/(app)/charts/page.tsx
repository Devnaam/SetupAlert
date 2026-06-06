import TradingViewWidget from "@/components/TradingViewWidget";
import { LineChart } from "lucide-react";

export default function ChartsPage() {
 return (
 <div className="max-w-7xl mx-auto space-y-8 animate-fade-in h-[calc(100vh-8rem)] flex flex-col">
 <div className="flex items-center justify-between">
 <div>
 <div className="flex items-center gap-3 mb-2">
 <div className="w-10 h-10 rounded-xl gradient-btn flex items-center justify-center shadow-lg shadow-brand">
 <LineChart className="w-5 h-5 text-text" />
 </div>
 <h1 className="text-3xl font-bold text-text tracking-tight">Live Charts</h1>
 </div>
 <p className="text-text text-sm">Real-time market data powered by TradingView</p>
 </div>
 </div>

 <div className="flex-1 glass rounded-3xl border border-surface overflow-hidden p-1">
 <TradingViewWidget />
 </div>
 </div>
 );
}
