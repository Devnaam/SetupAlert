'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Zap, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface UpgradeModalProps {
 isOpen: boolean;
 onClose: () => void;
}

const proFeatures = [
 'Up to 50 active alerts',
 'All candlestick patterns',
 'Custom alert messages',
 'Priority support',
 '90-day alert history',
 'Multi-timeframe alerts',
];

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
 return (
 <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
 <div className="text-center space-y-6">
 {/* Icon */}
 <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg shadow-brand">
 <Zap className="h-8 w-8 text-text" />
 </div>

 {/* Heading */}
 <div>
 <h2 className="text-2xl font-bold text-text mb-2">
 Upgrade to Pro
 </h2>
 <p className="text-gray-400 text-sm">
 You&apos;ve reached your free plan alert limit. Upgrade to Pro to unlock more alerts and premium features.
 </p>
 </div>

 {/* Price */}
 <div className="py-4">
 <div className="flex items-baseline justify-center gap-1">
 <span className="text-4xl font-bold text-text">₹499</span>
 <span className="text-gray-500">/month</span>
 </div>
 <p className="text-xs text-gray-500 mt-1">or ₹4,999/year (save 17%)</p>
 </div>

 {/* Features */}
 <div className="space-y-3 text-left">
 {proFeatures.map((feature) => (
 <div key={feature} className="flex items-center gap-3">
 <div className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
 <Check className="h-3 w-3 text-brand" />
 </div>
 <span className="text-sm text-gray-300">{feature}</span>
 </div>
 ))}
 </div>

 {/* CTA */}
 <div className="flex flex-col gap-3 pt-2">
 <Link href="/billing" onClick={onClose}>
 <Button variant="primary" size="lg" className="w-full">
 Upgrade Now
 <ArrowRight className="h-4 w-4" />
 </Button>
 </Link>
 <button
 onClick={onClose}
 className="text-sm text-gray-500 hover:text-gray-300 transition-colors duration-200"
 >
 Maybe later
 </button>
 </div>
 </div>
 </Modal>
 );
}
