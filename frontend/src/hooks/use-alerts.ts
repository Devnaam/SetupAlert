'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Alert, AlertCreateInput, AlertUpdateInput } from '@/types/alert';

interface UseAlertsReturn {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createAlert: (input: AlertCreateInput) => Promise<Alert | null>;
  updateAlert: (id: string, input: AlertUpdateInput) => Promise<Alert | null>;
  deleteAlert: (id: string) => Promise<boolean>;
  toggleAlert: (id: string, isActive: boolean) => Promise<Alert | null>;
  duplicateAlert: (id: string) => Promise<Alert | null>;
}

export function useAlerts(): UseAlertsReturn {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/alerts');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch alerts');
      }
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const createAlert = useCallback(async (input: AlertCreateInput): Promise<Alert | null> => {
    try {
      setError(null);
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create alert');
      }
      const data = await res.json();
      const newAlert = data.alert as Alert;
      setAlerts((prev) => [newAlert, ...prev]);
      return newAlert;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alert');
      return null;
    }
  }, []);

  const updateAlert = useCallback(async (id: string, input: AlertUpdateInput): Promise<Alert | null> => {
    try {
      setError(null);
      const res = await fetch(`/api/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update alert');
      }
      const data = await res.json();
      const updated = data.alert as Alert;
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update alert');
      return null;
    }
  }, []);

  const deleteAlert = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const res = await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete alert');
      }
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete alert');
      return false;
    }
  }, []);

  const toggleAlert = useCallback(async (id: string, isActive: boolean): Promise<Alert | null> => {
    return updateAlert(id, { is_active: isActive });
  }, [updateAlert]);

  const duplicateAlert = useCallback(async (id: string): Promise<Alert | null> => {
    const alertToDuplicate = alerts.find((a) => a.id === id);
    if (!alertToDuplicate) {
      setError('Alert not found');
      return null;
    }
    const input: AlertCreateInput = {
      mode: alertToDuplicate.mode,
      symbol: alertToDuplicate.symbol,
      price_level: alertToDuplicate.price_level,
      candle_pattern: alertToDuplicate.candle_pattern,
      timeframe: alertToDuplicate.timeframe,
      custom_message: alertToDuplicate.custom_message,
      generated_message: alertToDuplicate.generated_message,
    };
    return createAlert(input);
  }, [alerts, createAlert]);

  return {
    alerts,
    loading,
    error,
    refetch: fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlert,
    duplicateAlert,
  };
}
