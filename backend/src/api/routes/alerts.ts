import { Router, Request, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";
import { planGuard } from "../middleware/plan-guard";
import { AlertService } from "../../services/alert.service";
import { SUPPORTED_SYMBOLS } from "../../config/symbols";
import { SUPPORTED_PATTERNS } from "../../config/patterns";
import { SUPPORTED_TIMEFRAMES } from "../../config/timeframes";
import { logger } from "../../lib/logger";

const router = Router();

function validateAlertInput(body: Record<string, unknown>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!body.symbol || typeof body.symbol !== "string") {
    errors.push("symbol is required and must be a string.");
  } else if (!SUPPORTED_SYMBOLS.includes(body.symbol as string)) {
    errors.push(
      `symbol must be one of: ${SUPPORTED_SYMBOLS.join(", ")}`
    );
  }

  if (!body.candle_pattern || typeof body.candle_pattern !== "string") {
    errors.push("candle_pattern is required and must be a string.");
  } else if (!SUPPORTED_PATTERNS.includes(body.candle_pattern as any)) {
    errors.push(
      `candle_pattern must be one of: ${SUPPORTED_PATTERNS.join(", ")}`
    );
  }

  if (!body.timeframe || typeof body.timeframe !== "string") {
    errors.push("timeframe is required and must be a string.");
  } else if (!SUPPORTED_TIMEFRAMES.includes(body.timeframe as string)) {
    errors.push(
      `timeframe must be one of: ${SUPPORTED_TIMEFRAMES.join(", ")}`
    );
  }

  if (body.price_level === undefined || body.price_level === null) {
    errors.push("price_level is required.");
  } else {
    const priceLevel = Number(body.price_level);
    if (isNaN(priceLevel) || priceLevel <= 0) {
      errors.push("price_level must be a positive number.");
    }
  }

  return { valid: errors.length === 0, errors };
}

function validateUpdateInput(body: Record<string, unknown>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (body.symbol !== undefined) {
    if (typeof body.symbol !== "string") {
      errors.push("symbol must be a string.");
    } else if (!SUPPORTED_SYMBOLS.includes(body.symbol as string)) {
      errors.push(
        `symbol must be one of: ${SUPPORTED_SYMBOLS.join(", ")}`
      );
    }
  }

  if (body.candle_pattern !== undefined) {
    if (typeof body.candle_pattern !== "string") {
      errors.push("candle_pattern must be a string.");
    } else if (!SUPPORTED_PATTERNS.includes(body.candle_pattern as any)) {
      errors.push(
        `candle_pattern must be one of: ${SUPPORTED_PATTERNS.join(", ")}`
      );
    }
  }

  if (body.timeframe !== undefined) {
    if (typeof body.timeframe !== "string") {
      errors.push("timeframe must be a string.");
    } else if (!SUPPORTED_TIMEFRAMES.includes(body.timeframe as string)) {
      errors.push(
        `timeframe must be one of: ${SUPPORTED_TIMEFRAMES.join(", ")}`
      );
    }
  }

  if (body.price_level !== undefined) {
    const priceLevel = Number(body.price_level);
    if (isNaN(priceLevel) || priceLevel <= 0) {
      errors.push("price_level must be a positive number.");
    }
  }

  return { valid: errors.length === 0, errors };
}

// GET / — get all alerts for user
router.get("/", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const alerts = await AlertService.getAlertsByUserId(authReq.user.id);
    res.json({ success: true, data: alerts });
  } catch (err) {
    logger.error("GET /alerts error", { error: err });
    res.status(500).json({ success: false, error: "Failed to fetch alerts." });
  }
});

// GET /:id — get single alert
router.get("/:id", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const alertId = String(req.params.id);
    const alert = await AlertService.getAlertById(alertId, authReq.user.id);

    if (!alert) {
      res.status(404).json({ success: false, error: "Alert not found." });
      return;
    }

    res.json({ success: true, data: alert });
  } catch (err) {
    logger.error("GET /alerts/:id error", { error: err });
    res.status(500).json({ success: false, error: "Failed to fetch alert." });
  }
});

// POST / — create alert
router.post(
  "/",
  authMiddleware,
  planGuard(),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const validation = validateAlertInput(req.body);

      if (!validation.valid) {
        res.status(400).json({
          success: false,
          error: "Validation failed.",
          details: validation.errors,
        });
        return;
      }

      const alert = await AlertService.createAlert(authReq.user.id, {
        symbol: req.body.symbol,
        price_level: Number(req.body.price_level),
        candle_pattern: req.body.candle_pattern,
        timeframe: req.body.timeframe,
        mode: req.body.mode || "simple",
      } as any);

      res.status(201).json({ success: true, data: alert });
    } catch (err) {
      logger.error("POST /alerts error", { error: err });
      res.status(500).json({ success: false, error: "Failed to create alert." });
    }
  }
);

// PUT /:id — update alert
router.put("/:id", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const validation = validateUpdateInput(req.body);

    if (!validation.valid) {
      res.status(400).json({
        success: false,
        error: "Validation failed.",
        details: validation.errors,
      });
      return;
    }
    const alertId = String(req.params.id);
    const updateInput: Record<string, unknown> = {};
    if (req.body.symbol !== undefined) updateInput.symbol = req.body.symbol;
    if (req.body.price_level !== undefined) updateInput.price_level = Number(req.body.price_level);
    if (req.body.candle_pattern !== undefined) updateInput.candle_pattern = req.body.candle_pattern;
    if (req.body.timeframe !== undefined) updateInput.timeframe = req.body.timeframe;
    if (req.body.mode !== undefined) updateInput.mode = req.body.mode;
    if (req.body.is_active !== undefined) updateInput.is_active = req.body.is_active;

    const alert = await AlertService.updateAlert(
      alertId,
      authReq.user.id,
      updateInput as any
    );

    res.json({ success: true, data: alert });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update alert.";
    const status = message.includes("not found") ? 404 : 500;
    logger.error("PUT /alerts/:id error", { error: err });
    res.status(status).json({ success: false, error: message });
  }
});

// POST /:id/duplicate — duplicate alert
router.post(
  "/:id/duplicate",
  authMiddleware,
  planGuard(),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const alertId = String(req.params.id);
      const alert = await AlertService.duplicateAlert(alertId, authReq.user.id);
      res.status(201).json({ success: true, data: alert });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to duplicate alert.";
      const status = message.includes("not found") ? 404 : 500;
      logger.error("POST /alerts/:id/duplicate error", { error: err });
      res.status(status).json({ success: false, error: message });
    }
  }
);

// POST /:id/toggle — toggle active status
router.post(
  "/:id/toggle",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const alertId = String(req.params.id);
      const alert = await AlertService.toggleAlert(alertId, authReq.user.id);
      res.json({ success: true, data: alert });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to toggle alert.";
      const status = message.includes("not found") ? 404 : 500;
      logger.error("POST /alerts/:id/toggle error", { error: err });
      res.status(status).json({ success: false, error: message });
    }
  }
);

// DELETE /:id — delete alert
router.delete("/:id", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const alertId = String(req.params.id);
    await AlertService.deleteAlert(alertId, authReq.user.id);
    res.json({ success: true, message: "Alert deleted successfully." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete alert.";
    const status = message.includes("not found") ? 404 : 500;
    logger.error("DELETE /alerts/:id error", { error: err });
    res.status(status).json({ success: false, error: message });
  }
});

export { router as alertsRouter };
