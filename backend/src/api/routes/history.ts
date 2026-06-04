import { Router, Request, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";
import { HistoryService } from "../../services/history.service";
import { logger } from "../../lib/logger";

const router = Router();

// GET / — get paginated events
router.get("/", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const {
      page,
      limit,
      symbol,
      timeframe,
      pattern,
      startDate,
      endDate,
    } = req.query;

    const filters: {
      page?: number;
      limit?: number;
      symbol?: string;
      timeframe?: string;
      pattern?: string;
      startDate?: string;
      endDate?: string;
    } = {};

    if (page) {
      const parsed = parseInt(page as string, 10);
      if (!isNaN(parsed) && parsed > 0) filters.page = parsed;
    }

    if (limit) {
      const parsed = parseInt(limit as string, 10);
      if (!isNaN(parsed) && parsed > 0) filters.limit = parsed;
    }

    if (symbol && typeof symbol === "string") {
      filters.symbol = symbol;
    }

    if (timeframe && typeof timeframe === "string") {
      filters.timeframe = timeframe;
    }

    if (pattern && typeof pattern === "string") {
      filters.pattern = pattern;
    }

    if (startDate && typeof startDate === "string") {
      const dateObj = new Date(startDate);
      if (!isNaN(dateObj.getTime())) {
        filters.startDate = dateObj.toISOString();
      }
    }

    if (endDate && typeof endDate === "string") {
      const dateObj = new Date(endDate);
      if (!isNaN(dateObj.getTime())) {
        filters.endDate = dateObj.toISOString();
      }
    }

    const result = await HistoryService.getEventsByUserId(
      authReq.user.id,
      filters
    );

    res.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (err) {
    logger.error("GET /history error", { error: err });
    res.status(500).json({
      success: false,
      error: "Failed to fetch alert history.",
    });
  }
});

// GET /:id — get single event
router.get("/:id", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const eventId = String(req.params.id);
    const event = await HistoryService.getEventById(
      eventId,
      authReq.user.id
    );

    if (!event) {
      res.status(404).json({
        success: false,
        error: "Alert event not found.",
      });
      return;
    }

    res.json({ success: true, data: event });
  } catch (err) {
    logger.error("GET /history/:id error", { error: err });
    res.status(500).json({
      success: false,
      error: "Failed to fetch alert event.",
    });
  }
});

export { router as historyRouter };
