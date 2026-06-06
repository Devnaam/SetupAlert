"use client";

import React, { useState } from "react";

export default function VoiceDemoForm() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [pattern, setPattern] = useState("Hammer");
  const [timeframe, setTimeframe] = useState("15m");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playedMsg, setPlayedMsg] = useState("");

  // Pre-load voices so they are available on the first click
  React.useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      // Chrome fires this event when voices are loaded
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const playUpbeatChime = () => {
    return new Promise<void>((resolve) => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          resolve();
          return;
        }

        const audioCtx = new AudioContextClass();

        // Upbeat double-chime (C5 then E5)
        const playTone = (freq: number, startTime: number, duration: number) => {
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, startTime);

          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          osc.start(startTime);
          osc.stop(startTime + duration);
        };

        const now = audioCtx.currentTime;
        playTone(523.25, now, 0.2); // C5
        playTone(659.25, now + 0.15, 0.4); // E5

        setTimeout(() => {
          resolve();
        }, 500); // Resolve after chime completes
      } catch (e) {
        resolve(); // fallback if AudioContext fails
      }
    });
  };

  const playDemo = async () => {
    if (!('speechSynthesis' in window)) {
      alert("Your browser does not support Speech Synthesis.");
      return;
    }

    setIsSpeaking(true);

    // Play upbeat chime first
    await playUpbeatChime();

    let timeText = timeframe;
    if (timeframe === '1m') timeText = '1 minute';
    if (timeframe === '3m') timeText = '3 minute';
    if (timeframe === '5m') timeText = '5 minute';
    if (timeframe === '15m') timeText = '15 minute';
    if (timeframe === '30m') timeText = '30 minute';
    if (timeframe === '1h') timeText = '1 hour';
    if (timeframe === '4h') timeText = '4 hour';
    if (timeframe === '1D') timeText = 'daily';

    let spokenSymbol = symbol;
    if (symbol === 'BTCUSDT') spokenSymbol = 'Bitcoin';
    if (symbol === 'ETHUSDT') spokenSymbol = 'Ethereum';
    if (symbol === 'SOLUSDT') spokenSymbol = 'Solana';
    if (symbol === 'XAUUSDT') spokenSymbol = 'Gold';

    const msg = `Alert! ${spokenSymbol} formed a ${pattern} on the ${timeText} timeframe.`;

    window.speechSynthesis.cancel();

    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google UK English Female')) || voices[0];

    const utterance = new SpeechSynthesisUtterance(msg);
    if (femaleVoice) utterance.voice = femaleVoice;

    // Make it sound energetic/upbeat
    utterance.rate = 1.15;
    utterance.pitch = 1.2;

    utterance.onstart = () => {
      setPlayedMsg(msg);
    };
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
      <div className="text-center w-full">
        <h2 className="font-heading font-bold text-[36px] text-[var(--color-text)] mb-2">Hear What Your Alert Sounds Like</h2>
        <p className="text-[var(--color-text-muted)] text-[16px] mb-4">No signup required.</p>
      </div>

      <div className="flex flex-wrap md:flex-nowrap justify-center items-center gap-4 w-full">
        <select
          value={symbol} onChange={e => setSymbol(e.target.value)}
          className="bg-[var(--color-bg-deep)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 rounded-md text-[14px] focus-ring outline-none min-w-[140px]"
        >
          <optgroup label="Crypto & Forex">
            <option value="BTCUSDT">BTCUSDT</option>
            <option value="ETHUSDT">ETHUSDT</option>
            <option value="SOLUSDT">SOLUSDT</option>
            <option value="XAUUSDT">XAUUSDT (Gold)</option>
          </optgroup>
          <optgroup label="Indian Market">
            <option value="NIFTY50">NIFTY 50</option>
            <option value="BANKNIFTY">BANKNIFTY</option>
            <option value="RELIANCE">RELIANCE</option>
            <option value="TCS">TCS</option>
            <option value="HDFCBANK">HDFCBANK</option>
            <option value="INFY">INFY</option>
          </optgroup>
        </select>

        <select
          value={pattern} onChange={e => setPattern(e.target.value)}
          className="bg-[var(--color-bg-deep)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 rounded-md text-[14px] focus-ring outline-none min-w-[160px]"
        >
          <option value="Hammer">Hammer</option>
          <option value="Doji">Doji</option>
          <option value="Bullish Engulfing">Bullish Engulfing</option>
          <option value="Shooting Star">Shooting Star</option>
        </select>

        <div className="bg-[var(--color-bg-deep)] border border-[var(--color-border)] rounded-md flex p-1 overflow-x-auto max-w-full no-scrollbar relative">
          {['1m', '3m', '5m', '15m', '30m', '1h', '4h', '1D'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-2 text-[14px] rounded-sm transition-colors focus-ring outline-none whitespace-nowrap ${timeframe === t ? 'bg-[var(--color-bg-card)] text-[var(--color-text)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <button onClick={playDemo} className="min-h-[52px] inline-flex items-center justify-center gap-2 bg-[var(--color-accent)] text-[var(--color-btn-text)] px-10 rounded-md font-heading font-bold text-[18px] hover:opacity-90 transition-opacity focus-ring outline-none shadow-[0_0_15px_var(--color-accent-glow)]">
        ▶ Play Alert
      </button>

      <div className="h-24 flex flex-col items-center justify-center w-full">
        {isSpeaking ? (
          <div className="flex items-end gap-1.5 h-8 mb-4">
            <div className="w-1.5 h-full bg-[var(--color-accent)] rounded-full sound-bar"></div>
            <div className="w-1.5 h-full bg-[var(--color-accent)] rounded-full sound-bar" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1.5 h-full bg-[var(--color-accent)] rounded-full sound-bar" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1.5 h-full bg-[var(--color-accent)] rounded-full sound-bar" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-1.5 h-full bg-[var(--color-accent)] rounded-full sound-bar" style={{ animationDelay: '0.4s' }}></div>
          </div>
        ) : (
          <div className="h-12"></div>
        )}

        {playedMsg && (
          <div className="bg-[var(--color-bg-deep)] border border-[var(--color-border)] px-4 py-2 rounded text-[13px] text-[var(--color-text)] animate-in fade-in zoom-in duration-300 text-center">
            "{playedMsg}"
          </div>
        )}
      </div>
    </div>
  );
}
