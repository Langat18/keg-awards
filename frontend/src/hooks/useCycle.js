import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';

export function useCycle() {
  const [cycle, setCycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    return api.get('/cycles/active')
      .then(({ data }) => {
        setCycle(data);
        setError(null);
      })
      .catch(err => {
        setCycle(null);
        setError(err.response?.status === 404 ? null : 'The awards cycle could not be loaded.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { cycle, loading, error, refetch: load };
}
