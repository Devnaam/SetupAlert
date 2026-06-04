import { Request, Response, NextFunction } from "express";
import { supabase } from "../../lib/supabase";
import { logger } from "../../lib/logger";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: "Missing or malformed Authorization header. Expected: Bearer <token>",
      });
      return;
    }

    const token = authHeader.substring(7);

    if (!token || token.trim().length === 0) {
      res.status(401).json({
        success: false,
        error: "Empty authentication token provided.",
      });
      return;
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn("Authentication failed", {
        error: error?.message,
        ip: req.ip,
      });
      res.status(401).json({
        success: false,
        error: "Invalid or expired authentication token.",
      });
      return;
    }

    (req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    logger.error("Auth middleware unexpected error", { error: err });
    res.status(401).json({
      success: false,
      error: "Authentication failed due to an internal error.",
    });
  }
};
