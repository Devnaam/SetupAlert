export type PlanName = 'free' | 'pro' | 'annual';

export type SubscriptionStatus =
  | 'active'
  | 'inactive'
  | 'cancelled'
  | 'expired'
  | 'past_due'
  | 'trialing';

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanName;
  status: SubscriptionStatus;
  razorpay_subscription_id: string | null;
  razorpay_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}
