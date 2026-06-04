'use client';

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useVoice } from '@/hooks/use-voice';

interface VoicePreviewButtonProps {
  message: string;
  className?: string;
}

export function VoicePreviewButton({ message, className = '' }: VoicePreviewButtonProps) {
  const { speak, stop, isSpeaking, isSupported } = useVoice();

  if (!isSupported) return null;

  const handleClick = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(message);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!message}
      className={`
        inline-flex items-center justify-center
        w-10 h-10 rounded-xl
        transition-all duration-200
        disabled:opacity-30 disabled:cursor-not-allowed
        ${isSpeaking
          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/20'
          : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white hover:bg-white/10 hover:border-white/20'
        }
        ${className}
      `}
      title={isSpeaking ? 'Stop playback' : 'Preview voice'}
    >
      {isSpeaking ? (
        <VolumeX className="h-4 w-4 animate-pulse" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </button>
  );
}
