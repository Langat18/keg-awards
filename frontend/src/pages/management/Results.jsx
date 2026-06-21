import { useEffect, useState } from 'react';
import { PageSkeleton } from '../../components/Skeleton';
import api from '../../api/axios';
import * as XLSX from 'xlsx';

export default function AdminResults() {
  const [cycles, setCycles]     = useState([]);
  const [selected, setSelected] = useState(null);
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

  function exportToExcel() {
    if (!cycle || results.length === 0) return;

    const wb = XLSX.utils.book_new();

    const summaryRows = results.map(cat => ({
      'Category':       cat.category_name,
      'Winner':         cat.nominees?.[0]?.nominee_name  || '—',
      'Department':     cat.nominees?.[0]?.department    || '—',
      'Winning Votes':  cat.nominees?.[0]?.vote_count    ?? 0,
      'Winning %':      cat.nominees?.[0]?.percentage    ?? 0,
      'Total Votes':    cat.total_votes,
    }));
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    wsSummary['!cols'] = [
      { wch: 32 }, { wch: 24 }, { wch: 20 }, { wch: 14 }, { wch: 12 }, { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    const detailRows = [];
    results.forEach(cat => {
      cat.nominees?.forEach((n, i) => {
        detailRows.push({
          'Category':   cat.category_name,
          'Rank':       i + 1,
          'Nominee':    n.nominee_name,
          'Department': n.department || '—',
          'Votes':      n.vote_count,
          '%':          n.percentage,
          'Winner':     n.is_winner ? 'Yes' : 'No',
        });
      });

      detailRows.push({});
    });
    const wsDetail = XLSX.utils.json_to_sheet(detailRows);
    wsDetail['!cols'] = [
      { wch: 32 }, { wch: 6 }, { wch: 24 }, { wch: 20 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
    ];
    XLSX.utils.book_append_sheet(wb, wsDetail, 'Full Breakdown');

    const safeName = cycle.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    XLSX.writeFile(wb, `${safeName}_results.xlsx`);
  }

  if (loading) return <PageSkeleton />;

  const cycle      = cycles.find(c => c.id === selected);
  const totalVotes = results.reduce((sum, cat) => sum + (cat.total_votes || 0), 0);

  return (
    <div className="max-w-5xl mx-auto">

    
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#7F622C] uppercase tracking-widest mb-1">Administration</p>
          <h2 className="text-2xl font-bold text-gray-900">Results</h2>
          <p className="text-gray-400 text-sm mt-1">View vote counts and winners for completed cycles.</p>
        </div>
        <div className="flex items-end gap-4 shrink-0">
          {cycle && results.length > 0 && (
            <button
              onClick={exportToExcel}
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
              </svg>
              Export Excel
            </button>
          )}
          {cycle && (
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{totalVotes}</p>
              <p className="text-xs text-gray-400">total votes cast</p>
            </div>
          )}
        </div>
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
                          key={n.nominee_id}
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
                            :           'bg-gray-100 text-gray-400'
                          }`}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">{n.nominee_name}</p>
                            {n.department && (
                              <p className="text-xs text-gray-400 mt-0.5">{n.department}</p>
                            )}
                          </div>

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