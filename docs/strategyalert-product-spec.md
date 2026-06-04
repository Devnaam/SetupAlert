# StrategyAlert Product Specification

## Product Overview

**Product Name:** StrategyAlert  
**Domain:** strategyalert.in  
**Tagline:** Never Miss Your Setup Again.

StrategyAlert is a real-time trading alert platform that helps traders stop watching charts all day by monitoring their exact setup and delivering spoken notifications when the setup forms. The launch version is intentionally focused on **Simple Mode**, which lets a trader create an alert using **symbol + price level + candlestick pattern + timeframe** and receive a browser notification plus spoken text-to-speech alert when the condition matches.

The product is designed for fast launch, working monetization, and clean user experience first. Advanced multi-condition strategy logic will come later as a separate **Advanced Mode**, but it is not part of the launch scope.

---

## Core Product Vision

StrategyAlert should feel like a focused trader utility, not a bloated trading terminal.

The first version should do one thing extremely well:

- Let a trader create a setup alert in under 30 seconds.
- Monitor live market data continuously.
- Trigger a highly clear spoken alert when the setup forms.
- Show that event in history.
- Let the user manage alerts from a clean dashboard.
- Support billing from day one using Razorpay.

---

## Problem Statement

Retail traders, especially part-time traders, often trade based on specific setups rather than simple price alerts.

Example setup:

- BTCUSDT
- Level: 71,250
- Pattern: Hammer
- Timeframe: 15 minutes

Current trading tools usually provide generic price alerts, but they do not clearly narrate the full setup context. Because of this, traders still need to reopen charts and manually inspect what happened. This causes missed entries, delayed reactions, and unnecessary screen-watching.

StrategyAlert solves this by turning a setup into a direct spoken event.

Example alert:

> “BTCUSDT hit 71,250 and formed a hammer candle on 15-minute timeframe.”

---

## Launch Scope

### Included in Launch

- Landing page
- Auth screen with email/password and Google login using Supabase Auth
- Dashboard
- Create Alert screen
- History screen
- Billing screen with Razorpay subscription support
- Simple Mode alert creation only
- Browser notification support
- Browser text-to-speech spoken alerts
- Live alert monitoring for crypto symbols
- Alert pause, resume, edit, duplicate, delete
- Free and Pro plans

### Not Included in Launch

- Advanced Mode logic builder
- Multi-condition AND/OR strategies
- RSI, EMA, MACD, volume conditions
- Multi-timeframe confirmation logic
- Telegram alerts
- WhatsApp alerts
- Mobile app
- Broker integrations
- NSE market data
- Backtesting
- Marketplace/templates

---

## Product Modes

### 1. Simple Mode (Launch)

Simple Mode is the only mode exposed to users at launch.

Simple Mode alert structure:

- Symbol
- Price Level
- Candle Pattern
- Timeframe
- Optional custom alert message

Example:

- Symbol: BTCUSDT
- Level: 71250
- Pattern: Hammer
- Timeframe: 15m

Trigger message:

- “BTCUSDT hit 71,250 and formed a hammer candle on 15-minute timeframe.”

### 2. Advanced Mode (Post-launch)

Advanced Mode is planned for later.

Examples of future Advanced Mode:

- Price level + candle pattern + RSI below 30
- Price breakout + retest + volume spike
- EMA cross + candle confirmation
- Multi-timeframe logic
- AND/OR condition chains

Important:

- Database and backend should be designed so Advanced Mode can be added later without a rewrite.
- UI should only expose Simple Mode now.

---

## Target User

### Primary User

Part-time retail trader who:

- trades crypto actively
- cannot stare at charts all day
- understands candlestick setups
- wants fast setup monitoring
- values clean spoken notifications
- is willing to pay for time-saving tools

### Initial User Profile

- Age: 21–40
- Market: Crypto first
- Devices: Laptop first, mobile secondary
- Skill level: Intermediate trader
- Typical behavior: checks markets multiple times a day, trades based on levels and patterns

---

## Core User Flow

### Primary Flow

1. User lands on homepage.
2. User clicks **Create spoken alert**.
3. User signs up or logs in using email/password or Google.
4. User lands on dashboard.
5. User clicks **Create Alert**.
6. User selects symbol.
7. User enters price level.
8. User selects candlestick pattern.
9. User selects timeframe.
10. User optionally customizes alert message.
11. User clicks **Preview Voice**.
12. User hears the exact spoken message.
13. User clicks **Save Alert**.
14. Alert is stored and activated.
15. Backend starts monitoring live market data.
16. When setup condition is satisfied, system triggers:
    - browser notification
    - spoken text-to-speech alert
17. Event is saved to history.
18. User can open history screen and review triggered alerts.
19. User can duplicate, edit, pause, resume, or delete alerts from dashboard.
20. User can upgrade to Pro from billing screen if free limit is reached.

### First-Time User Onboarding Flow

1. User signs in.
2. Dashboard shows zero-state.
3. Zero-state explains what Simple Mode alert means.
4. CTA: **Create Your First Alert**.
5. User is taken to Create Alert screen.
6. After first save, user returns to dashboard and sees active alert card.

---

## Pages Required

## 1. Landing Page

Purpose:

- explain the product clearly
- convert visitors into signups
- show value instantly

### Landing Page Sections

1. Hero section
   - Product name
   - Tagline
   - CTA: Create spoken alert
   - Secondary CTA: Watch demo
2. Problem section
   - Explain why traders miss setups
3. How it works section
   - Choose symbol
   - Add level, candle, timeframe
   - Hear spoken alert
4. Demo alert section
   - Example spoken alert text
5. Features section
   - Spoken alerts
   - Setup-specific logic
   - Clean dashboard
   - Alert history
6. Pricing preview
   - Free vs Pro
7. FAQ
8. Footer

### Hero Copy Recommendation

Headline:

- Never Miss Your Setup Again.

Subheadline:

- Create setup-based spoken market alerts using level, candlestick pattern, and timeframe. StrategyAlert watches the market and tells you exactly when your setup appears.

CTA:

- Create spoken alert

Secondary CTA:

- See how it works

---

## 2. Auth Screen

Purpose:

- allow account creation and login

### Supported Methods

- Email + password signup/login
- Google OAuth using Supabase

### Auth Requirements

- Supabase Auth
- Session persistence
- Redirect after login to dashboard
- Forgot password flow
- Email verification optional for MVP, but recommended

### Screens

- Login
- Signup
- Forgot password

---

## 3. Dashboard

Purpose:

- central place to manage active alerts

### Dashboard Components

- Header with user info
- Active alerts summary
- Current plan badge (Free / Pro)
- Create Alert button
- Alerts list/cards
- Quick actions: pause, resume, edit, duplicate, delete
- Usage indicator:
  - e.g. 2 of 3 alerts used on Free plan
- Upgrade CTA when user is close to limit

### Alert Card Fields

- Symbol
- Price level
- Pattern
- Timeframe
- Status (active/paused)
- Last triggered time
- Created time
- Actions menu

### Empty State

- Heading: No alerts yet
- Copy: Create your first spoken setup alert in under 30 seconds.
- CTA: Create Your First Alert

---

## 4. Create Alert Screen

Purpose:

- let the user configure a Simple Mode alert

### V1 Form Fields

- Symbol dropdown
- Price level input
- Candlestick pattern dropdown
- Timeframe dropdown
- Optional custom message toggle/input
- Preview Voice button
- Save Alert button

### Symbols for Launch

Start with 10 crypto pairs only:

- BTCUSDT
- ETHUSDT
- BNBUSDT
- SOLUSDT
- XRPUSDT
- ADAUSDT
- DOGEUSDT
- AVAXUSDT
- LINKUSDT
- MATICUSDT

### Supported Timeframes for Launch

- 5m
- 15m
- 1h

### Supported Patterns for Launch

- Hammer
- Inverted Hammer
- Bullish Engulfing
- Bearish Engulfing
- Doji
- Shooting Star
- Morning Star
- Evening Star

### Validation Rules

- All required fields must be selected
- Price must be valid numeric value
- Free users cannot exceed alert limit
- Duplicate exact alert for same user should be prevented or warned

### Preview Voice Behavior

- Clicking preview generates the exact final spoken text
- Browser reads it using SpeechSynthesis
- User can edit message before saving

### Default Message Format

If custom message is not provided:

- “{symbol} hit {level} and formed a {pattern} candle on {timeframe} timeframe.”

---

## 5. History Screen

Purpose:

- show all triggered alert events

### History Components

- List/table of triggered alerts
- Filters by symbol, timeframe, pattern, date
- Event details
- Replay spoken message button

### History Event Fields

- Timestamp
- Symbol
- Price level
- Trigger price
- Pattern detected
- Timeframe
- Spoken message
- Delivery status

### Empty State

- No triggered alerts yet

---

## 6. Billing Screen

Purpose:

- manage plan and payments

### Billing Components

- Current plan
- Feature comparison
- Upgrade CTA
- Monthly and yearly options
- Razorpay checkout trigger
- Subscription status
- Renewal date
- Cancel subscription button

### Launch Pricing

#### Free Plan

- ₹0/month
- Up to 3 active alerts
- Crypto symbols only
- Browser spoken alert
- Browser notification
- Basic history

#### Pro Plan

- ₹299/month
- Up to 25 active alerts
- All launch symbols
- Spoken alert preview
- Full history
- Priority future access to upcoming features

#### Annual Plan

- ₹2,499/year
- Same as Pro
- Better retention and discounted effective monthly price

### Billing Logic

- User starts on Free
- If user tries to create more than 3 alerts, show upgrade modal
- Successful Razorpay payment upgrades user to Pro
- Subscription status is synced through webhook

---

## Functional Requirements

## Authentication

- Users must be able to register with email/password
- Users must be able to login with email/password
- Users must be able to login with Google OAuth
- Session must remain active across refresh
- Protected routes must redirect unauthenticated users to auth screen

## Alert Management

- User can create alert
- User can edit alert
- User can duplicate alert
- User can pause alert
- User can resume alert
- User can delete alert
- User can see all active alerts
- User can see total usage count against plan limit

## Alert Processing

- Market data must be monitored continuously for active alerts
- Alerts should evaluate on closed candles for selected timeframe
- Matching should consider:
  - level hit condition
  - candle pattern formed condition
  - selected timeframe
- On trigger, system must:
  - create alert event record
  - send browser notification
  - send spoken message to frontend session if active
  - optionally mark cooldown to prevent duplicate triggers on same candle

## Notification Requirements

- Browser notifications via Notification API
- Spoken alerts via SpeechSynthesis API
- User must grant browser notification permission
- Spoken alert should work from active browser session

## Billing Requirements

- Free and Pro plan access rules
- Razorpay subscription checkout
- Webhook verification
- Subscription status sync in database
- Cancellation support

---

## Technical Architecture

### Frontend

- Next.js (App Router preferred)
- Tailwind CSS
- TypeScript
- Supabase client for auth/session
- Browser Notification API
- SpeechSynthesis API for spoken preview and live spoken alert

### Backend/API

- Next.js API routes or separate Node.js backend
- TypeScript preferred
- REST endpoints for alerts, billing, history
- Secure webhook endpoints for Razorpay

### Worker / Market Engine

Recommended separate worker service.

Options:

- Node.js worker
- Python worker

Recommended for launch:

- Node.js worker if keeping single language stack
- Python worker only if candlestick detection libraries are significantly better for implementation speed

### Database

- Supabase Postgres

### Auth

- Supabase Auth

### Payments

- Razorpay Subscriptions

### Hosting

- Frontend: Vercel
- API/Worker: Render or Railway
- Database/Auth: Supabase

---

## Market Data Strategy

### Launch Market

Crypto only.

### Data Source

- Binance WebSocket market data

### Reason

- free public data access
- easier integration
- no broker onboarding
- no regulatory complexity compared to equities

### Monitoring Strategy

Do not create one websocket per user.

Instead:

- create shared websocket streams per symbol + timeframe
- cache latest candle data
- evaluate all matching active alerts against shared stream

This ensures scalability.

---

## Alert Evaluation Logic

An alert should trigger only when all selected conditions match.

### Launch Simple Mode Logic

For a given closed candle:

1. Check symbol matches stream.
2. Check timeframe matches selected timeframe.
3. Check candle touches or crosses user-defined level.
4. Detect whether selected candlestick pattern formed on the closed candle.
5. If all are true, create event and trigger notification.

### Level Hit Logic Recommendation

Use one of these rules and keep it explicit:

- price level touched within candle high-low range

Example:
If user level = 71,250 and candle has:

- low = 71,180
- high = 71,320
  Then level is considered hit.

This is better than using exact last traded price.

### Duplicate Trigger Prevention

To prevent spam:

- one alert should trigger at most once per candle close
- save last_triggered_candle_time
- do not re-trigger on same closed candle

---

## Recommended Database Schema

## Table: profiles

- id (uuid, matches auth user id)
- full_name
- email
- avatar_url
- created_at
- updated_at

## Table: subscriptions

- id (uuid)
- user_id (uuid)
- plan_name (free, pro, annual)
- status (active, cancelled, expired, past_due)
- razorpay_customer_id
- razorpay_subscription_id
- current_period_start
- current_period_end
- created_at
- updated_at

## Table: alerts

- id (uuid)
- user_id (uuid)
- mode (simple)
- symbol
- price_level (numeric)
- candle_pattern
- timeframe
- custom_message (text, nullable)
- generated_message (text)
- is_active (boolean)
- last_triggered_at (timestamp, nullable)
- last_triggered_candle_time (timestamp, nullable)
- created_at
- updated_at

## Table: alert_events

- id (uuid)
- alert_id (uuid)
- user_id (uuid)
- symbol
- price_level (numeric)
- trigger_price (numeric)
- candle_pattern
- timeframe
- spoken_message
- delivery_status (sent, failed, pending)
- triggered_at
- candle_close_time

## Table: user_settings

- id (uuid)
- user_id (uuid)
- voice_enabled (boolean)
- browser_notifications_enabled (boolean)
- preferred_voice_name (nullable)
- created_at
- updated_at

---

## API Requirements

## Auth

Handled mostly by Supabase client/auth flow.

## Alerts API

### POST /api/alerts

Create a new alert.

Request body:

- symbol
- priceLevel
- candlePattern
- timeframe
- customMessage

### GET /api/alerts

Return all alerts for logged-in user.

### GET /api/alerts/:id

Return single alert.

### PUT /api/alerts/:id

Update alert.

### POST /api/alerts/:id/duplicate

Duplicate existing alert.

### POST /api/alerts/:id/toggle

Pause/resume alert.

### DELETE /api/alerts/:id

Delete alert.

## History API

### GET /api/history

Return paginated alert events for user.

### GET /api/history/:id

Return single event details.

## Billing API

### POST /api/billing/create-subscription

Create Razorpay subscription/order.

### POST /api/billing/webhook

Handle Razorpay webhooks.

### GET /api/billing/current-plan

Return current plan and status.

### POST /api/billing/cancel

Cancel active subscription.

## Worker/Realtime API

### POST /api/internal/trigger-alert

Internal endpoint if worker and app are separated.

Payload:

- alertId
- userId
- spokenMessage
- symbol
- triggerPrice
- candleCloseTime
- candlePattern
- timeframe

---

## Frontend Component Requirements

## Shared Components

- Navbar
- Sidebar or top navigation for app pages
- Alert card
- Usage badge
- Plan badge
- Empty state component
- Confirm delete modal
- Upgrade modal
- Voice preview button
- Toast/notification component

## Landing Components

- Hero
- Problem explanation
- Feature grid
- Pricing preview
- FAQ
- Footer

## Dashboard Components

- Alert summary cards
- Alerts list/table
- Quick action menu

## Create Alert Components

- Alert form
- Symbol selector
- Pattern selector
- Timeframe selector
- Voice preview section

## History Components

- Event table/list
- Filter bar
- Replay voice button

## Billing Components

- Pricing cards
- Current subscription status
- Upgrade button
- Cancellation confirmation

---

## UX Requirements

### Product Principles

- Fast setup creation
- Zero confusion
- Immediate clarity
- Mobile-friendly but desktop-first
- Do not overwhelm users with advanced logic

### UX Rules

- User should create first alert in under 2 minutes
- Simple Mode form should fit on one screen
- Pricing should be obvious
- Dashboard should prioritize active alerts first
- History should be easy to scan
- Empty states should always contain CTA

---

## Plan Limits

### Free

- max 3 active alerts
- access to all launch symbols
- access to all launch patterns
- access to all launch timeframes
- browser notifications
- browser voice alerts

### Pro Monthly

- max 25 active alerts
- same core launch features
- higher alert capacity
- full history retention
- priority access to upcoming features

### Pro Annual

- same as Pro Monthly
- billed yearly

---

## Scalability Design Notes

### Key Rule

Scale by symbol + timeframe streams, not by user count.

### Correct Approach

- one shared stream per symbol-timeframe combination
- group active alerts by symbol and timeframe
- on candle close, evaluate all grouped alerts together

### Example Launch Capacity

If there are:

- 10 symbols
- 3 timeframes
- total 30 possible stream combinations

The worker only needs to subscribe to combinations that actually have active alerts.

### Example Scaling Math

At 1,000 users with average 5 alerts each:

- 5,000 active alerts

If average timeframe is 15m:

- 96 candle closes/day per alert
- 5,000 × 96 = 480,000 evaluations/day

This is manageable if evaluations are lightweight and grouped.

---

## Cost Model

### Likely Monthly Cost at MVP Stage

- Vercel: low or free initially
- Supabase: free initially, then Pro when needed
- Render/Railway worker + API: low monthly server cost
- Domain: already purchased
- Razorpay: transaction-based fee
- Browser TTS: no direct cost

### Lean Estimate

- ₹1,500 to ₹4,500/month at very early stage

### Comfortable Estimate

- ₹4,500 to ₹8,000/month with paid infra headroom

### Why Cost Stays Low

- crypto market data first
- browser TTS instead of paid voice API
- no mobile app at launch
- limited symbols/timeframes
- shared stream architecture

---

## Revenue Model

### Plan Structure

#### Free

- ₹0
- 3 active alerts

#### Pro Monthly

- ₹299/month
- 25 active alerts

#### Pro Annual

- ₹2,499/year
- 25 active alerts

### Monetization Strategy

- free plan drives adoption
- alert limit creates upgrade trigger
- annual plan improves retention

### Future Revenue Expansion (not for launch)

- advanced mode premium plan
- Telegram/WhatsApp delivery add-on
- community bot plans
- template marketplace
- broker/white-label API

---

## Security Requirements

- all user-specific actions require authenticated session
- RLS should be enabled in Supabase for alerts, events, subscriptions, settings
- webhook signatures must be verified for Razorpay
- internal trigger endpoints must not be publicly exposed without protection
- do not expose secret keys in frontend

---

## Error Handling Requirements

- failed alert creation shows inline validation
- failed billing shows retry option
- failed voice preview shows fallback text
- if notification permission denied, app should still allow alert creation and explain limitation
- worker failures must be logged
- alert trigger failures should record delivery_status = failed

---

## Notifications and Browser Constraints

Important launch behavior:

- spoken alerts via browser work best when the user has the site open in browser
- browser notifications can still show if permission granted
- if browser is closed, spoken alert cannot fire through browser-only TTS

This must be communicated honestly in onboarding or FAQ.

Recommended future improvement:

- mobile push / Telegram / WhatsApp / server-side voice delivery

---

## Recommended Build Order

### Phase 1

- project setup
- auth
- landing page
- dashboard shell
- database schema

### Phase 2

- create alert flow
- alert CRUD
- usage limits
- history UI

### Phase 3

- worker integration
- live candle stream processing
- pattern detection
- trigger pipeline

### Phase 4

- browser notifications
- spoken voice preview
- live spoken alert delivery

### Phase 5

- billing screen
- Razorpay checkout
- webhook sync
- Free/Pro restrictions

### Phase 6

- QA
- edge cases
- deployment
- monitoring

---

## Definition of Done

The launch product is complete when:

- landing page is live
- auth works with email/password and Google
- user can create a Simple Mode alert
- alert appears in dashboard
- worker monitors live crypto market data
- matching setup triggers event
- browser notification appears
- spoken alert plays
- event is stored in history
- user can manage billing via Razorpay
- Free/Pro limits work correctly

---

## Non-Negotiable Launch Priorities

1. Working alert engine
2. Clean create-alert UX
3. Reliable spoken alert preview
4. Browser notification + voice trigger
5. Billing and plan limits
6. Dashboard + history clarity

If anything has to be delayed, delay visual polish before delaying core alert reliability.

---

## Future Roadmap (Not Launch Scope)

### After Launch

- Advanced Mode logic builder
- Telegram alerts
- WhatsApp alerts
- Hindi TTS
- NSE support via broker integrations
- mobile PWA improvements
- richer analytics/history
- template library
- strategy marketplace

---

## Final Build Instruction Summary

Build StrategyAlert as a production-ready MVP for launch using **Simple Mode only**.

The delivered platform must include fully working:

- Landing page
- Auth screen
- Dashboard
- Create Alert screen
- History screen
- Billing screen
- Supabase auth with email/password and Google login
- Alert CRUD
- binance -based live crypto monitoring
- candlestick pattern detection on candle close
- browser notification triggers
- browser text-to-speech voice preview and live spoken alert
- Razorpay billing integration
- Free and Pro plan gating

Do not build Advanced Mode yet.
Do not add extra complexity beyond what is necessary for a stable launch.
Optimize for launch speed, reliability, and clarity.
