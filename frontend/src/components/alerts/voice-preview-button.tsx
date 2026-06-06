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
 ? 'bg-brand/10 text-brand border border-brand shadow-lg shadow-brand'
 : 'bg-surface text-gray-400 border border-surface hover:text-text hover:bg-surface hover:border-surface'
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
