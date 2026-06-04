# StrategyAlert

> Never Miss Your Setup Again.

Real-time trading alert platform that monitors crypto markets and delivers spoken notifications when your candlestick setup forms.

## Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router), Tailwind CSS, TypeScript |
| Backend API | Node.js + Express, TypeScript |
| Worker | Node.js background process, TypeScript |
| Database + Auth | Supabase (Postgres + Auth + Realtime) |
| Payments | Razorpay Subscriptions |
| Market Data | Binance WebSocket (free, no API key required) |
| Voice | Browser SpeechSynthesis API |

## Project Structure

```
strategyalert/
├── frontend/          → Next.js app (deploy to Vercel)
├── backend/           → Express API + Worker (deploy to Render)
└── docs/              → Product specs and documentation
```

## Setup

### Prerequisites

- Node.js 18+
- npm
- Supabase project (with Auth configured)
- Razorpay account (test mode)

### 1. Database

Run the migration SQL in your Supabase SQL Editor:

```
backend/src/db/migrations/0001_initial_schema.sql
```

This creates all tables (profiles, subscriptions, alerts, alert_events, user_settings) with RLS policies and triggers.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Fill in your Supabase and Razorpay credentials
npm install
npm run dev          # Start API server on port 4000
npm run dev:worker   # Start worker process (separate terminal)
```

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Fill in your Supabase public keys and API URL
npm install
npm run dev          # Start on port 3000
```

### 4. Supabase Auth Setup

1. Enable Email/Password auth in Supabase Dashboard
2. Enable Google OAuth provider
3. Set redirect URL to `http://localhost:3000/api/auth/callback`

### 5. Razorpay Setup

1. Create a Razorpay test account
2. Create two subscription plans:
   - Pro Monthly: ₹299/month
   - Pro Annual: ₹2,499/year
3. Add plan IDs to backend `.env`
4. Set webhook URL to `https://your-api-domain.com/api/billing/webhook`

## Deployment

### Frontend → Vercel

```bash
cd frontend
vercel --prod
```

### Backend → Render

Deploy as two services from the `backend/` directory:
1. **API Service**: `npm start` (Web Service)
2. **Worker Service**: `npm run start:worker` (Background Worker)

## Monitoring

- Use [UptimeRobot](https://uptimerobot.com) to monitor:
  - Frontend: `https://strategyalert.in`
  - Backend API: `https://api.strategyalert.in/api/health`
  - Worker health endpoint (if exposed)

## Key Features

- **Simple Mode Alerts**: Symbol + Price Level + Candlestick Pattern + Timeframe
- **8 Candlestick Patterns**: Hammer, Inverted Hammer, Bullish Engulfing, Bearish Engulfing, Doji, Shooting Star, Morning Star, Evening Star
- **10 Crypto Pairs**: BTCUSDT, ETHUSDT, BNBUSDT, SOLUSDT, XRPUSDT, ADAUSDT, DOGEUSDT, AVAXUSDT, LINKUSDT, MATICUSDT
- **3 Timeframes**: 5m, 15m, 1h
- **Browser Notifications**: Native Notification API
- **Spoken Alerts**: SpeechSynthesis API
- **Real-time**: Supabase Realtime for instant trigger delivery
- **Billing**: Free (3 alerts) and Pro (25 alerts) plans via Razorpay

## License

Proprietary. All rights reserved.
