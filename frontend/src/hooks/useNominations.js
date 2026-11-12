import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';

export function useNominations(cycleId) {
  const [nominations, setNominations] = useState([]);
  const [loading, setLoading] = useState(Boolean(cycleId));

  const load = useCallback(() => {
    if (!cycleId) return Promise.resolve();
    setLoading(true);
    return api.get(`/cycles/${cycleId}/nominations`)
      .then(({ data }) => setNominations(data))
      .catch(() => setNominations([]))
      .finally(() => setLoading(false));
  }, [cycleId]);

  useEffect(() => {
    load();
  }, [load]);

  return { nominations, loading, refetch: load };
}
