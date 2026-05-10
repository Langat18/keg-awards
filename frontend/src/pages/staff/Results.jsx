
import { useEffect, useState } from 'react';
import { useCycle } from '../../hooks/useCycle';
import { PageSkeleton } from '../../components/Skeleton';
import PhaseBanner from '../../components/PhaseBanner';
import Card from '../../components/Card';
import api from '../../api/axios';

export default function Results() {
  const { cycle, loading }   = useCycle();
  const [results, setResults] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!cycle || cycle.phase !== 'results') return;
    setFetching(true);
    api.get(`/cycles/${cycle.id}/results`)
      .then(r => setResults(r.data))
      .finally(() => setFetching(false));
  }, [cycle?.id, cycle?.phase]);

  if (loading || fetching) return <PageSkeleton />;
  if (!cycle || cycle.phase !== 'results') {
    return <PhaseBanner phase={cycle?.phase} expected="results" label="Results" />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#7F622C] mb-1">🏅 Results</h2>
      <p className="text-gray-500 text-sm mb-6">{cycle.title}</p>

      {results.length === 0 ? (
        <p className="text-gray-400 text-sm">No votes were cast in this cycle.</p>
      ) : (
        <div className="space-y-6">
          {results.map(cat => (
            <Card key={cat.category_id}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-800">{cat.category_name}</h4>
                <span className="text-xs text-gray-400">
                  {cat.total_votes} vote{cat.total_votes !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-3">
                {cat.nominees.map(n => (
                  <div
                    key={n.nomination_id}
                    className={`rounded-xl p-4 border ${
                      n.is_winner
                        ? 'bg-[#CBD300]/10 border-[#CBD300]'
                        : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold text-gray-800 text-sm">
                          {n.is_winner && '🥇 '}{n.nominee_name}
                        </span>
                        {n.department && (
                          <span className="text-xs text-gray-400 ml-2">{n.department}</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-gray-600">
                        {n.vote_count} vote{n.vote_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            n.is_winner ? 'bg-[#CBD300]' : 'bg-[#7F622C]/40'
                          }`}
                          style={{ width: `${n.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-10 text-right">{n.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}