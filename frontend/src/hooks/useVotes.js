import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

export function useVotes(cycleId) {
  const [myVotes, setMyVotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(() => {
    if (!cycleId) return;
    setLoading(true);
    api.get(`/cycles/${cycleId}/my-votes`)
      .then(r => setMyVotes(r.data))
      .catch(() => setMyVotes([]))
      .finally(() => setLoading(false));
  }, [cycleId]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateLocal = (categoryId, nominationId) => {
    setMyVotes(v => [
      ...v.filter(x => x.category_id !== categoryId),
      { category_id: categoryId, nomination_id: nominationId },
    ]);
  };

  return { myVotes, loading, updateLocal, refetch: fetch };
}
