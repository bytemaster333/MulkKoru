import { useState, useEffect, useCallback } from 'react';
import { contractService } from '../services/contractService';
import type { Contract } from '../types';

export function useContracts(propertyId?: string) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = propertyId
        ? await contractService.getByProperty(propertyId)
        : await contractService.getAll();
      setContracts(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sözleşmeler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => { load(); }, [load]);

  return { contracts, loading, error, refetch: load };
}
