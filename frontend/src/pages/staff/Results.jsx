import { useEffect, useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { PageSkeleton } from '../../components/Skeleton';
import Card from '../../components/Card';
import api from '../../api/axios';
import * as XLSX from 'xlsx';

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

  function exportToExcel() {
    if (!cycle || results.length === 0) return;

    const wb = XLSX.utils.book_new();

    const summaryRows = results.map(cat => ({
      'Category':      cat.category_name,
      'Winner':        cat.nominees?.[0]?.nominee_name || '—',
      'Department':    cat.nominees?.[0]?.department   || '—',
      'Winning Votes': cat.nominees?.[0]?.vote_count    ?? 0,
      'Winning %':     cat.nominees?.[0]?.percentage    ?? 0,
      'Total Votes':   cat.total_votes,
    }));
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    wsSummary['!cols'] = [{ wch: 32 }, { wch: 24 }, { wch: 20 }, { wch: 14 }, { wch: 12 }, { wch: 12 }];
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
    wsDetail['!cols'] = [{ wch: 32 }, { wch: 6 }, { wch: 24 }, { wch: 20 }, { wch: 8 }, { wch: 8 }, { wch: 8 }];
    XLSX.utils.book_append_sheet(wb, wsDetail, 'Full Breakdown');

    const safeName = cycle.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    XLSX.writeFile(wb, `${safeName}_results.xlsx`);
  }

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
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#7F622C] mb-1">🏅 Results</h2>
          <p className="text-gray-500 text-sm">{cycle?.title}</p>
        </div>
        {results.length > 0 && (
          <button
            onClick={exportToExcel}
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
            </svg>
            Export Excel
          </button>
        )}
      </div>

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