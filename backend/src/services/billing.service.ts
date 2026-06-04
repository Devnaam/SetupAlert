import { supabase } from "../lib/supabase";
import { razorpay } from "../lib/razorpay";
import { logger } from "../lib/logger";
import { Subscription, PlanName, SubscriptionStatus } from "../types/billing";

const PLAN_CONFIG: Record<
  string,
  { razorpayPlanId: string; maxAlerts: number; name: string }
> = {
  pro: {
    razorpayPlanId: process.env.RAZORPAY_PRO_PLAN_ID || "",
    maxAlerts: 25,
    name: "Pro",
  },
  annual: {
    razorpayPlanId: process.env.RAZORPAY_ANNUAL_PLAN_ID || "",
    maxAlerts: 25,
    name: "Annual",
  },
};

const FREE_PLAN_LIMITS = { maxAlerts: 3 };

export const BillingService = {
  async getCurrentPlan(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["active", "authenticated", "created"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.error("Failed to fetch current plan", { userId, error: error.message });
      throw new Error(`Failed to fetch current plan: ${error.message}`);
    }

    return data as Subscription | null;
  },

  async createSubscription(
    userId: string,
    planName: PlanName
  ): Promise<{
    subscriptionId: string;
    razorpaySubscriptionId: string;
    shortUrl: string;
  }> {
    const planConfig = PLAN_CONFIG[planName];
    if (!planConfig) {
      throw new Error(`Invalid plan name: ${planName}. Valid plans: pro, annual.`);
    }

    if (!planConfig.razorpayPlanId) {
      throw new Error(`Razorpay plan ID not configured for plan: ${planName}`);
    }

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
      userId
    );

    if (userError || !userData.user) {
      logger.error("Failed to fetch user for subscription", {
        userId,
        error: userError?.message,
      });
      throw new Error("Failed to fetch user information.");
    }

    const existingPlan = await BillingService.getCurrentPlan(userId);
    if (existingPlan && existingPlan.status === "active") {
      throw new Error(
        "You already have an active subscription. Please cancel it before subscribing to a new plan."
      );
    }

    const razorpaySubscription = await razorpay.subscriptions.create({
      plan_id: planConfig.razorpayPlanId,
      total_count: planName === "annual" ? 12 : 120,
      customer_notify: 1,
      notes: {
        user_id: userId,
        plan_name: planName,
        email: userData.user.email || "",
      },
    });

    const { data: subscription, error: insertError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan_name: planName,
        razorpay_subscription_id: razorpaySubscription.id,
        status: "created" as SubscriptionStatus,
      })
      .select()
      .single();

    if (insertError) {
      logger.error("Failed to save subscription record", {
        userId,
        error: insertError.message,
      });
      throw new Error(`Failed to create subscription record: ${insertError.message}`);
    }

    logger.info("Subscription created", {
      subscriptionId: subscription.id,
      razorpaySubscriptionId: razorpaySubscription.id,
      userId,
      plan: planName,
    });

    return {
      subscriptionId: subscription.id,
      razorpaySubscriptionId: razorpaySubscription.id,
      shortUrl: razorpaySubscription.short_url || "",
    };
  },

  async handleWebhook(event: {
    event: string;
    payload: {
      subscription?: { entity: Record<string, unknown> };
      payment?: { entity: Record<string, unknown> };
    };
  }): Promise<void> {
    const eventType = event.event;
    logger.info("Processing Razorpay webhook event", { eventType });

    switch (eventType) {
      case "subscription.authenticated": {
        const subEntity = event.payload.subscription?.entity;
        if (!subEntity) break;
        await BillingService.updateSubscriptionStatus(
          subEntity.id as string,
          "authenticated"
        );
        break;
      }

      case "subscription.activated": {
        const subEntity = event.payload.subscription?.entity;
        if (!subEntity) break;
        await BillingService.updateSubscriptionStatus(
          subEntity.id as string,
          "active"
        );
        break;
      }

      case "subscription.charged": {
        const subEntity = event.payload.subscription?.entity;
        if (!subEntity) break;

        await BillingService.updateSubscriptionStatus(
          subEntity.id as string,
          "active"
        );

        const paymentEntity = event.payload.payment?.entity;
        if (paymentEntity) {
          await supabase.from("payments").insert({
            razorpay_subscription_id: subEntity.id,
            razorpay_payment_id: paymentEntity.id,
            amount: paymentEntity.amount,
            currency: paymentEntity.currency || "INR",
            status: "captured",
          });
        }
        break;
      }

      case "subscription.pending": {
        const subEntity = event.payload.subscription?.entity;
        if (!subEntity) break;
        await BillingService.updateSubscriptionStatus(
          subEntity.id as string,
          "pending"
        );
        break;
      }

      case "subscription.halted": {
        const subEntity = event.payload.subscription?.entity;
        if (!subEntity) break;
        await BillingService.updateSubscriptionStatus(
          subEntity.id as string,
          "halted"
        );
        break;
      }

      case "subscription.cancelled": {
        const subEntity = event.payload.subscription?.entity;
        if (!subEntity) break;
        await BillingService.updateSubscriptionStatus(
          subEntity.id as string,
          "cancelled"
        );
        break;
      }

      case "subscription.expired": {
        const subEntity = event.payload.subscription?.entity;
        if (!subEntity) break;
        await BillingService.updateSubscriptionStatus(
          subEntity.id as string,
          "expired"
        );
        break;
      }

      case "subscription.completed": {
        const subEntity = event.payload.subscription?.entity;
        if (!subEntity) break;
        await BillingService.updateSubscriptionStatus(
          subEntity.id as string,
          "completed"
        );
        break;
      }

      default:
        logger.warn("Unhandled Razorpay webhook event type", { eventType });
    }
  },

  async updateSubscriptionStatus(
    razorpaySubscriptionId: string,
    status: string
  ): Promise<void> {
    const { error } = await supabase
      .from("subscriptions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("razorpay_subscription_id", razorpaySubscriptionId);

    if (error) {
      logger.error("Failed to update subscription status", {
        razorpaySubscriptionId,
        status,
        error: error.message,
      });
      throw new Error(`Failed to update subscription status: ${error.message}`);
    }

    logger.info("Subscription status updated", {
      razorpaySubscriptionId,
      status,
    });
  },

  async cancelSubscription(userId: string): Promise<void> {
    const currentPlan = await BillingService.getCurrentPlan(userId);

    if (!currentPlan) {
      throw new Error("No active subscription found.");
    }

    if (!currentPlan.razorpay_subscription_id) {
      throw new Error("Subscription has no associated Razorpay subscription ID.");
    }

    try {
      await razorpay.subscriptions.cancel(currentPlan.razorpay_subscription_id, false);
    } catch (err) {
      logger.error("Failed to cancel Razorpay subscription", {
        razorpaySubscriptionId: currentPlan.razorpay_subscription_id,
        error: err,
      });
      throw new Error("Failed to cancel subscription with payment provider.");
    }

    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: "cancelled" as SubscriptionStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", currentPlan.id)
      .eq("user_id", userId);

    if (error) {
      logger.error("Failed to update subscription status after cancellation", {
        userId,
        error: error.message,
      });
      throw new Error(`Failed to update subscription record: ${error.message}`);
    }

    logger.info("Subscription cancelled", {
      userId,
      subscriptionId: currentPlan.id,
    });
  },

  getPlanLimits(planName: string): { maxAlerts: number } {
    const config = PLAN_CONFIG[planName];
    if (config) {
      return { maxAlerts: config.maxAlerts };
    }
    return FREE_PLAN_LIMITS;
  },
};
