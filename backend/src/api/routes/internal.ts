import { Router, Request, Response } from "express";
import { HistoryService } from "../../services/history.service";
import { NotificationService } from "../../services/notification.service";
import { AlertService } from "../../services/alert.service";
import { logger } from "../../lib/logger";

const router = Router();

function verifyInternalApiKey(
  req: Request,
  res: Response,
  next: () => void
): void {
  const apiKey = req.headers["x-internal-api-key"] as string | undefined;
  const expectedKey = process.env.INTERNAL_API_KEY;

  if (!expectedKey) {
    logger.error("INTERNAL_API_KEY environment variable is not set.");
    res.status(500).json({
      success: false,
      error: "Internal endpoint not configured.",
    });
    return;
  }

  if (!apiKey || apiKey !== expectedKey) {
    logger.warn("Unauthorized internal API access attempt", { ip: req.ip });
    res.status(401).json({
      success: false,
      error: "Unauthorized. Invalid internal API key.",
    });
    return;
  }

  next();
}

// POST /trigger-alert — internal endpoint for worker to trigger alert
router.post(
  "/trigger-alert",
  verifyInternalApiKey,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        alert_id,
        triggered_price,
      } = req.body;

      if (!alert_id) {
        res.status(400).json({
          success: false,
          error: "alert_id is required.",
        });
        return;
      }

      if (triggered_price === undefined || triggered_price === null) {
        res.status(400).json({
          success: false,
          error: "triggered_price is required.",
        });
        return;
      }

      const triggerPrice = Number(triggered_price);
      if (isNaN(triggerPrice) || triggerPrice <= 0) {
        res.status(400).json({
          success: false,
          error: "triggered_price must be a positive number.",
        });
        return;
      }

      // Fetch the alert to get full details
      const { data: alertData, error: alertError } = await (await import("../../lib/supabase")).supabase
        .from("alerts")
        .select("*")
        .eq("id", alert_id)
        .single();

      if (alertError || !alertData) {
        logger.error("Alert not found for trigger", { alert_id, error: alertError?.message });
        res.status(404).json({
          success: false,
          error: "Alert not found.",
        });
        return;
      }

      // Create the alert event in history
      const alertEvent = await HistoryService.createEvent({
        user_id: alertData.user_id,
        alert_id: alertData.id,
        symbol: alertData.symbol,
        pattern: alertData.pattern,
        timeframe: alertData.timeframe,
        price_level: alertData.price_level,
        triggered_price: triggerPrice,
        message: alertData.message,
      });

      // Broadcast to user via Supabase Realtime
      await NotificationService.broadcastTrigger(alertData.user_id, alertEvent);

      logger.info("Alert triggered successfully", {
        alertId: alert_id,
        eventId: alertEvent.id,
        userId: alertData.user_id,
      });

      res.json({
        success: true,
        data: {
          event: alertEvent,
        },
      });
    } catch (err) {
      logger.error("POST /internal/trigger-alert error", { error: err });
      res.status(500).json({
        success: false,
        error: "Failed to trigger alert.",
      });
    }
  }
);

export { router as internalRouter };
