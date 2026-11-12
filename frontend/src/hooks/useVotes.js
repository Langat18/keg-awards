import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';

export function useVotes(cycleId) {
  const [myVotes, setMyVotes] = useState([]);
  const [loading, setLoading] = useState(Boolean(cycleId));

  const load = useCallback(() => {
    if (!cycleId) return Promise.resolve();
    setLoading(true);
    return api.get(`/cycles/${cycleId}/my-votes`)
      .then(({ data }) => setMyVotes(data))
      .catch(() => setMyVotes([]))
      .finally(() => setLoading(false));
  }, [cycleId]);

  useEffect(() => {
    load();
  }, [load]);

  const recordVote = useCallback((categoryId, nominationId) => {
    setMyVotes(votes => [
      ...votes.filter(v => v.category_id !== categoryId),
      { category_id: categoryId, nomination_id: nominationId },
    ]);
  }, []);

  return { myVotes, loading, recordVote, refetch: load };
}
