import "dotenv/config";

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { logger } from "./lib/logger";
import { alertsRouter } from "./api/routes/alerts";
import { historyRouter } from "./api/routes/history";
import { billingRouter } from "./api/routes/billing";
import { internalRouter } from "./api/routes/internal";

const app = express();
const PORT = parseInt(process.env.PORT || "4000", 10);

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Internal-Api-Key"],
  })
);

// JSON body parser with raw body capture for webhook signature verification
app.use(
  express.json({
    verify: (
      req: express.Request & { rawBody?: Buffer },
      _res: express.Response,
      buf: Buffer
    ) => {
      // Store raw body for webhook signature verification
      if (req.url && req.url.includes("/billing/webhook")) {
        req.rawBody = buf;
      }
    },
  })
);

// URL-encoded body parser
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount routes
app.use("/api/alerts", alertsRouter);
app.use("/api/history", historyRouter);
app.use("/api/billing", billingRouter);
app.use("/api/internal", internalRouter);

// 404 handler for unmatched routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found.",
  });
});

// Global error handler
app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error("Unhandled error", {
      message: err.message,
      stack: err.stack,
    });

    res.status(500).json({
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "An internal server error occurred."
          : err.message,
    });
  }
);

// Start server
app.listen(PORT, () => {
  logger.info(`StrategyAlert API server started`, {
    port: PORT,
    environment: process.env.NODE_ENV || "development",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  });
  console.log(`🚀 StrategyAlert API running on port ${PORT}`);
});

export { app };
