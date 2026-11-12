import { useEffect, useState } from 'react';
import { useToast } from '../../components/Toast';
import { errorMessage, formatDate, plural } from '../../lib/format';
import { exportResults } from '../../lib/exportResults';
import { PageSkeleton, SkeletonLine } from '../../components/Skeleton';
import api from '../../api/axios';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import ResultsBoard from '../../components/ResultsBoard';
import { Select } from '../../components/Input';

export default function AdminResults() {
  const { toast } = useToast();
  const [cycles, setCycles] = useState([]);
  const [selected, setSelected] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    api.get('/cycles')
      .then(({ data }) => {
        const published = data.filter(c => c.phase === 'results');
        setCycles(published);
        if (published.length) setSelected(String(published[0].id));
      })
      .catch(err => toast.error(errorMessage(err, 'Cycles could not be loaded.')))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    if (!selected) return;
    setFetching(true);
    api.get(`/cycles/${selected}/results`)
      .then(({ data }) => setResults(data))
      .catch(err => {
        setResults([]);
        toast.error(errorMessage(err, 'Results could not be loaded.'));
      })
      .finally(() => setFetching(false));
  }, [selected, toast]);

  if (loading) return <PageSkeleton />;

  const cycle = cycles.find(c => String(c.id) === selected);
  const totalVotes = results.reduce((sum, r) => sum + r.total_votes, 0);

  async function download() {
    try {
      await exportResults(cycle, results);
    } catch {
      toast.error('The spreadsheet could not be created. Try again.');
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Results"
        description="Winners and full vote counts for every published cycle."
        actions={cycle && results.length > 0 && <Button variant="secondary" icon="download" onClick={download}>Download spreadsheet</Button>}
      />

      {!cycles.length ? (
        <EmptyState icon="trophy" title="No results published yet">
          Results appear here once a cycle has been moved past voting.
        </EmptyState>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            {cycles.length > 1 ? (
              <Select label="Cycle" value={selected} onChange={e => setSelected(e.target.value)} className="sm:w-80">
                {cycles.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </Select>
            ) : (
              <h2 className="text-xl">{cycle?.title}</h2>
            )}
            <p className="text-sm text-muted">
              {plural(totalVotes, 'vote')} counted{cycle?.results_at && `, published ${formatDate(cycle.results_at)}`}
            </p>
          </div>

          {fetching ? <SkeletonLine className="h-64 w-full rounded-xl" /> : <ResultsBoard results={results} />}
        </>
      )}
    </div>
  );
}
