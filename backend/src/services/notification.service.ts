import { supabase } from "../lib/supabase";
import { logger } from "../lib/logger";
import { AlertEvent } from "./history.service";

export const NotificationService = {
  async broadcastTrigger(
    userId: string,
    alertEvent: AlertEvent
  ): Promise<void> {
    try {
      const channelName = `user:${userId}:alerts`;

      const channel = supabase.channel(channelName);

      const result = await channel.send({
        type: "broadcast",
        event: "alert-triggered",
        payload: {
          id: alertEvent.id,
          alert_id: alertEvent.alert_id,
          symbol: alertEvent.symbol,
          pattern: alertEvent.pattern,
          timeframe: alertEvent.timeframe,
          price_level: alertEvent.price_level,
          triggered_price: alertEvent.triggered_price,
          message: alertEvent.message,
          triggered_at: alertEvent.triggered_at,
        },
      });

      if (result !== "ok") {
        logger.warn("Broadcast may not have been delivered", {
          userId,
          eventId: alertEvent.id,
          result,
        });
      } else {
        logger.info("Alert trigger broadcast sent", {
          userId,
          eventId: alertEvent.id,
          channel: channelName,
        });
      }

      await supabase.removeChannel(channel);
    } catch (err) {
      logger.error("Failed to broadcast alert trigger", {
        userId,
        eventId: alertEvent.id,
        error: err,
      });
      throw new Error("Failed to broadcast alert notification.");
    }
  },
};
