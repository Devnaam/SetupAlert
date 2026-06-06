"use client";

import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

export default function ScrollBoundTerminal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTriggered, setIsTriggered] = useState(false);
  const isTriggeredRef = useRef(false);
  const voicePlayedRef = useRef(false);
  const hasInteractedRef = useRef(false);

  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    isMutedRef.current = isMuted;
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    const handleInteract = () => { hasInteractedRef.current = true; };
    window.addEventListener("click", handleInteract);
    window.addEventListener("keydown", handleInteract);
    window.addEventListener("scroll", handleInteract);
    return () => {
      window.removeEventListener("click", handleInteract);
      window.removeEventListener("keydown", handleInteract);
      window.removeEventListener("scroll", handleInteract);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    let st: any;
    let handleResize: () => void;

    const checkGsap = setInterval(() => {
      if (typeof window !== "undefined" && window.gsap && window.ScrollTrigger) {
        clearInterval(checkGsap);
        initChart();
      }
    }, 100);

    const initChart = () => {
      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const pseudoRandom = (i: number) => {
        const x = Math.sin(i * 9999) * 10000;
        return x - Math.floor(x);
      };

      const generateCandles = () => {
        const arr: any[] = [];
        const total = 100;
        for (let i = 0; i < total; i++) {
          const t = i / total;
          const basePrice = 300 - (100 * Math.pow(t, 1.2));
          const swing = Math.sin(t * Math.PI * 6) * 15;
          const price = basePrice + swing;

          const prevClose = i > 0 ? arr[i - 1].close : price;
          const open = prevClose + (pseudoRandom(i) * 4 - 2);
          const close = price + (pseudoRandom(i + 1) * 8 - 4);
          const high = Math.max(open, close) + pseudoRandom(i + 2) * 6 + 1;
          const low = Math.min(open, close) - pseudoRandom(i + 3) * 6 - 1;

          arr.push({ open, close, high, low });
        }

        const lastC = arr[arr.length - 1];
        arr.push({ open: lastC.close, close: 175, high: lastC.close + 2, low: 170 });
        arr.push({ open: 175, close: 165, high: 180, low: 162 });
        arr.push({ open: 165, close: 172, high: 175, low: 160 });

        return arr;
      };

      const candles = generateCandles();
      const totalCandles = candles.length;

      // ─────────────────────────────────────────────────────────────
      // SCROLL BUDGET
      //
      //  [0 … REPLAY_END)   → Bar Replay: candles form one-by-one
      //  [REPLAY_END … 1.0) → Hold zone: alert is live, camera stays
      //                       locked; the final 8% of the scroll range
      //                       acts as the "absorption pause" so the
      //                       user reads the card / hears the audio
      //                       before GSAP releases the pin.
      // ─────────────────────────────────────────────────────────────
      const REPLAY_END  = 0.88;   // replay finishes at 88% of total scroll
      const HOLD_START  = 0.88;   // hold zone begins immediately after
      // (the remaining 12% of scroll == the built-in delay / snapping hold)

      const draw = (progress: number) => {
        const w = canvasRef.current!.clientWidth;
        const h = canvasRef.current!.clientHeight;
        if (canvasRef.current!.width  !== w) canvasRef.current!.width  = w;
        if (canvasRef.current!.height !== h) canvasRef.current!.height = h;

        ctx.clearRect(0, 0, w, h);

        // ── Derived replay state ───────────────────────────────────
        //
        //  replayProgress  : 0→1 within the replay zone only
        //  completedCandles: how many full candles are already drawn
        //  partialProgress : 0→1 formation progress of the CURRENT candle
        //
        const replayProgress   = Math.min(progress / REPLAY_END, 1);
        // Each candle gets an equal share of replayProgress
        const rawCandle        = replayProgress * totalCandles;
        const completedCandles = Math.floor(rawCandle);          // fully drawn
        const partialProgress  = rawCandle - completedCandles;   // 0→1 for the forming candle

        // The hammer is the very last candle (index totalCandles-1)
        const triggerIndex  = totalCandles - 1;
        // Hammer fully formed when completedCandles == totalCandles (rawCandle >= totalCandles)
        const isHammerTime  = replayProgress >= 1;

        // ── Alert fire / reset ────────────────────────────────────
        if (isHammerTime && !isTriggeredRef.current) {
          isTriggeredRef.current = true;
          setIsTriggered(true);
          if (!voicePlayedRef.current && hasInteractedRef.current && !isMutedRef.current) {
            voicePlayedRef.current = true;
            const audio = new Audio("/bitcoin%20reached%2072400.mp3");
            audioRef.current = audio;
            audio.muted = isMutedRef.current;
            audio.play().catch((e: Error) => console.error("Audio playback failed:", e));
          }
        } else if (!isHammerTime && isTriggeredRef.current) {
          isTriggeredRef.current = false;
          setIsTriggered(false);
          voicePlayedRef.current = false;
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        }

        // ── Layout constants ──────────────────────────────────────
        const priceAxisW  = 70;
        const chartW      = w - priceAxisW;
        const spacing     = w < 768 ? 12 : 20;
        const candleWidth = w < 768 ? 7  : 11;

        // TradingView dark background
        ctx.fillStyle = "#131722";
        ctx.fillRect(0, 0, w, h);

        // ── Price scale ───────────────────────────────────────────
        const lineY     = h * 0.75;
        const priceRange = 160;
        const pixelRange = h * 0.60;
        const priceScale = pixelRange / priceRange;
        const mapY = (price: number) => lineY - ((price - 160) * priceScale);

        // ── Camera / viewport ─────────────────────────────────────
        //
        //  During replay  → camera advances to keep the forming candle
        //                   in the right-third of the screen (just like
        //                   TradingView's Bar Replay).
        //  During hold    → camera is locked; the chart sits still while
        //                   the user reads the alert card.
        //
        const rightPadding      = w < 768 ? 100 : chartW * 0.35;
        const totalVirtualWidth = totalCandles * spacing;
        const maxCameraX        = Math.max(0, totalVirtualWidth - chartW + rightPadding);

        // Camera during replay tracks the forming candle
        const replayCameraX = replayProgress * maxCameraX;
        // Camera during hold is frozen at the end-of-replay position
        const holdCameraX   = maxCameraX;

        let cameraX: number;
        if (progress <= REPLAY_END) {
          cameraX = replayCameraX;
        } else {
          // Smoothly blend from replayCameraX → holdCameraX over a tiny
          // window so there's no jump, then hold perfectly still.
          const blendT = Math.min((progress - REPLAY_END) / 0.02, 1);
          cameraX = replayCameraX + (holdCameraX - replayCameraX) * blendT;
        }

        // ── Horizontal grid lines ─────────────────────────────────
        const gridPrices = [160, 180, 200, 220, 240, 260, 280, 300, 320];
        gridPrices.forEach((price) => {
          const y = mapY(price);
          if (y < 28 || y > h - 22) return;
          ctx.beginPath();
          ctx.strokeStyle = "rgba(42,46,57,1)";
          ctx.lineWidth = 1;
          ctx.moveTo(0, y);
          ctx.lineTo(chartW, y);
          ctx.stroke();

          ctx.fillStyle = "#787B86";
          ctx.font = "11px -apple-system, 'Trebuchet MS', sans-serif";
          ctx.textAlign = "left";
          ctx.fillText(price.toLocaleString(), chartW + 8, y + 4);
        });

        // ── Vertical time grid ────────────────────────────────────
        const timeLabels = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30"];
        for (let i = 0; i < totalCandles; i += 10) {
          const x = (i * spacing) - cameraX;
          if (x < 0 || x > chartW) continue;
          ctx.beginPath();
          ctx.strokeStyle = "rgba(42,46,57,1)";
          ctx.lineWidth = 1;
          ctx.moveTo(x, 28);
          ctx.lineTo(x, h - 22);
          ctx.stroke();
          ctx.fillStyle = "#787B86";
          ctx.font = "10px -apple-system, 'Trebuchet MS', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(timeLabels[(i / 10) % timeLabels.length], x, h - 6);
        }
        ctx.textAlign = "left";

        // ── Price axis separator ──────────────────────────────────
        ctx.beginPath();
        ctx.strokeStyle = "#2A2E39";
        ctx.lineWidth = 1;
        ctx.moveTo(chartW, 0);
        ctx.lineTo(chartW, h);
        ctx.stroke();

        // ── Alert level line ──────────────────────────────────────
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.moveTo(0, lineY);
        ctx.lineTo(chartW, lineY);
        if (isHammerTime) {
          ctx.strokeStyle = "#F7C948";
          ctx.lineWidth = 1;
          ctx.shadowColor = "#F7C94840";
          ctx.shadowBlur = 6;
        } else {
          ctx.strokeStyle = "rgba(120,123,134,0.45)";
          ctx.lineWidth = 1;
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
        ctx.restore();

        // ── Price tag ─────────────────────────────────────────────
        const tagColor     = isHammerTime ? "#F7C948" : "#363A45";
        const tagTextColor = isHammerTime ? "#131722" : "#D9D9D9";
        const tagX         = chartW + 1;
        ctx.fillStyle = tagColor;
        ctx.beginPath();
        (ctx as any).roundRect(tagX, lineY - 11, priceAxisW - 2, 22, 3);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(tagX,     lineY - 6);
        ctx.lineTo(tagX - 7, lineY);
        ctx.lineTo(tagX,     lineY + 6);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = tagTextColor;
        ctx.font = "bold 11px -apple-system, 'Trebuchet MS', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("72,400", tagX + (priceAxisW - 2) / 2, lineY + 4);
        ctx.textAlign = "left";

        // ── Volume bars ───────────────────────────────────────────
        const volZoneH = 40;
        const volY     = h - 22 - volZoneH;
        for (let i = 0; i <= completedCandles && i < totalCandles; i++) {
          const c = candles[i];
          const x = (i * spacing) - cameraX;
          if (x < -50 || x > chartW + 50) continue;
          const isBullish = c.close >= c.open;
          let volHeight = (pseudoRandom(i + 50) * 0.7 + 0.1) * volZoneH;
          // Partial alpha for the forming candle
          if (i === completedCandles && i < totalCandles) {
            volHeight *= partialProgress;
          }
          ctx.fillStyle = isBullish ? "rgba(38,166,154,0.25)" : "rgba(239,83,80,0.25)";
          ctx.fillRect(x, volY + (volZoneH - volHeight), candleWidth, volHeight);
        }
        ctx.beginPath();
        ctx.strokeStyle = "#2A2E39";
        ctx.lineWidth = 1;
        ctx.moveTo(0, volY);
        ctx.lineTo(chartW, volY);
        ctx.stroke();

        // ── BAR REPLAY: draw candles one-by-one ───────────────────
        //
        //  Each candle forms in three micro-phases driven by partialProgress:
        //
        //    Phase 1 (0 → 0.35) — upper wick grows down from the high
        //    Phase 2 (0.35 → 0.7) — candle body fills in
        //    Phase 3 (0.7 → 1.0) — lower wick extends down to the low
        //
        //  Completed candles (index < completedCandles) are always drawn
        //  at full opacity.  The "forming" candle (index == completedCandles)
        //  uses the phase logic above.
        //
        const drawCandle = (i: number, alpha: number, phase1: number, phase2: number, phase3: number) => {
          const c  = candles[i];
          const x  = (i * spacing) - cameraX;
          if (x < -50 || x > chartW + 50) return;

          const isBullish  = c.close >= c.open;
          const color      = isBullish ? "#26A69A" : "#EF5350";
          const isTheHammer = (i === triggerIndex);
          const cx         = x + candleWidth / 2;

          ctx.globalAlpha = alpha;

          if (isHammerTime && isTheHammer) {
            ctx.shadowColor = "#F7C948";
            ctx.shadowBlur  = 16;
          } else {
            ctx.shadowBlur  = 0;
          }

          // Upper wick — grows from high downward to max(open,close)
          if (phase1 > 0) {
            const highY  = mapY(c.high);
            const bodyTopY = mapY(Math.max(c.open, c.close));
            const wickEndY = highY + (bodyTopY - highY) * Math.min(phase1 / 0.35, 1);
            ctx.strokeStyle = color;
            ctx.lineWidth   = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx, highY);
            ctx.lineTo(cx, wickEndY);
            ctx.stroke();
          }

          // Body — fills from top of body downward
          if (phase2 > 0) {
            const bodyPhase = Math.min((phase2 - 0.35) / 0.35, 1);
            const topY      = mapY(Math.max(c.open, c.close));
            const botY      = mapY(Math.min(c.open, c.close));
            const bodyFull  = Math.max(2, botY - topY);
            const bodyDraw  = bodyFull * bodyPhase;
            ctx.fillStyle   = color;
            ctx.fillRect(x, topY, candleWidth, bodyDraw);
          }

          // Lower wick — grows from min(open,close) downward to low
          if (phase3 > 0) {
            const wickPhase  = Math.min((phase3 - 0.7) / 0.3, 1);
            const bodyBotY   = mapY(Math.min(c.open, c.close));
            const lowY       = mapY(c.low);
            const wickEndY   = bodyBotY + (lowY - bodyBotY) * wickPhase;
            ctx.strokeStyle  = color;
            ctx.lineWidth    = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx, bodyBotY);
            ctx.lineTo(cx, wickEndY);
            ctx.stroke();
          }

          ctx.shadowBlur  = 0;
          ctx.globalAlpha = 1;
        };

        // Fully completed candles
        for (let i = 0; i < completedCandles; i++) {
          drawCandle(i, 1, 0.35, 0.70, 1.0);
        }

        // The currently forming candle (if replay still in progress)
        if (completedCandles < totalCandles) {
          const p = partialProgress; // 0 → 1
          drawCandle(
            completedCandles,
            0.55 + 0.45 * p,   // fade in from 55% → 100% opacity
            p,                 // phase1 gate
            p >= 0.35 ? p : 0, // phase2 gate
            p >= 0.70 ? p : 0  // phase3 gate
          );
        }

        // ── Top OHLC info bar ─────────────────────────────────────
        ctx.fillStyle = "#1E2230";
        ctx.fillRect(0, 0, chartW, 28);

        ctx.fillStyle = "#D9D9D9";
        ctx.font = "bold 13px -apple-system, 'Trebuchet MS', sans-serif";
        ctx.fillText("BTCUSDT", 12, 18);

        ctx.fillStyle = "#2A2E39";
        ctx.beginPath();
        (ctx as any).roundRect(79, 6, 28, 16, 3);
        ctx.fill();
        ctx.fillStyle = "#D9D9D9";
        ctx.font = "bold 10px -apple-system, 'Trebuchet MS', sans-serif";
        ctx.fillText("15m", 84, 18);

        // Show OHLC of the most recently COMPLETED candle
        const ohlcIndex = Math.min(Math.max(completedCandles - 1, 0), totalCandles - 1);
        const lastVisible = candles[ohlcIndex];
        if (lastVisible) {
          const ohlcColor = lastVisible.close >= lastVisible.open ? "#26A69A" : "#EF5350";
          ctx.font = "11px -apple-system, 'Trebuchet MS', sans-serif";
          const pairs: [string, string, number][] = [
            ["O", lastVisible.open.toFixed(2),  116],
            ["H", lastVisible.high.toFixed(2),  172],
            ["L", lastVisible.low.toFixed(2),   228],
            ["C", lastVisible.close.toFixed(2), 284],
          ];
          pairs.forEach(([label, val, xPos]) => {
            ctx.fillStyle = "#787B86";
            ctx.fillText(label, xPos, 18);
            ctx.fillStyle = ohlcColor;
            ctx.fillText(val, xPos + 10, 18);
          });
        }

        // ── Replay cursor line ────────────────────────────────────
        //  A thin vertical line just to the right of the forming candle,
        //  mimicking TradingView's replay playhead.
        if (!isHammerTime && completedCandles < totalCandles) {
          const formingX = (completedCandles * spacing) - cameraX + candleWidth + 4;
          if (formingX > 0 && formingX < chartW) {
            ctx.save();
            ctx.strokeStyle = "rgba(120,123,134,0.55)";
            ctx.lineWidth   = 1;
            ctx.beginPath();
            ctx.moveTo(formingX, 28);
            ctx.lineTo(formingX, h - 22);
            ctx.stroke();
            ctx.restore();
          }
        }

        // ── Crosshair on hammer when alert is live ────────────────
        if (isHammerTime) {
          const lastX      = (triggerIndex * spacing) - cameraX + candleWidth / 2;
          const lastCloseY = mapY(candles[triggerIndex].close);
          if (lastX > 0 && lastX < chartW) {
            ctx.save();
            ctx.setLineDash([3, 3]);
            ctx.strokeStyle = "rgba(120,123,134,0.5)";
            ctx.lineWidth   = 1;
            ctx.beginPath();
            ctx.moveTo(lastX, 28);
            ctx.lineTo(lastX, h - 22);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0,      lastCloseY);
            ctx.lineTo(chartW, lastCloseY);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
            ctx.beginPath();
            ctx.arc(lastX, lastCloseY, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#F7C948";
            ctx.fill();
          }
        }
      };

      draw(0);

      // ── ScrollTrigger ─────────────────────────────────────────────
      //
      //  end: "+=280%"  →  gives us ~280vh of scroll to play with.
      //  The extra 80vh (vs the original 200%) becomes the natural hold
      //  budget.  Because REPLAY_END = 0.88, the final 12% of progress
      //  (~34vh worth of scroll) keeps the chart frozen and the alert
      //  card visible — the user must scroll a full ~third of a screen
      //  past the trigger point before GSAP unpins the section.
      //
      //  scrub: 1.5  →  slightly more damping than the original 1,
      //  so the chart feels deliberate and weighted at high scroll speed.
      //
      st = ScrollTrigger.create({
        trigger: containerRef.current,
        start:   "center center",
        end:     "+=280%",
        pin:     true,
        scrub:   1.5,
        onUpdate: (self: any) => { draw(self.progress); },
      });

      handleResize = () => draw(st.progress);
      window.addEventListener("resize", handleResize);
    };

    return () => {
      clearInterval(checkGsap);
      if (st) st.kill();
      if (handleResize) window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes soundwave {
          0%, 100% { transform: scaleY(0.2); }
          50%       { transform: scaleY(1); }
        }
        .animate-soundwave {
          animation: soundwave 1.1s ease-in-out infinite;
          transform-origin: bottom;
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33%       { transform: translateY(-8px) translateX(4px); }
          66%       { transform: translateY(4px) translateX(-3px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50%       { transform: translateY(-12px) translateX(-6px); }
        }
        @keyframes ambient-glow {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50%       { opacity: 0.55; transform: scale(1.06); }
        }
        .tv-screen-glare {
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.04) 0%,
            rgba(255,255,255,0.01) 40%,
            transparent 60%
          );
          pointer-events: none;
        }
        .screen-scanlines::after {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.03) 2px,
            rgba(0,0,0,0.03) 4px
          );
          pointer-events: none;
          z-index: 5;
        }
      `}} />

      <section
        ref={containerRef}
        className="w-full h-[100vh] flex items-center justify-center relative z-10 overflow-hidden"
        style={{ background: "var(--color-bg-deep, #0D0F14)" }}
      >
        {/* Ambient background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 60%, rgba(38,166,154,0.07) 0%, transparent 70%), " +
              "radial-gradient(ellipse 50% 40% at 20% 20%, rgba(247,201,72,0.04) 0%, transparent 60%)",
            animation: "ambient-glow 8s ease-in-out infinite",
          }}
        />

        {/* Background grid — far parallax plane */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(42,46,57,0.5) 1px, transparent 1px), " +
              "linear-gradient(90deg, rgba(42,46,57,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 85% 85% at 50% 50%, black 30%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 85% 85% at 50% 50%, black 30%, transparent 100%)",
            animation: "float-slow 14s ease-in-out infinite",
          }}
        />

        {/* Floating particles — mid parallax plane */}
        {[
          { x: "8%",  y: "18%", size: 2,   delay: "0s",   dur: "9s",  green: true  },
          { x: "91%", y: "24%", size: 1.5, delay: "1.2s", dur: "11s", green: false },
          { x: "5%",  y: "72%", size: 2.5, delay: "3.1s", dur: "13s", green: true  },
          { x: "94%", y: "68%", size: 1.5, delay: "0.6s", dur: "10s", green: false },
          { x: "50%", y: "8%",  size: 1,   delay: "2s",   dur: "12s", green: true  },
          { x: "15%", y: "45%", size: 2,   delay: "4s",   dur: "15s", green: false },
          { x: "85%", y: "50%", size: 1.5, delay: "1.8s", dur: "9s",  green: true  },
        ].map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: dot.x, top: dot.y,
              width: `${dot.size * 2}px`, height: `${dot.size * 2}px`,
              background: dot.green ? "rgba(38,166,154,0.4)" : "rgba(247,201,72,0.3)",
              boxShadow: `0 0 ${dot.size * 4}px ${dot.green ? "rgba(38,166,154,0.3)" : "rgba(247,201,72,0.25)"}`,
              animation: `float-medium ${dot.dur} ease-in-out infinite`,
              animationDelay: dot.delay,
            }}
          />
        ))}

        {/* Left stat chips — near-foreground */}
        <div
          className="absolute left-[2%] top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2 pointer-events-none"
          style={{ animation: "float-slow 10s ease-in-out infinite", animationDelay: "1s" }}
        >
          {[
            { label: "24h Vol",  value: "$38.2B",  up: true  },
            { label: "Funding",  value: "0.012%",  up: true  },
            { label: "Open Int", value: "$14.7B",  up: false },
          ].map((chip) => (
            <div
              key={chip.label}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px]"
              style={{
                background: "rgba(19,23,34,0.88)",
                border: "1px solid rgba(42,46,57,0.9)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span style={{ color: "#787B86" }}>{chip.label}</span>
              <span className="font-semibold tabular-nums" style={{ color: chip.up ? "#26A69A" : "#EF5350" }}>
                {chip.value}
              </span>
            </div>
          ))}
        </div>

        {/* Right indicator chips — near-foreground */}
        <div
          className="absolute right-[2%] top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2 pointer-events-none"
          style={{ animation: "float-medium 12s ease-in-out infinite", animationDelay: "2.5s" }}
        >
          {[
            { label: "RSI(14)", value: "38.2",   color: "#F7C948" },
            { label: "MACD",    value: "−124",   color: "#EF5350" },
            { label: "EMA200",  value: "71,830", color: "#26A69A" },
          ].map((chip) => (
            <div
              key={chip.label}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px]"
              style={{
                background: "rgba(19,23,34,0.88)",
                border: "1px solid rgba(42,46,57,0.9)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span style={{ color: "#787B86" }}>{chip.label}</span>
              <span className="font-semibold tabular-nums" style={{ color: chip.color }}>
                {chip.value}
              </span>
            </div>
          ))}
        </div>

        {/* Monitor — foreground focal element */}
        <div
          className="max-w-3xl lg:max-w-4xl mx-auto px-4 md:px-8 w-full relative z-10"
          style={{ filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.7))" }}
        >
          {/* Monitor body */}
          <div
            className="w-full relative rounded-2xl md:rounded-[20px]"
            style={{
              background: "linear-gradient(160deg, #232730 0%, #1A1D24 60%, #16191F 100%)",
              padding: "10px",
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.06), " +
                "0 2px 4px rgba(0,0,0,0.5), " +
                "0 20px 60px rgba(0,0,0,0.6), " +
                "inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-3 pt-1 pb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: "#EF5350", opacity: 0.85 }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#F7C948", opacity: 0.85 }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#26A69A", opacity: 0.85 }} />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.45)" }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#2A2E39" }} />
                <span className="text-[9px] tracking-widest font-medium" style={{ color: "#3A3F4E", letterSpacing: "0.12em" }}>
                  BTCUSDT · 15m · LIVE
                </span>
              </div>
              <div style={{ width: 54 }} />
            </div>

            {/* Screen */}
            <div
              className="w-full aspect-[16/10] md:aspect-video relative overflow-hidden screen-scanlines"
              style={{
                borderRadius: "10px",
                border: "1px solid rgba(0,0,0,0.8)",
                boxShadow:
                  "inset 0 0 0 1px rgba(255,255,255,0.03), " +
                  "inset 0 2px 8px rgba(0,0,0,0.6)",
              }}
            >
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full block"
                style={{ borderRadius: "9px" }}
              />

              <div className="tv-screen-glare absolute inset-0 z-10 rounded-[9px]" />

              {/* Mute button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-9 right-3 z-30 flex items-center justify-center w-8 h-8 rounded-md outline-none"
                style={{
                  background: "rgba(19,23,34,0.9)",
                  border: "1px solid rgba(42,46,57,0.9)",
                  color: "#787B86",
                  backdropFilter: "blur(6px)",
                  transition: "color 180ms, border-color 180ms",
                }}
                aria-label={isMuted ? "Unmute" : "Mute"}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#D9D9D9"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#787B86"; }}
              >
                {isMuted ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <line x1="23" y1="9" x2="17" y2="15"/>
                    <line x1="17" y1="9" x2="23" y2="15"/>
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                )}
              </button>

              {/* Alert card */}
              <div
                className="absolute z-20"
                style={{
                  top: "50%",
                  right: "3%",
                  width: "min(82%, 296px)",
                  opacity: isTriggered ? 1 : 0,
                  transform: isTriggered ? "translateX(0) translateY(-50%)" : "translateX(24px) translateY(-50%)",
                  transition: isTriggered
                    ? "opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)"
                    : "opacity 0.3s cubic-bezier(0.4,0,1,1), transform 0.3s cubic-bezier(0.4,0,1,1)",
                  pointerEvents: isTriggered ? "auto" : "none",
                }}
              >
                <div
                  style={{
                    background: "rgba(19,23,34,0.97)",
                    border: "1px solid rgba(42,46,57,0.9)",
                    borderRadius: "10px",
                    backdropFilter: "blur(14px)",
                    boxShadow:
                      "0 16px 48px rgba(0,0,0,0.7), " +
                      "0 0 0 1px rgba(247,201,72,0.12)",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ height: "2px", background: "linear-gradient(90deg, #F7C948, rgba(247,201,72,0.15))" }} />
                  <div className="p-4">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div
                        className="flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0"
                        style={{
                          background: "rgba(247,201,72,0.1)",
                          border: "1px solid rgba(247,201,72,0.2)",
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F7C948" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#787B86" }}>
                          Strategy Alert
                        </p>
                        <p className="text-[9px] tabular-nums" style={{ color: "#4A4F5E" }}>
                          BTC/USDT · 15m · just now
                        </p>
                      </div>
                    </div>

                    <p className="text-[12.5px] leading-relaxed mb-4" style={{ color: "#C9CDD8", fontWeight: 450 }}>
                      Bitcoin reached{" "}
                      <span className="font-semibold tabular-nums" style={{ color: "#F7C948" }}>72,400</span>
                      {" "}and formed a{" "}
                      <span className="font-semibold" style={{ color: "#26A69A" }}>Hammer candle</span>
                      {" "}on the 15m timeframe.
                    </p>

                    <div>
                      <p className="text-[9px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "#787B86" }}>
                        Voice Alert
                      </p>
                      <div
                        className="flex items-end gap-[2px] h-7 px-2 rounded"
                        style={{
                          background: "rgba(10,12,18,0.8)",
                          border: "1px solid rgba(42,46,57,0.8)",
                        }}
                      >
                        {Array.from({ length: 28 }).map((_, i) => {
                          const envelope = Math.sin((i / 27) * Math.PI);
                          const natural = 0.15 + envelope * 0.85;
                          return (
                            <div
                              key={i}
                              className={isTriggered ? "animate-soundwave" : ""}
                              style={{
                                flex: 1,
                                background: "#26A69A",
                                borderRadius: "1px",
                                height: isTriggered ? `${natural * 100}%` : "15%",
                                opacity: 0.75,
                                animationDelay: `${i * 0.04}s`,
                                transition: "height 0.3s ease",
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inset depth shadow */}
              <div
                className="absolute inset-0 z-10 pointer-events-none rounded-[9px]"
                style={{
                  boxShadow:
                    "inset 2px 2px 12px rgba(0,0,0,0.4), " +
                    "inset -2px -2px 12px rgba(0,0,0,0.3)",
                }}
              />
            </div>

            {/* Monitor chin */}
            <div className="flex items-center justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }} />
            </div>
          </div>

          {/* Stand neck */}
          <div className="hidden md:flex justify-center">
            <div
              style={{
                width: "100px",
                height: "36px",
                background: "linear-gradient(180deg, #1C1F27 0%, #151820 100%)",
                clipPath: "polygon(20% 0%, 80% 0%, 90% 100%, 10% 100%)",
              }}
            />
          </div>

          {/* Stand base */}
          <div className="hidden md:flex justify-center">
            <div
              style={{
                width: "260px",
                height: "14px",
                background: "linear-gradient(180deg, #232730 0%, #1A1D24 100%)",
                borderRadius: "0 0 8px 8px",
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.04), " +
                  "0 8px 24px rgba(0,0,0,0.5)",
              }}
            />
          </div>
        </div>
      </section>
    </>
  );
}