import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { logger } from "../../lib/logger";

export const webhookVerify = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string | undefined;

    if (!signature) {
      logger.warn("Webhook request missing X-Razorpay-Signature header", {
        ip: req.ip,
      });
      res.status(400).json({
        success: false,
        error: "Missing X-Razorpay-Signature header.",
      });
      return;
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      logger.error("RAZORPAY_WEBHOOK_SECRET environment variable is not set.");
      res.status(500).json({
        success: false,
        error: "Webhook verification is not configured.",
      });
      return;
    }

    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;

    if (!rawBody) {
      logger.error("Raw body not available for webhook signature verification.");
      res.status(400).json({
        success: false,
        error: "Unable to verify webhook signature: raw body not available.",
      });
      return;
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );

    if (!isValid) {
      logger.warn("Invalid Razorpay webhook signature", { ip: req.ip });
      res.status(400).json({
        success: false,
        error: "Invalid webhook signature.",
      });
      return;
    }

    logger.info("Razorpay webhook signature verified successfully");
    next();
  } catch (err) {
    logger.error("Webhook verification error", { error: err });
    res.status(400).json({
      success: false,
      error: "Webhook signature verification failed.",
    });
  }
};
