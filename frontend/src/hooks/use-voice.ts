'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  speak as libSpeak,
  stopSpeaking,
  getVoices,
  isSpeechSupported,
} from '@/lib/voice';

interface UseVoiceReturn {
  speak: (text: string, voiceName?: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
}

export function useVoice(): UseVoiceReturn {
  const [speaking, setSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const supported = isSpeechSupported();
    setIsSupported(supported);

    if (supported) {
      const loadVoices = () => {
        const availableVoices = getVoices();
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
        }
      };

      loadVoices();
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, []);

  const speak = useCallback((text: string, voiceName?: string) => {
    if (!isSpeechSupported()) return;

    libSpeak(text, voiceName);
    setSpeaking(true);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setSpeaking(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 100);
  }, []);

  const stop = useCallback(() => {
    stopSpeaking();
    setSpeaking(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return {
    speak,
    stop,
    isSpeaking: speaking,
    isSupported,
    voices,
  };
}
