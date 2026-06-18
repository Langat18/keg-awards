import { useEffect, useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { PageSkeleton } from '../../components/Skeleton';
import Card from '../../components/Card';
import api from '../../api/axios';

export default function Results() {
  const { canViewResults }        = useAuth();
  const [cycle, setCycle]         = useState(null);
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    if (!canViewResults) { setLoading(false); return; }

    api.get('/cycles/active-with-results')
      .then(r => {
        setCycle(r.data);
        return api.get(`/cycles/${r.data.id}/results`);
      })
      .then(r => setResults(r.data))
      .catch(err => {
        if (err.response?.status === 404) setError('No results have been published yet.');
        else if (err.response?.status === 403) setError('You do not have permission to view results.');
        else setError('Failed to load results.');
      })
      .finally(() => setLoading(false));
  }, [canViewResults]);

  if (!canViewResults) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-4xl mb-3">🔒</p>
        <p className="font-semibold text-gray-700">Results are not available yet.</p>
        <p className="text-sm text-gray-400 mt-1">Check back when results are published.</p>
      </div>
    );
  }

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-4xl mb-3">🏅</p>
        <p className="font-semibold text-gray-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-[#7F622C] mb-1">🏅 Results</h2>
      <p className="text-gray-500 text-sm mb-6">{cycle?.title}</p>

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
                {cat.nominees.map((n, i) => (
                  <div
                    key={n.nominee_id}
                    className={`rounded-xl p-4 border ${
                      n.is_winner
                        ? 'bg-[#CBD300]/10 border-[#CBD300]'
                        : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold text-gray-800 text-sm">
                          {i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : i === 2 ? '🥉 ' : ''}{n.nominee_name}
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