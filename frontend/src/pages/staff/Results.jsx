import { useEffect, useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../../components/Toast';
import { exportResults } from '../../lib/exportResults';
import { PageSkeleton } from '../../components/Skeleton';
import api from '../../api/axios';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import ResultsBoard from '../../components/ResultsBoard';

export default function Results() {
  const { canViewResults } = useAuth();
  const { toast } = useToast();
  const [cycle, setCycle] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(canViewResults);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!canViewResults) return;

    api.get('/cycles/active-with-results')
      .then(({ data }) => {
        setCycle(data);
        return api.get(`/cycles/${data.id}/results`);
      })
      .then(({ data }) => setResults(data))
      .catch(err => {
        if (err.response?.status === 404) setError('none');
        else if (err.response?.status === 403) setError('denied');
        else setError('failed');
      })
      .finally(() => setLoading(false));
  }, [canViewResults]);

  if (!canViewResults || error === 'denied') {
    return (
      <>
        <PageHeader title="Results" />
        <EmptyState icon="lock" title="Results are shared by the administration">
          Winners are announced by the administration. If you need access to the full results, contact the ICT office.
        </EmptyState>
      </>
    );
  }

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <>
        <PageHeader title="Results" />
        <EmptyState icon="trophy" title={error === 'none' ? 'No results have been published yet' : 'The results could not be loaded'}>
          {error === 'none' ? 'Results appear here once voting closes and the administration publishes them.' : 'Refresh the page to try again.'}
        </EmptyState>
      </>
    );
  }

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
        description={cycle.title}
        actions={results.length > 0 && <Button variant="secondary" icon="download" onClick={download}>Download spreadsheet</Button>}
      />
      <ResultsBoard results={results} />
    </div>
  );
}
