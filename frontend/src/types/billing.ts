export type PlanName = 'free' | 'pro' | 'enterprise';

export interface Plan {
  name: PlanName;
  displayName: string;
  priceMonthly: number;
  priceAnnual: number;
  features: string[];
  alertLimit: number;
  highlighted?: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanName;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  razorpay_subscription_id: string | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export const PLANS: Plan[] = [
  {
    name: 'free',
    displayName: 'Free',
    priceMonthly: 0,
    priceAnnual: 0,
    features: [
      'Up to 3 active alerts',
      'Voice notifications',
      'Browser notifications',
      'Basic candlestick patterns',
      'Email support',
    ],
    alertLimit: 3,
  },
  {
    name: 'pro',
    displayName: 'Pro',
    priceMonthly: 499,
    priceAnnual: 4999,
    features: [
      'Up to 50 active alerts',
      'Voice notifications',
      'Browser notifications',
      'All candlestick patterns',
      'Priority support',
      'Alert history (90 days)',
      'Custom alert messages',
      'Multi-timeframe alerts',
    ],
    alertLimit: 50,
    highlighted: true,
  },
  {
    name: 'enterprise',
    displayName: 'Enterprise',
    priceMonthly: 1999,
    priceAnnual: 19999,
    features: [
      'Unlimited active alerts',
      'Voice notifications',
      'Browser notifications',
      'All candlestick patterns',
      'Dedicated support',
      'Unlimited alert history',
      'Custom alert messages',
      'Multi-timeframe alerts',
      'API access',
      'Webhook integrations',
    ],
    alertLimit: Infinity,
  },
];
