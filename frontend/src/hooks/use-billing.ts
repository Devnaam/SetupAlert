'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Subscription } from '@/types/billing';
import { openCheckout, type RazorpayOptions } from '@/lib/razorpay';

interface UseBillingReturn {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  createCheckout: (planName: string, billingCycle: 'monthly' | 'annual') => Promise<void>;
  cancelSubscription: () => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useBilling(): UseBillingReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/billing/subscription');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch subscription');
      }
      const data = await res.json();
      setSubscription(data.subscription || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const createCheckout = useCallback(async (planName: string, billingCycle: 'monthly' | 'annual') => {
    try {
      setError(null);
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planName, billingCycle }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create checkout');
      }

      const data = await res.json();

      const options: RazorpayOptions = {
        key: data.razorpayKey,
        subscription_id: data.subscriptionId,
        name: 'StrategyAlert',
        description: `${planName.charAt(0).toUpperCase() + planName.slice(1)} Plan - ${billingCycle}`,
        image: '/logo.png',
        handler: async (response) => {
          await fetch('/api/billing/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          await fetchSubscription();
        },
        prefill: data.prefill || {},
        theme: { color: '#6366f1' },
      };

      await openCheckout(options);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate checkout');
    }
  }, [fetchSubscription]);

  const cancelSubscription = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const res = await fetch('/api/billing/cancel', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to cancel subscription');
      }
      await fetchSubscription();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
      return false;
    }
  }, [fetchSubscription]);

  return {
    subscription,
    loading,
    error,
    createCheckout,
    cancelSubscription,
    refetch: fetchSubscription,
  };
}
