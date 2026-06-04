# StrategyAlert — Folder Structure

## Root Layout

```
strategyalert/
├── frontend/
├── backend/
├── docs/
│   ├── prd.md
│   ├── folder-structure.md
│   └── pattern-detection-rules.md
├── .gitignore
└── README.md
```

The root holds two completely independent apps — `frontend` and `backend` — so they can be deployed separately, developed independently, and scaled independently. `docs` holds all product reference files.

---

## Frontend

```
frontend/
├── public/
│   ├── favicon.ico
│   └── og-image.png
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   └── page.tsx                    ← Landing page
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   ├── (app)/
│   │   │   ├── layout.tsx                  ← App shell with sidebar/nav
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── alerts/
│   │   │   │   ├── page.tsx                ← Create alert
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx            ← Edit alert
│   │   │   ├── history/
│   │   │   │   └── page.tsx
│   │   │   └── billing/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── callback/
│   │   │           └── route.ts            ← Supabase OAuth callback
│   │   ├── layout.tsx                      ← Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── card.tsx
│   │   │   └── empty-state.tsx
│   │   ├── layout/
│   │   │   ├── navbar.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── footer.tsx
│   │   ├── alerts/
│   │   │   ├── alert-card.tsx
│   │   │   ├── alert-form.tsx
│   │   │   ├── voice-preview-button.tsx
│   │   │   ├── usage-badge.tsx
│   │   │   └── upgrade-modal.tsx
│   │   ├── history/
│   │   │   ├── event-table.tsx
│   │   │   ├── event-row.tsx
│   │   │   └── replay-voice-button.tsx
│   │   └── billing/
│   │       ├── pricing-card.tsx
│   │       └── subscription-status.tsx
│   ├── hooks/
│   │   ├── use-alerts.ts
│   │   ├── use-history.ts
│   │   ├── use-billing.ts
│   │   ├── use-voice.ts
│   │   └── use-notifications.ts
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                   ← Browser Supabase client
│   │   │   └── server.ts                   ← Server Supabase client
│   │   ├── voice.ts                        ← SpeechSynthesis wrapper
│   │   ├── notifications.ts                ← Browser Notification API wrapper
│   │   ├── message-builder.ts              ← Alert spoken message generator
│   │   └── razorpay.ts                     ← Razorpay client helpers
│   ├── types/
│   │   ├── alert.ts
│   │   ├── history.ts
│   │   ├── billing.ts
│   │   └── user.ts
│   └── config/
│       ├── symbols.ts                      ← Supported symbols list
│       ├── patterns.ts                     ← Supported patterns list
│       └── timeframes.ts                   ← Supported timeframes list
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Backend

```
backend/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── alerts.ts                   ← Alert CRUD routes
│   │   │   ├── history.ts                  ← History fetch routes
│   │   │   ├── billing.ts                  ← Billing and subscription routes
│   │   │   └── internal.ts                 ← Internal trigger endpoint
│   │   └── middleware/
│   │       ├── auth.ts                     ← Supabase session verification
│   │       ├── plan-guard.ts               ← Plan limit enforcement
│   │       └── webhook-verify.ts           ← Razorpay webhook signature check
│   ├── worker/
│   │   ├── stream-manager.ts               ← Manages Binance WebSocket connections
│   │   ├── candle-cache.ts                 ← Caches latest closed candles per symbol-timeframe
│   │   ├── alert-evaluator.ts              ← Evaluates user alerts against candle data
│   │   ├── trigger-dispatcher.ts           ← Fires notification on match
│   │   └── cooldown-tracker.ts             ← Prevents duplicate triggers per candle
│   ├── patterns/
│   │   ├── index.ts                        ← Pattern detection registry/router
│   │   ├── hammer.ts
│   │   ├── inverted-hammer.ts
│   │   ├── bullish-engulfing.ts
│   │   ├── bearish-engulfing.ts
│   │   ├── doji.ts
│   │   ├── shooting-star.ts
│   │   ├── morning-star.ts
│   │   └── evening-star.ts
│   ├── services/
│   │   ├── alert.service.ts                ← DB operations for alerts
│   │   ├── history.service.ts              ← DB operations for events
│   │   ├── billing.service.ts              ← Razorpay + subscription logic
│   │   └── notification.service.ts         ← Push/notification dispatch
│   ├── lib/
│   │   ├── supabase.ts                     ← Supabase service client
│   │   ├── razorpay.ts                     ← Razorpay SDK wrapper
│   │   ├── binance.ts                      ← Binance WebSocket helper
│   │   └── logger.ts
│   ├── types/
│   │   ├── candle.ts
│   │   ├── alert.ts
│   │   ├── pattern.ts
│   │   └── billing.ts
│   ├── config/
│   │   ├── symbols.ts
│   │   ├── patterns.ts
│   │   └── timeframes.ts
│   └── app.ts                              ← Express app entry
├── tests/
│   ├── patterns/
│   │   ├── hammer.test.ts
│   │   ├── inverted-hammer.test.ts
│   │   ├── bullish-engulfing.test.ts
│   │   ├── bearish-engulfing.test.ts
│   │   ├── doji.test.ts
│   │   ├── shooting-star.test.ts
│   │   ├── morning-star.test.ts
│   │   └── evening-star.test.ts
│   └── worker/
│       ├── alert-evaluator.test.ts
│       └── cooldown-tracker.test.ts
├── .env
├── tsconfig.json
└── package.json
```

---

## Shared Config Convention

Both `frontend` and `backend` have their own `config/symbols.ts`, `config/patterns.ts`, and `config/timeframes.ts`. These are intentionally duplicated rather than shared through a monorepo package, to keep both apps deployable independently.

When you add a new symbol, timeframe, or pattern to the supported list, update both config files.

---

## Key Design Decisions

- `frontend` deploys to **Vercel** independently
- `backend` (API + Worker) deploys to **Render** or **Railway** independently
- `backend/src/worker/` runs as a long-lived background process separate from the HTTP API
- `backend/src/patterns/` contains one file per pattern for isolated testing and maintenance
- `backend/src/api/middleware/auth.ts` verifies Supabase JWT on every protected request
- Worker communicates trigger events back to frontend via **Supabase Realtime** channel, so the frontend receives alert triggers without polling
