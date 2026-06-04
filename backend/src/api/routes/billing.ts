import { Router, Request, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";
import { webhookVerify } from "../middleware/webhook-verify";
import { BillingService } from "../../services/billing.service";
import { PlanName } from "../../types/billing";
import { logger } from "../../lib/logger";

const router = Router();

// GET /current-plan — get current plan
router.get(
  "/current-plan",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const subscription = await BillingService.getCurrentPlan(authReq.user.id);

      const planName = subscription?.plan ?? "free";
      const limits = BillingService.getPlanLimits(planName);

      res.json({
        success: true,
        data: {
          plan: planName,
          status: subscription?.status ?? "active",
          limits,
          subscription: subscription || null,
        },
      });
    } catch (err) {
      logger.error("GET /billing/current-plan error", { error: err });
      res.status(500).json({
        success: false,
        error: "Failed to fetch current plan.",
      });
    }
  }
);

// POST /create-subscription — create Razorpay subscription checkout
router.post(
  "/create-subscription",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { planName } = req.body;

      if (!planName || !["pro", "annual"].includes(planName)) {
        res.status(400).json({
          success: false,
          error: "Invalid plan name. Must be one of: pro, annual.",
        });
        return;
      }

      const result = await BillingService.createSubscription(
        authReq.user.id,
        planName as PlanName
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create subscription.";
      const status = message.includes("already have") ? 409 : 500;
      logger.error("POST /billing/create-subscription error", { error: err });
      res.status(status).json({ success: false, error: message });
    }
  }
);

// POST /webhook — handle Razorpay webhook (NO auth middleware)
router.post(
  "/webhook",
  webhookVerify,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const event = req.body;

      if (!event || !event.event) {
        res.status(400).json({
          success: false,
          error: "Invalid webhook payload.",
        });
        return;
      }

      await BillingService.handleWebhook(event);

      res.json({ success: true, message: "Webhook processed successfully." });
    } catch (err) {
      logger.error("POST /billing/webhook error", { error: err });
      res.status(500).json({
        success: false,
        error: "Webhook processing failed.",
      });
    }
  }
);

// POST /cancel — cancel subscription
router.post(
  "/cancel",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      await BillingService.cancelSubscription(authReq.user.id);

      res.json({
        success: true,
        message: "Subscription cancelled successfully.",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to cancel subscription.";
      const status = message.includes("No active") ? 404 : 500;
      logger.error("POST /billing/cancel error", { error: err });
      res.status(status).json({ success: false, error: message });
    }
  }
);

export { router as billingRouter };
