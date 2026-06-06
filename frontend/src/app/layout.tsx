import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
 subsets: ["latin"],
 display: "swap",
 variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
 subsets: ["latin"],
 display: "swap",
 variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
 title: "StrategyAlert.in - Never Miss Your Setup Again",
 description:
 "Create strategy-based trading alerts using price levels, candlestick patterns, and timeframes. Get notified exactly when your setup forms.",
 keywords: [
 "trading alerts",
 "crypto alerts",
 "candlestick patterns",
 "spoken alerts",
 "price alerts",
 "trading bot",
 "BTCUSDT",
 "real-time alerts",
 ],
 authors: [{ name: "StrategyAlert" }],
 openGraph: {
 type: "website",
 locale: "en_US",
 url: "https://strategyalert.in",
 siteName: "StrategyAlert",
 title: "StrategyAlert.in - Never Miss Your Setup Again",
 description:
 "Create strategy-based trading alerts using price levels, candlestick patterns, and timeframes. Get notified exactly when your setup forms.",
 images: [
 {
 url: "/og-image.png",
 width: 1200,
 height: 630,
 alt: "StrategyAlert — Real-time spoken trading alerts",
 },
 ],
 },
 twitter: {
 card: "summary_large_image",
 title: "StrategyAlert.in - Never Miss Your Setup Again",
 description:
 "Create strategy-based trading alerts using price levels, candlestick patterns, and timeframes.",
 images: ["/og-image.png"],
 },
 metadataBase: new URL(
 process.env.NEXT_PUBLIC_APP_URL || "https://strategyalert.in"
 ),
 icons: {
 icon: "/favicon.ico",
 },
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
 <head>
 <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
 </head>
 <body className="bg-background text-on-surface font-body-md min-h-screen selection:bg-primary-container selection:text-on-primary-container antialiased">
 <div id="toast-root" />
 {children}
 </body>
 </html>
 );
}
