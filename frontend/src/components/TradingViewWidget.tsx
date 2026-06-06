"use client";

import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget() {
 const container = useRef<HTMLDivElement>(null);

 useEffect(() => {
 if (!container.current) return;
 
 // Clear any existing script to avoid duplicates on fast refresh
 container.current.innerHTML = '';

 const script = document.createElement("script");
 script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
 script.type = "text/javascript";
 script.async = true;
 script.innerHTML = `
 {
 "autosize": true,
 "symbol": "BINANCE:BTCUSDT",
 "interval": "15",
 "timezone": "Etc/UTC",
 "theme": "dark",
 "style": "1",
 "locale": "en",
 "enable_publishing": false,
 "backgroundColor": "#222831",
 "gridColor": "#393E46",
 "allow_symbol_change": true,
 "details": true,
 "hotlist": true,
 "calendar": true,
 "show_popup_button": true,
 "popup_width": "1000",
 "popup_height": "650",
 "container_id": "tradingview_chart",
 "support_host": "https://www.tradingview.com"
 }
 `;
 container.current.appendChild(script);
 }, []);

 return (
 <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
 <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
 </div>
 );
}

export default memo(TradingViewWidget);
