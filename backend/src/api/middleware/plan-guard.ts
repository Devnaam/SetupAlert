import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth";
import { AlertService } from "../../services/alert.service";
import { BillingService } from "../../services/billing.service";
import { logger } from "../../lib/logger";

const PLAN_ALERT_LIMITS: Record<string, number> = {
  free: 3,
  pro: 25,
  annual: 25,
};

export const planGuard = (maxAlerts?: number) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user.id;

      const currentPlan = await BillingService.getCurrentPlan(userId);
      const planName = currentPlan?.plan ?? "free";

      const limit =
        maxAlerts !== undefined
          ? maxAlerts
          : PLAN_ALERT_LIMITS[planName] ?? PLAN_ALERT_LIMITS.free;

      const activeCount = await AlertService.getActiveAlertCount(userId);

      if (activeCount >= limit) {
        logger.info("Plan limit reached", {
          userId,
          plan: planName,
          activeCount,
          limit,
        });
        res.status(403).json({
          success: false,
          error: `You have reached the maximum number of active alerts (${limit}) for your ${planName} plan. Please upgrade your plan to create more alerts.`,
          currentCount: activeCount,
          limit,
          plan: planName,
        });
        return;
      }

      next();
    } catch (err) {
      logger.error("Plan guard middleware error", { error: err });
      res.status(500).json({
        success: false,
        error: "Failed to verify plan limits.",
      });
    }
  };
};
