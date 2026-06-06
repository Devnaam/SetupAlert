# SetupAlert — Candlestick Pattern Detection Rules

## Purpose

This document defines exact detection rules for every candlestick pattern supported in SetupAlert's Simple Mode alert engine. The rules are written so that two engineers implementing the same pattern independently would produce identical results given identical OHLCV input.

All pattern detection runs only on **closed candles**. Detection must never run on the current live candle.

---

## Shared Definitions and Notation

### Candle Fields
Every candle has the following fields:

| Field | Symbol | Description |
|---|---|---|
| Open | O | Opening price of the candle |
| High | H | Highest price during the candle |
| Low | L | Lowest price during the candle |
| Close | C | Closing price of the candle |

### Derived Measurements

```
body_size       = abs(C - O)
full_range      = H - L
upper_wick      = H - max(O, C)
lower_wick      = min(O, C) - L
is_bullish      = C > O
is_bearish      = C < O
mid_body        = (O + C) / 2
body_top        = max(O, C)
body_bottom     = min(O, C)
```

### Global Minimum Rule
If `full_range == 0`, the candle is invalid (no price movement). Skip all pattern evaluation for that candle.

### Ratio Notation
All ratios in this document are expressed as a proportion of `full_range` unless stated otherwise.

```
body_ratio  = body_size / full_range
upper_ratio = upper_wick / full_range
lower_ratio = lower_wick / full_range
```

---

## Global Thresholds

These constants are used consistently across all patterns. They are defined once here and referenced in every pattern below.

```
DOJI_BODY_THRESHOLD      = 0.10   ← body_ratio must be below this for a candle to qualify as doji
SMALL_BODY_THRESHOLD     = 0.30   ← body_ratio must be below this for a "small body" condition
SIGNIFICANT_WICK         = 0.60   ← wick must be at least this ratio of full_range
ENGULF_MARGIN            = 0.00   ← exact engulf; set to small positive value (0.001) to allow precision tolerance
MORNING_EVENING_GAP      = 0.00   ← minimum gap between candle 1 body close and candle 2 open (relaxed to 0 for crypto 24/7)
STAR_BODY_THRESHOLD      = 0.25   ← candle 2 in morning/evening star must have body_ratio below this
```

If you need to tune sensitivity, only change these constants. Do not hardcode ratios inside individual pattern functions.

---

## Implementation Approach

### Pattern Function Signature

Every pattern function should follow the same interface.

TypeScript:

```typescript
type Candle = {
  open: number
  high: number
  low: number
  close: number
  timestamp: number
}

type PatternResult = {
  detected: boolean
  confidence?: number   // optional, range 0-1, reserved for future scoring
}

function detectHammer(candles: Candle[]): PatternResult
```

Single-candle patterns receive an array for consistency but only use the last element.
Multi-candle patterns use candles[-3], candles[-2], candles[-1] for 3-candle patterns.

### Index Convention
```
candles[n-1] = current (most recently closed) candle    ← c1 in all formulas below
candles[n-2] = previous candle                          ← c0
candles[n-3] = two candles back                         ← c_minus1
```

### Performance Rule
Pattern detection is O(1) per candle per pattern. No loops over historical data inside a pattern function. Pre-group active alerts by symbol-timeframe before evaluating.

---

---

# PATTERN 1 — Hammer

## Definition
A single-candle bullish reversal pattern that forms after a downtrend or at a support level. It has a small body near the top of the candle and a long lower wick indicating rejection of lower prices.

## Visual Shape
```
  ▓  ← small body at top
  |
  |  ← long lower wick (at least 2× body)
  |
```

## Type
Single-candle. Bullish reversal.

## Required Candles
1 candle (current closed candle).

## Detection Rules

```
c1 = current closed candle

body_size   = abs(c1.close - c1.open)
full_range  = c1.high - c1.low
upper_wick  = c1.high - max(c1.open, c1.close)
lower_wick  = min(c1.open, c1.close) - c1.low

body_ratio  = body_size / full_range
upper_ratio = upper_wick / full_range
lower_ratio = lower_wick / full_range
```

All conditions must be true:

```
1. full_range > 0
2. body_ratio  >= 0.05   ← body must exist (not a doji)
3. body_ratio  <= 0.30   ← body must be small (max 30% of range)
4. lower_ratio >= 0.60   ← lower wick is at least 60% of full range
5. upper_ratio <= 0.10   ← upper wick is very small (max 10% of range)
```

## Trend Requirement
Hammer is valid at or near a support level or at the end of a decline. SetupAlert enforces this through the user-defined price level — the user enters a support level, so context is already provided. No algorithmic trend detection required in the engine.

## Mathematical Summary
```
DETECT_HAMMER(c1) =
  full_range > 0
  AND body_size / full_range >= 0.05
  AND body_size / full_range <= 0.30
  AND (min(c1.open, c1.close) - c1.low) / full_range >= 0.60
  AND (c1.high - max(c1.open, c1.close)) / full_range <= 0.10
```

## Color
Can be bullish or bearish colored. Color does not disqualify a hammer. Some sources require bullish close — optional strictness toggle for future.

## Edge Cases

| Scenario | Result |
|---|---|
| Bearish body (close < open) but all other conditions met | VALID — hammer can be bearish colored |
| Body is 0 (doji) | INVALID — body_ratio < 0.05 |
| Lower wick exactly 60% of range | VALID — boundary is inclusive |
| Candle has no upper wick at all | VALID — upper_ratio = 0, which is ≤ 0.10 |
| Very short candle (but proportions correct) | VALID — ratios are proportional, absolute size not checked |

## Valid Examples

| O | H | L | C | Result |
|---|---|---|---|---|
| 100 | 101 | 90 | 100 | body=0, INVALID (doji threshold) |
| 100 | 101 | 88 | 100 | body=0, INVALID |
| 100 | 101.5 | 88 | 101 | body=1, range=13.5, lower=12, upper=0.5 → ratios: body=0.074, lower=0.889, upper=0.037 → VALID |
| 100 | 105 | 88 | 103 | body=3, range=17, lower=12, upper=2 → ratios: body=0.176, lower=0.706, upper=0.118 → INVALID (upper>0.10) |

## Invalid Examples

| O | H | L | C | Why Invalid |
|---|---|---|---|---|
| 100 | 115 | 90 | 114 | Large body + large upper wick |
| 100 | 102 | 99 | 101 | Small range, no significant lower wick |
| 100 | 100.1 | 88 | 100 | Body is 0 (doji) |

## Unit Test Scenarios
```
test("hammer: valid bullish hammer")
test("hammer: valid bearish hammer (red body allowed)")
test("hammer: invalid — doji body")
test("hammer: invalid — upper wick too large")
test("hammer: invalid — lower wick insufficient")
test("hammer: invalid — zero full_range")
test("hammer: boundary — lower_ratio exactly 0.60")
```

---

---

# PATTERN 2 — Inverted Hammer

## Definition
A single-candle bullish reversal pattern. Similar to hammer but inverted — small body at the bottom, long upper wick, very small lower wick. Signals potential upward reversal after a decline.

## Visual Shape
```
  |
  |  ← long upper wick
  |
  ▓  ← small body at bottom
```

## Type
Single-candle. Bullish reversal.

## Required Candles
1 candle.

## Detection Rules

```
body_size   = abs(c1.close - c1.open)
full_range  = c1.high - c1.low
upper_wick  = c1.high - max(c1.open, c1.close)
lower_wick  = min(c1.open, c1.close) - c1.low

body_ratio  = body_size / full_range
upper_ratio = upper_wick / full_range
lower_ratio = lower_wick / full_range
```

All conditions must be true:

```
1. full_range > 0
2. body_ratio  >= 0.05   ← body must exist (not a doji)
3. body_ratio  <= 0.30   ← small body
4. upper_ratio >= 0.60   ← long upper wick (at least 60% of range)
5. lower_ratio <= 0.10   ← very small lower wick
```

## Mathematical Summary
```
DETECT_INVERTED_HAMMER(c1) =
  full_range > 0
  AND body_size / full_range >= 0.05
  AND body_size / full_range <= 0.30
  AND (c1.high - max(c1.open, c1.close)) / full_range >= 0.60
  AND (min(c1.open, c1.close) - c1.low) / full_range <= 0.10
```

## Relationship to Shooting Star
Inverted Hammer and Shooting Star are structurally identical candles. The distinction is context only:
- After downtrend / at support → Inverted Hammer (bullish potential)
- After uptrend / at resistance → Shooting Star (bearish potential)

SetupAlert exposes them as separate patterns because users select them explicitly by name.

## Edge Cases

| Scenario | Result |
|---|---|
| Candle is bullish or bearish | VALID either way |
| No lower wick at all | VALID — lower_ratio = 0 ≤ 0.10 |
| Upper wick exactly 60% | VALID — boundary inclusive |

## Unit Test Scenarios
```
test("inverted hammer: valid")
test("inverted hammer: invalid — lower wick too large")
test("inverted hammer: invalid — upper wick insufficient")
test("inverted hammer: invalid — large body")
test("inverted hammer: boundary — upper_ratio exactly 0.60")
```

---

---

# PATTERN 3 — Bullish Engulfing

## Definition
A two-candle bullish reversal pattern. The first candle is bearish with a meaningful body. The second candle is bullish and its body completely engulfs the body of the first candle.

## Visual Shape
```
Candle 1:
  ▒  ← bearish (red) body

Candle 2:
  █  ← bullish (green) body, taller than candle 1's body
  █
  █
```

## Type
Two-candle. Bullish reversal.

## Required Candles
2 candles: c0 (previous), c1 (current).

## Detection Rules

```
c0 = previous closed candle
c1 = current closed candle

c0_body_size = abs(c0.close - c0.open)
c1_body_size = abs(c1.close - c1.open)

c0_body_top    = max(c0.open, c0.close)
c0_body_bottom = min(c0.open, c0.close)

c1_body_top    = max(c1.open, c1.close)
c1_body_bottom = min(c1.open, c1.close)
```

All conditions must be true:

```
1. c0 is bearish:    c0.close < c0.open
2. c1 is bullish:    c1.close > c1.open
3. c0_body_size > 0  ← c0 must have a real body
4. c1_body_size > 0  ← c1 must have a real body
5. c1_body_bottom <= c0_body_bottom   ← c1 body opens below c0 body bottom
6. c1_body_top    >= c0_body_top      ← c1 body closes above c0 body top
```

## Mathematical Summary
```
DETECT_BULLISH_ENGULFING(c0, c1) =
  c0.close < c0.open
  AND c1.close > c1.open
  AND abs(c0.close - c0.open) > 0
  AND abs(c1.close - c1.open) > 0
  AND min(c1.open, c1.close) <= min(c0.open, c0.close)
  AND max(c1.open, c1.close) >= max(c0.open, c0.close)
```

## Engulf Margin
For crypto markets where prices repeat to many decimal places, allow a tiny tolerance:

```
c1_body_bottom <= c0_body_bottom + tolerance
c1_body_top    >= c0_body_top    - tolerance
tolerance = 0.001 * c0_body_size    ← 0.1% of c0 body
```

## Important: Wicks
Engulfing is defined by body engulfing only. Wicks are irrelevant and must not affect the condition.

## Edge Cases

| Scenario | Result |
|---|---|
| c0 body equals c1 body exactly | VALID — boundary inclusive |
| c0 is a doji (very small body) | Technically valid by formula, but low quality signal. Optional: add minimum c0_body_size check |
| c1 body engulfs only partially | INVALID |
| c1 is bearish | INVALID |

## Unit Test Scenarios
```
test("bullish engulfing: valid full engulf")
test("bullish engulfing: invalid — c1 is bearish")
test("bullish engulfing: invalid — c0 is bullish")
test("bullish engulfing: invalid — only partial engulf")
test("bullish engulfing: boundary — exact equal body edges")
test("bullish engulfing: invalid — doji c0 with minimum size requirement")
```

---

---

# PATTERN 4 — Bearish Engulfing

## Definition
A two-candle bearish reversal pattern. The first candle is bullish. The second candle is bearish and its body completely engulfs the body of the first candle.

## Type
Two-candle. Bearish reversal.

## Required Candles
2 candles: c0 (previous), c1 (current).

## Detection Rules

```
c0_body_top    = max(c0.open, c0.close)
c0_body_bottom = min(c0.open, c0.close)

c1_body_top    = max(c1.open, c1.close)
c1_body_bottom = min(c1.open, c1.close)
```

All conditions must be true:

```
1. c0 is bullish:    c0.close > c0.open
2. c1 is bearish:    c1.close < c1.open
3. abs(c0.close - c0.open) > 0
4. abs(c1.close - c1.open) > 0
5. c1_body_top    >= c0_body_top      ← c1 body opens above c0 body top
6. c1_body_bottom <= c0_body_bottom   ← c1 body closes below c0 body bottom
```

## Mathematical Summary
```
DETECT_BEARISH_ENGULFING(c0, c1) =
  c0.close > c0.open
  AND c1.close < c1.open
  AND abs(c0.close - c0.open) > 0
  AND abs(c1.close - c1.open) > 0
  AND max(c1.open, c1.close) >= max(c0.open, c0.close)
  AND min(c1.open, c1.close) <= min(c0.open, c0.close)
```

## Engulf Margin
Same tolerance as Bullish Engulfing: `0.001 * c0_body_size`.

## Unit Test Scenarios
```
test("bearish engulfing: valid")
test("bearish engulfing: invalid — c1 is bullish")
test("bearish engulfing: invalid — c0 is bearish")
test("bearish engulfing: invalid — partial engulf only")
test("bearish engulfing: boundary — exact equal body edges")
```

---

---

# PATTERN 5 — Doji

## Definition
A single-candle indecision/reversal pattern. The open and close are nearly identical, creating a very small or negligible body. Long wicks on either or both sides indicate rejection of prices above and below.

## Visual Shape
```
    |
  ──┼──  ← tiny body (nearly open = close)
    |
```

## Type
Single-candle. Indecision / potential reversal.

## Required Candles
1 candle.

## Detection Rules

```
body_size  = abs(c1.close - c1.open)
full_range = c1.high - c1.low
body_ratio = body_size / full_range
```

All conditions must be true:

```
1. full_range > 0
2. body_ratio <= 0.10   ← body is max 10% of full range
```

## Mathematical Summary
```
DETECT_DOJI(c1) =
  full_range > 0
  AND abs(c1.close - c1.open) / (c1.high - c1.low) <= 0.10
```

## Doji Subtypes (For Awareness, Not Separately Detected at Launch)

| Type | Description |
|---|---|
| Standard Doji | Equal wicks on both sides |
| Long-Legged Doji | Very long wicks on both sides |
| Gravestone Doji | Long upper wick only, body at bottom |
| Dragonfly Doji | Long lower wick only, body at top |

At launch, SetupAlert detects Doji as a single category without subtype distinction.

## Edge Cases

| Scenario | Result |
|---|---|
| Open exactly equals close | VALID — body_ratio = 0 |
| Very long candle range but tiny body | VALID — ratio check handles this |
| Open equals close and full_range > 0 | VALID |
| All OHLCV equal (range = 0) | INVALID — full_range = 0 |

## Unit Test Scenarios
```
test("doji: valid — open equals close")
test("doji: valid — nearly equal open and close (within 10%)")
test("doji: invalid — body is 15% of range")
test("doji: invalid — zero range")
test("doji: boundary — body_ratio exactly 0.10")
```

---

---

# PATTERN 6 — Shooting Star

## Definition
A single-candle bearish reversal pattern. Small body near the bottom of the candle, long upper wick, very small lower wick. Forms after an uptrend or at a resistance level. Indicates price rejection from above.

## Visual Shape
```
  |
  |  ← long upper wick
  |
  ▓  ← small body at bottom
```

## Type
Single-candle. Bearish reversal.

## Note on Structural Similarity
Shooting Star has identical structure to Inverted Hammer. The pattern name determines context. Users pick the name deliberately, so both are supported separately.

## Required Candles
1 candle.

## Detection Rules

```
body_size   = abs(c1.close - c1.open)
full_range  = c1.high - c1.low
upper_wick  = c1.high - max(c1.open, c1.close)
lower_wick  = min(c1.open, c1.close) - c1.low

body_ratio  = body_size / full_range
upper_ratio = upper_wick / full_range
lower_ratio = lower_wick / full_range
```

All conditions must be true:

```
1. full_range > 0
2. body_ratio  >= 0.05   ← body must exist
3. body_ratio  <= 0.30   ← small body
4. upper_ratio >= 0.60   ← long upper wick
5. lower_ratio <= 0.10   ← small lower wick
```

## Mathematical Summary
```
DETECT_SHOOTING_STAR(c1) =
  full_range > 0
  AND body_size / full_range >= 0.05
  AND body_size / full_range <= 0.30
  AND (c1.high - max(c1.open, c1.close)) / full_range >= 0.60
  AND (min(c1.open, c1.close) - c1.low) / full_range <= 0.10
```

## Color
Can be bullish or bearish body. Color does not disqualify shooting star.

## Unit Test Scenarios
```
test("shooting star: valid bearish colored")
test("shooting star: valid bullish colored")
test("shooting star: invalid — lower wick too large")
test("shooting star: invalid — upper wick insufficient")
test("shooting star: invalid — body too large")
test("shooting star: invalid — zero range")
```

---

---

# PATTERN 7 — Morning Star

## Definition
A three-candle bullish reversal pattern. First candle is a large bearish candle, second candle is a small-body candle (star) with a downward gap from the first, third candle is a large bullish candle that closes back into the first candle's body.

## Visual Shape
```
Candle 1:      Candle 2:    Candle 3:
  ▒               _             ████
  ▒             ▒_▒             ████
  ▒                             ████
```

## Type
Three-candle. Bullish reversal.

## Required Candles
3 candles: c_minus1 (oldest), c0 (middle/star), c1 (newest).

```
candles[n-3] = c_minus1   ← first large bearish candle
candles[n-2] = c0         ← small star candle
candles[n-1] = c1         ← large bullish candle
```

## Detection Rules

### Candle 1 (c_minus1)
```
c_minus1 is bearish:           c_minus1.close < c_minus1.open
c_minus1 has significant body: abs(c_minus1.close - c_minus1.open) / (c_minus1.high - c_minus1.low) >= 0.40
```

### Candle 2 / Star (c0)
```
c0 has small body:   abs(c0.close - c0.open) / (c0.high - c0.low) <= 0.25
c0 full_range > 0
```

### Gap Between Candle 1 and Candle 2
For crypto (24/7 markets), strict gap is rare. Apply relaxed rule:
```
max(c0.open, c0.close) <= c_minus1.close + tolerance
```
where `tolerance = 0.001 * abs(c_minus1.close - c_minus1.open)`.

In practice for crypto: gap requirement can be relaxed to zero gap (c0 simply trades below c_minus1 body bottom).

### Candle 3 (c1)
```
c1 is bullish:                  c1.close > c1.open
c1 has significant body:        abs(c1.close - c1.open) / (c1.high - c1.low) >= 0.40
c1 closes into c_minus1 body:   c1.close >= mid_body(c_minus1)
```
where:
```
mid_body(c_minus1) = (c_minus1.open + c_minus1.close) / 2
```

## Mathematical Summary
```
DETECT_MORNING_STAR(c_minus1, c0, c1) =

  // Candle 1: large bearish
  c_minus1.close < c_minus1.open
  AND abs(c_minus1.close - c_minus1.open) / (c_minus1.high - c_minus1.low) >= 0.40

  // Candle 2: small body star
  AND abs(c0.close - c0.open) / (c0.high - c0.low) <= 0.25
  AND (c0.high - c0.low) > 0

  // Candle 3: large bullish recovering
  AND c1.close > c1.open
  AND abs(c1.close - c1.open) / (c1.high - c1.low) >= 0.40
  AND c1.close >= (c_minus1.open + c_minus1.close) / 2
```

## Edge Cases

| Scenario | Result |
|---|---|
| Star candle is a perfect doji | VALID — body_ratio = 0 ≤ 0.25 |
| c1 barely closes at midpoint | VALID — boundary inclusive |
| c1 closes above c_minus1 open | VALID — stronger version |
| No gap between c_minus1 and c0 (common in crypto) | VALID with relaxed gap rule |
| c_minus1 body is small | INVALID — must be >= 40% of range |

## Unit Test Scenarios
```
test("morning star: valid classic")
test("morning star: valid with doji star")
test("morning star: invalid — c_minus1 is bullish")
test("morning star: invalid — c1 does not recover past midpoint")
test("morning star: invalid — star body too large")
test("morning star: invalid — c1 is bearish")
test("morning star: boundary — c1 closes exactly at midpoint of c_minus1")
```

---

---

# PATTERN 8 — Evening Star

## Definition
A three-candle bearish reversal pattern. Opposite of Morning Star. First candle is a large bullish candle, second is a small-body star candle (ideally gapping up), third is a large bearish candle that closes back into the first candle's body.

## Visual Shape
```
Candle 1:      Candle 2:    Candle 3:
  ████             _            ▒
  ████           ▒_▒            ▒
  ████                          ▒
```

## Type
Three-candle. Bearish reversal.

## Required Candles
3 candles: c_minus1 (oldest), c0 (middle/star), c1 (newest).

```
candles[n-3] = c_minus1   ← first large bullish candle
candles[n-2] = c0         ← small star candle
candles[n-1] = c1         ← large bearish candle
```

## Detection Rules

### Candle 1 (c_minus1)
```
c_minus1 is bullish:           c_minus1.close > c_minus1.open
c_minus1 has significant body: abs(c_minus1.close - c_minus1.open) / (c_minus1.high - c_minus1.low) >= 0.40
```

### Candle 2 / Star (c0)
```
c0 has small body:   abs(c0.close - c0.open) / (c0.high - c0.low) <= 0.25
c0 full_range > 0
```

### Candle 3 (c1)
```
c1 is bearish:                  c1.close < c1.open
c1 has significant body:        abs(c1.close - c1.open) / (c1.high - c1.low) >= 0.40
c1 closes into c_minus1 body:   c1.close <= mid_body(c_minus1)
```
where:
```
mid_body(c_minus1) = (c_minus1.open + c_minus1.close) / 2
```

## Mathematical Summary
```
DETECT_EVENING_STAR(c_minus1, c0, c1) =

  // Candle 1: large bullish
  c_minus1.close > c_minus1.open
  AND abs(c_minus1.close - c_minus1.open) / (c_minus1.high - c_minus1.low) >= 0.40

  // Candle 2: small body star
  AND abs(c0.close - c0.open) / (c0.high - c0.low) <= 0.25
  AND (c0.high - c0.low) > 0

  // Candle 3: large bearish recovering downward
  AND c1.close < c1.open
  AND abs(c1.close - c1.open) / (c1.high - c1.low) >= 0.40
  AND c1.close <= (c_minus1.open + c_minus1.close) / 2
```

## Edge Cases

| Scenario | Result |
|---|---|
| Star is a doji | VALID |
| c1 closes exactly at midpoint | VALID — boundary inclusive |
| c1 closes below c_minus1 open | VALID — stronger signal |
| c_minus1 has small body | INVALID |

## Unit Test Scenarios
```
test("evening star: valid classic")
test("evening star: valid with doji star")
test("evening star: invalid — c_minus1 is bearish")
test("evening star: invalid — c1 does not close past midpoint")
test("evening star: invalid — star body too large")
test("evening star: invalid — c1 is bullish")
test("evening star: boundary — c1 closes exactly at midpoint of c_minus1")
```

---

---

# Pattern Detection Registry

The central detection function maps a pattern name to its detector.

## Implementation (TypeScript)
```typescript
import { detectHammer }           from './hammer'
import { detectInvertedHammer }   from './inverted-hammer'
import { detectBullishEngulfing } from './bullish-engulfing'
import { detectBearishEngulfing } from './bearish-engulfing'
import { detectDoji }             from './doji'
import { detectShootingStar }     from './shooting-star'
import { detectMorningStar }      from './morning-star'
import { detectEveningStar }      from './evening-star'

const PATTERN_REGISTRY: Record<string, (candles: Candle[]) => PatternResult> = {
  'hammer':             (c) => detectHammer(c[c.length - 1]),
  'inverted-hammer':    (c) => detectInvertedHammer(c[c.length - 1]),
  'bullish-engulfing':  (c) => detectBullishEngulfing(c[c.length - 2], c[c.length - 1]),
  'bearish-engulfing':  (c) => detectBearishEngulfing(c[c.length - 2], c[c.length - 1]),
  'doji':               (c) => detectDoji(c[c.length - 1]),
  'shooting-star':      (c) => detectShootingStar(c[c.length - 1]),
  'morning-star':       (c) => detectMorningStar(c[c.length - 3], c[c.length - 2], c[c.length - 1]),
  'evening-star':       (c) => detectEveningStar(c[c.length - 3], c[c.length - 2], c[c.length - 1]),
}

export function detectPattern(patternName: string, candles: Candle[]): PatternResult {
  const detector = PATTERN_REGISTRY[patternName]
  if (!detector) return { detected: false }
  if (candles.length < getRequiredCandles(patternName)) return { detected: false }
  return detector(candles)
}

function getRequiredCandles(patternName: string): number {
  if (['morning-star', 'evening-star'].includes(patternName)) return 3
  if (['bullish-engulfing', 'bearish-engulfing'].includes(patternName)) return 2
  return 1
}
```

---

# Performance Considerations

- All pattern functions are O(1) — no history loop
- Cache last N candles per symbol-timeframe (N = 3 is sufficient for launch patterns)
- Run the registry only on candle close, not on every tick
- Group active alerts by symbol-timeframe pair before detection to avoid redundant candle fetches
- Candle cache should be shared across all alerts watching the same symbol-timeframe
- Pattern detection is a pure function with no side effects — it is safe to call in parallel

---

# Candle Validity Pre-Check

Before running any pattern, always validate:

```typescript
function isCandleValid(c: Candle): boolean {
  return (
    c.high >= c.low &&
    c.high >= c.open &&
    c.high >= c.close &&
    c.low  <= c.open &&
    c.low  <= c.close &&
    (c.high - c.low) > 0
  )
}
```

Skip pattern detection entirely if any required candle fails this check.

---

# Summary of All Thresholds

| Constant | Value | Used In |
|---|---|---|
| DOJI_BODY_THRESHOLD | 0.10 | Doji |
| SMALL_BODY_THRESHOLD | 0.30 | Hammer, Inverted Hammer, Shooting Star |
| MINIMUM_BODY_THRESHOLD | 0.05 | Hammer, Inverted Hammer, Shooting Star |
| SIGNIFICANT_WICK | 0.60 | Hammer (lower wick), Inverted Hammer / Shooting Star (upper wick) |
| MAX_OPPOSITE_WICK | 0.10 | Hammer (upper), Inverted Hammer / Shooting Star (lower) |
| STAR_BODY_THRESHOLD | 0.25 | Morning Star, Evening Star (candle 2) |
| LARGE_BODY_THRESHOLD | 0.40 | Morning Star, Evening Star (candles 1 and 3) |
| ENGULF_TOLERANCE | 0.001 × c0_body_size | Bullish Engulfing, Bearish Engulfing |

