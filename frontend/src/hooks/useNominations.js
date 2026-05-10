import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

export function useNominations(cycleId) {
  const [nominations, setNominations] = useState([]);
  const [loading, setLoading]         = useState(false);

  const fetch = useCallback(() => {
    if (!cycleId) return;
    setLoading(true);
    api.get(`/cycles/${cycleId}/nominations`)
      .then(r => setNominations(r.data))
      .catch(() => setNominations([]))
      .finally(() => setLoading(false));
  }, [cycleId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { nominations, loading, refetch: fetch };
}