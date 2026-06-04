import { supabase } from "../lib/supabase";
import { logger } from "../lib/logger";
import { Alert, AlertCreateInput, AlertUpdateInput } from "../types/alert";

const PATTERN_DISPLAY_NAMES: Record<string, string> = {
  hammer: "hammer",
  "inverted-hammer": "inverted hammer",
  "bullish-engulfing": "bullish engulfing",
  "bearish-engulfing": "bearish engulfing",
  doji: "doji",
  "shooting-star": "shooting star",
  "morning-star": "morning star",
  "evening-star": "evening star",
};

function generateAlertMessage(
  symbol: string,
  priceLevel: number,
  pattern: string,
  timeframe: string
): string {
  const patternName = PATTERN_DISPLAY_NAMES[pattern] || pattern;
  return `${symbol} hit ${priceLevel} and formed a ${patternName} candle on ${timeframe} timeframe.`;
}

export const AlertService = {
  async getAlertsByUserId(userId: string): Promise<Alert[]> {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Failed to fetch alerts for user", { userId, error: error.message });
      throw new Error(`Failed to fetch alerts: ${error.message}`);
    }

    return data as Alert[];
  },

  async getAlertById(alertId: string, userId: string): Promise<Alert | null> {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("id", alertId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      logger.error("Failed to fetch alert", { alertId, userId, error: error.message });
      throw new Error(`Failed to fetch alert: ${error.message}`);
    }

    return data as Alert;
  },

  async createAlert(userId: string, input: AlertCreateInput): Promise<Alert> {
    const message = generateAlertMessage(
      input.symbol,
      input.price_level as number,
      input.candle_pattern as string,
      input.timeframe as string
    );

    const { data, error } = await supabase
      .from("alerts")
      .insert({
        user_id: userId,
        symbol: input.symbol,
        price_level: input.price_level,
        candle_pattern: input.candle_pattern,
        timeframe: input.timeframe,
        mode: input.mode || "simple",
        generated_message: message,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      logger.error("Failed to create alert", { userId, error: error.message });
      throw new Error(`Failed to create alert: ${error.message}`);
    }

    logger.info("Alert created", { alertId: data.id, userId });
    return data as Alert;
  },

  async updateAlert(
    alertId: string,
    userId: string,
    input: AlertUpdateInput
  ): Promise<Alert> {
    const existing = await AlertService.getAlertById(alertId, userId);
    if (!existing) {
      throw new Error("Alert not found or access denied.");
    }

    const updatedSymbol = input.symbol ?? existing.symbol;
    const updatedPriceLevel = input.price_level ?? existing.price_level;
    const updatedPattern = input.candle_pattern ?? existing.candle_pattern;
    const updatedTimeframe = input.timeframe ?? existing.timeframe;

    const message = generateAlertMessage(
      updatedSymbol,
      updatedPriceLevel as number,
      updatedPattern as string,
      updatedTimeframe as string
    );

    const updatePayload: Record<string, unknown> = { generated_message: message };
    if (input.symbol !== undefined) updatePayload.symbol = input.symbol;
    if (input.price_level !== undefined) updatePayload.price_level = input.price_level;
    if (input.candle_pattern !== undefined) updatePayload.candle_pattern = input.candle_pattern;
    if (input.timeframe !== undefined) updatePayload.timeframe = input.timeframe;
    if (input.mode !== undefined) updatePayload.mode = input.mode;
    if (input.is_active !== undefined) updatePayload.is_active = input.is_active;

    const { data, error } = await supabase
      .from("alerts")
      .update(updatePayload)
      .eq("id", alertId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      logger.error("Failed to update alert", { alertId, userId, error: error.message });
      throw new Error(`Failed to update alert: ${error.message}`);
    }

    logger.info("Alert updated", { alertId, userId });
    return data as Alert;
  },

  async duplicateAlert(alertId: string, userId: string): Promise<Alert> {
    const original = await AlertService.getAlertById(alertId, userId);
    if (!original) {
      throw new Error("Alert not found or access denied.");
    }

    const message = generateAlertMessage(
      original.symbol,
      original.price_level as number,
      original.candle_pattern as string,
      original.timeframe as string
    );

    const { data, error } = await supabase
      .from("alerts")
      .insert({
        user_id: userId,
        symbol: original.symbol,
        price_level: original.price_level,
        candle_pattern: original.candle_pattern,
        timeframe: original.timeframe,
        mode: original.mode,
        generated_message: message,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      logger.error("Failed to duplicate alert", { alertId, userId, error: error.message });
      throw new Error(`Failed to duplicate alert: ${error.message}`);
    }

    logger.info("Alert duplicated", { originalId: alertId, newId: data.id, userId });
    return data as Alert;
  },

  async toggleAlert(alertId: string, userId: string): Promise<Alert> {
    const existing = await AlertService.getAlertById(alertId, userId);
    if (!existing) {
      throw new Error("Alert not found or access denied.");
    }

    const { data, error } = await supabase
      .from("alerts")
      .update({ is_active: !existing.is_active })
      .eq("id", alertId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      logger.error("Failed to toggle alert", { alertId, userId, error: error.message });
      throw new Error(`Failed to toggle alert: ${error.message}`);
    }

    logger.info("Alert toggled", {
      alertId,
      userId,
      isActive: data.is_active,
    });
    return data as Alert;
  },

  async deleteAlert(alertId: string, userId: string): Promise<void> {
    const existing = await AlertService.getAlertById(alertId, userId);
    if (!existing) {
      throw new Error("Alert not found or access denied.");
    }

    const { error } = await supabase
      .from("alerts")
      .delete()
      .eq("id", alertId)
      .eq("user_id", userId);

    if (error) {
      logger.error("Failed to delete alert", { alertId, userId, error: error.message });
      throw new Error(`Failed to delete alert: ${error.message}`);
    }

    logger.info("Alert deleted", { alertId, userId });
  },

  async getActiveAlertCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from("alerts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_active", true);

    if (error) {
      logger.error("Failed to count active alerts", { userId, error: error.message });
      throw new Error(`Failed to count active alerts: ${error.message}`);
    }

    return count ?? 0;
  },

  async getAllActiveAlerts(): Promise<Alert[]> {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("is_active", true);

    if (error) {
      logger.error("Failed to fetch all active alerts", { error: error.message });
      throw new Error(`Failed to fetch all active alerts: ${error.message}`);
    }

    return data as Alert[];
  },
};
