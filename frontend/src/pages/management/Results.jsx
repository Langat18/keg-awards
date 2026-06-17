import { useEffect, useState } from 'react';
import { PageSkeleton } from '../../components/Skeleton';
import Card from '../../components/Card';
import api from '../../api/axios';

export default function AdminResults() {
  const [cycles, setCycles]     = useState([]);   // all results-phase cycles
  const [selected, setSelected] = useState(null); // active cycle id
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    api.get('/cycles')
      .then(r => {
        const done = r.data.filter(c => c.phase === 'results');
        setCycles(done);
        if (done.length > 0) setSelected(done[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setFetching(true);
    api.get(`/cycles/${selected}/results`)
      .then(r => setResults(r.data))
      .catch(() => setResults([]))
      .finally(() => setFetching(false));
  }, [selected]);

  if (loading) return <PageSkeleton />;

  const cycle = cycles.find(c => c.id === selected);
  const totalVotes = results.reduce((sum, cat) => sum + (cat.total_votes || 0), 0);

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#7F622C] uppercase tracking-widest mb-1">Administration</p>
          <h2 className="text-2xl font-bold text-gray-900">Results</h2>
          <p className="text-gray-400 text-sm mt-1">View vote counts and winners for completed cycles.</p>
        </div>
        {cycle && (
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-gray-900">{totalVotes}</p>
            <p className="text-xs text-gray-400">total votes cast</p>
          </div>
        )}
      </div>

      {cycles.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <p className="text-3xl mb-3">🏆</p>
          <p className="text-sm font-semibold text-gray-400">No results published yet</p>
          <p className="text-xs text-gray-300 mt-1">Results appear here once a cycle reaches the Results phase.</p>
        </div>
      )}

      {cycles.length > 0 && (
        <>
          {cycles.length > 1 && (
            <div className="flex gap-2 mb-6 flex-wrap">
              {cycles.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-colors ${
                    selected === c.id
                      ? 'bg-[#7F622C] text-white border-[#7F622C]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#7F622C] hover:text-[#7F622C]'
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          )}

          {cycle && (
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-base font-bold text-gray-800">{cycle.title}</h3>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Results Published
              </span>
            </div>
          )}

          {/* Results */}
          {fetching ? (
            <PageSkeleton />
          ) : results.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-14 text-center">
              <p className="text-sm text-gray-300">No votes were cast in this cycle.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {results.map(cat => {
                const winner = cat.nominees?.[0];
                return (
                  <div key={cat.category_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                    <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between gap-4">
                      <h4 className="font-bold text-gray-900">{cat.category_name}</h4>
                      <div className="flex items-center gap-3 shrink-0">
                        {winner && (
                          <span className="text-xs font-semibold text-[#7F622C]">
                            🥇 {winner.nominee_name}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
                          {cat.total_votes} vote{cat.total_votes !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>



                    <div className="px-6 py-4 space-y-3">
                      {cat.nominees?.map((n, i) => (
                        <div
                          key={n.nomination_id}
                          className={`flex items-center gap-4 rounded-xl p-4 border transition-colors ${
                            n.is_winner
                              ? 'bg-[#CBD300]/10 border-[#CBD300]/40'
                              : 'bg-gray-50/60 border-gray-100'
                          }`}
                        >
         
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            i === 0 ? 'bg-[#CBD300] text-[#3d2e00]'
                            : i === 1 ? 'bg-gray-200 text-gray-600'
                            : i === 2 ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-400'
                          }`}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                          </div>

                          {/* Name & dept */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">{n.nominee_name}</p>
                            {n.department && (
                              <p className="text-xs text-gray-400 mt-0.5">{n.department}</p>
                            )}
                          </div>

                          {/* Bar + count */}
                          <div className="flex items-center gap-3 shrink-0 w-48">
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all ${n.is_winner ? 'bg-[#7F622C]' : 'bg-gray-300'}`}
                                style={{ width: `${n.percentage}%` }}
                              />
                            </div>
                            <div className="text-right w-16">
                              <p className="text-xs font-bold text-gray-700">{n.vote_count}</p>
                              <p className="text-[10px] text-gray-400">{n.percentage}%</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}