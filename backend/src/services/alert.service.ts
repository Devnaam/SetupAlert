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
  mode: string,
  symbol: string,
  priceLevel: number | null,
  pattern: string | null,
  timeframe: string | null,
  repetitionCount: number | null
): string {
  const patternName = pattern ? (PATTERN_DISPLAY_NAMES[pattern] || pattern) : "";
  const formattedPrice = priceLevel ? priceLevel.toLocaleString() : "";

  switch (mode) {
    case "price":
      return `${symbol} touched ${formattedPrice}.`;
    case "pattern":
      return `${symbol} formed a ${patternName} candle on the ${timeframe} timeframe.`;
    case "repeated_pattern": {
      const numToWord: Record<number, string> = { 2: "two", 3: "three", 4: "four", 5: "five" };
      const word = numToWord[repetitionCount || 2] || String(repetitionCount || 2);
      return `${symbol} formed ${word} consecutive ${patternName} candles on the ${timeframe} timeframe.`;
    }
    case "level_pattern":
    default:
      return `${symbol} touched ${formattedPrice} and formed a ${patternName} candle on the ${timeframe} timeframe.`;
  }
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
      input.mode,
      input.symbol,
      input.price_level || null,
      input.candle_pattern || null,
      input.timeframe || null,
      input.repetition_count || null
    );

    const insertPayload: Record<string, unknown> = {
      user_id: userId,
      symbol: input.symbol,
      mode: input.mode,
      generated_message: message,
      play_count: input.play_count ?? 1,
      custom_message: input.custom_message ?? null,
      is_active: true,
    };
    if (input.price_level != null) insertPayload.price_level = input.price_level;
    if (input.candle_pattern != null) insertPayload.candle_pattern = input.candle_pattern;
    if (input.timeframe != null) insertPayload.timeframe = input.timeframe;
    if (input.repetition_count != null) insertPayload.repetition_count = input.repetition_count;

    const { data, error } = await supabase
      .from("alerts")
      .insert(insertPayload)
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
    const updatedMode = input.mode ?? existing.mode;

    let updatedPriceLevel = input.price_level !== undefined ? input.price_level : existing.price_level;
    let updatedPattern = input.candle_pattern !== undefined ? input.candle_pattern : existing.candle_pattern;
    let updatedTimeframe = input.timeframe !== undefined ? input.timeframe : existing.timeframe;
    let updatedRepetitionCount = input.repetition_count !== undefined ? input.repetition_count : existing.repetition_count;

    // Clean up fields based on the mode
    if (updatedMode === 'price') {
      updatedPattern = null;
      updatedTimeframe = null;
      updatedRepetitionCount = null;
    } else if (updatedMode === 'pattern') {
      updatedPriceLevel = null;
      updatedRepetitionCount = null;
    } else if (updatedMode === 'repeated_pattern') {
      updatedPriceLevel = null;
    } else if (updatedMode === 'level_pattern') {
      updatedRepetitionCount = null;
    }

    const updatedPlayCount = input.play_count !== undefined ? input.play_count : existing.play_count;
    const updatedCustomMessage = input.custom_message !== undefined ? input.custom_message : existing.custom_message;

    const message = generateAlertMessage(
      updatedMode,
      updatedSymbol,
      updatedPriceLevel,
      updatedPattern,
      updatedTimeframe,
      updatedRepetitionCount
    );

    const updatePayload: Record<string, unknown> = {
      generated_message: message,
      price_level: updatedPriceLevel,
      candle_pattern: updatedPattern,
      timeframe: updatedTimeframe,
      repetition_count: updatedRepetitionCount,
    };

    if (input.symbol !== undefined) updatePayload.symbol = input.symbol;
    if (input.mode !== undefined) updatePayload.mode = input.mode;
    if (input.play_count !== undefined) updatePayload.play_count = input.play_count;
    if (input.custom_message !== undefined) updatePayload.custom_message = input.custom_message;
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
      original.mode,
      original.symbol,
      original.price_level,
      original.candle_pattern,
      original.timeframe,
      original.repetition_count
    );

    const dupPayload: Record<string, unknown> = {
      user_id: userId,
      symbol: original.symbol,
      mode: original.mode,
      generated_message: message,
      play_count: original.play_count,
      custom_message: original.custom_message,
      is_active: true,
    };
    if (original.price_level != null) dupPayload.price_level = original.price_level;
    if (original.candle_pattern != null) dupPayload.candle_pattern = original.candle_pattern;
    if (original.timeframe != null) dupPayload.timeframe = original.timeframe;
    if (original.repetition_count != null) dupPayload.repetition_count = original.repetition_count;

    const { data, error } = await supabase
      .from("alerts")
      .insert(dupPayload)
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
