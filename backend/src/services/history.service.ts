import { supabase } from "../lib/supabase";
import { logger } from "../lib/logger";

export interface AlertEvent {
  id: string;
  user_id: string;
  alert_id: string;
  symbol: string;
  pattern: string;
  timeframe: string;
  price_level: number;
  triggered_price: number;
  message: string;
  triggered_at: string;
  created_at: string;
}

export interface EventFilters {
  symbol?: string;
  timeframe?: string;
  pattern?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedEvents {
  data: AlertEvent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const HistoryService = {
  async getEventsByUserId(
    userId: string,
    filters: EventFilters = {}
  ): Promise<PaginatedEvents> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? Math.min(filters.limit, 100) : 20;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("alert_events")
      .select("*", { count: "exact" })
      .eq("user_id", userId);

    if (filters.symbol) {
      query = query.eq("symbol", filters.symbol);
    }

    if (filters.timeframe) {
      query = query.eq("timeframe", filters.timeframe);
    }

    if (filters.pattern) {
      query = query.eq("pattern", filters.pattern);
    }

    if (filters.startDate) {
      query = query.gte("triggered_at", filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte("triggered_at", filters.endDate);
    }

    query = query
      .order("triggered_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      logger.error("Failed to fetch alert events", { userId, error: error.message });
      throw new Error(`Failed to fetch alert events: ${error.message}`);
    }

    const total = count ?? 0;

    return {
      data: (data as AlertEvent[]) || [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getEventById(eventId: string, userId: string): Promise<AlertEvent | null> {
    const { data, error } = await supabase
      .from("alert_events")
      .select("*")
      .eq("id", eventId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      logger.error("Failed to fetch alert event", { eventId, userId, error: error.message });
      throw new Error(`Failed to fetch alert event: ${error.message}`);
    }

    return data as AlertEvent;
  },

  async createEvent(eventData: {
    user_id: string;
    alert_id: string;
    symbol: string;
    pattern: string;
    timeframe: string;
    price_level: number;
    triggered_price: number;
    message: string;
    triggered_at?: string;
  }): Promise<AlertEvent> {
    const { data, error } = await supabase
      .from("alert_events")
      .insert({
        user_id: eventData.user_id,
        alert_id: eventData.alert_id,
        symbol: eventData.symbol,
        pattern: eventData.pattern,
        timeframe: eventData.timeframe,
        price_level: eventData.price_level,
        triggered_price: eventData.triggered_price,
        message: eventData.message,
        triggered_at: eventData.triggered_at || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error("Failed to create alert event", {
        alertId: eventData.alert_id,
        error: error.message,
      });
      throw new Error(`Failed to create alert event: ${error.message}`);
    }

    logger.info("Alert event created", {
      eventId: data.id,
      alertId: eventData.alert_id,
      userId: eventData.user_id,
    });

    return data as AlertEvent;
  },
};
