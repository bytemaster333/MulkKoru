import { useState, useEffect, useCallback } from 'react';
import { tenantService } from '../services/tenantService';
import type { Tenant } from '../types';

export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tenantService.getAll();
      setTenants(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Kiracılar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { tenants, loading, error, refetch: load };
}
