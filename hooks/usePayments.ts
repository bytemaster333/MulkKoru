import { useState, useEffect, useCallback } from 'react';
import { paymentService } from '../services/paymentService';
import type { Payment, DashboardStats } from '../types';

export function useUpcomingPayments(days = 30) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getUpcoming(days);
      setPayments(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ödemeler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  return { payments, loading, error, refetch: load };
}

export function useDashboardStats() {
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getDashboardStats();
      setStats(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'İstatistikler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { stats, loading, error, refetch: load };
}

export function useMonthlyPayments(year: number, month: number) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await paymentService.getByMonth(year, month);
      setPayments(data);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  return { payments, loading, refetch: load };
}
