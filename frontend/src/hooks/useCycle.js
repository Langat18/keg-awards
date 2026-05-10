import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

export function useCycle() {
  const [cycle, setCycle]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    api.get('/cycles/active')
      .then(r => { setCycle(r.data); setError(null); })
      .catch(err => {
        setCycle(null);
        setError(err.response?.data?.message || 'Failed to load cycle.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { cycle, loading, error, refetch: fetch };
}