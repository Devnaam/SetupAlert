'use client';

import { useState, useCallback, useEffect } from 'react';
import type { AlertEvent } from '@/types/history';

interface HistoryFilters {
  symbol?: string;
  pattern?: string;
  timeframe?: string;
  startDate?: string;
  endDate?: string;
}

interface Pagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

interface UseHistoryReturn {
  events: AlertEvent[];
  loading: boolean;
  error: string | null;
  filters: HistoryFilters;
  setFilters: (filters: HistoryFilters) => void;
  pagination: Pagination;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
}

export function useHistory(): UseHistoryReturn {
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<HistoryFilters>({});
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    perPage: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', String(pagination.page));
      params.set('perPage', String(pagination.perPage));

      if (filters.symbol) params.set('symbol', filters.symbol);
      if (filters.pattern) params.set('pattern', filters.pattern);
      if (filters.timeframe) params.set('timeframe', filters.timeframe);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);

      const res = await fetch(`/api/history?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch history');
      }

      const data = await res.json();
      setEvents(data.events || []);
      setPagination((prev) => ({
        ...prev,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.perPage]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const handleSetFilters = useCallback((newFilters: HistoryFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  return {
    events,
    loading,
    error,
    filters,
    setFilters: handleSetFilters,
    pagination,
    setPage,
    refetch: fetchHistory,
  };
}
