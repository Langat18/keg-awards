import { useEffect, useMemo, useState } from 'react';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/Dialog';
import { useNominations } from '../../hooks/useNominations';
import { errorMessage, plural } from '../../lib/format';
import { PHASE_LABEL } from '../../lib/phases';
import { PageSkeleton, SkeletonLine } from '../../components/Skeleton';
import api from '../../api/axios';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import Icon from '../../components/Icon';
import PageHeader from '../../components/PageHeader';
import { Select } from '../../components/Input';

export default function ManageNominations() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [cycles, setCycles] = useState([]);
  const [cycleId, setCycleId] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const { nominations, loading: nomsLoading, refetch } = useNominations(cycleId || null);

  useEffect(() => {
    api.get('/cycles')
      .then(({ data }) => {
        setCycles(data);
        const current = data.find(c => c.phase === 'nominating' || c.phase === 'voting') || data[0];
        if (current) setCycleId(String(current.id));
      })
      .catch(err => toast.error(errorMessage(err, 'Cycles could not be loaded.')))
      .finally(() => setLoading(false));
  }, [toast]);

  const cycle = cycles.find(c => String(c.id) === cycleId);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = n =>
      !q ||
      n.nominee?.name.toLowerCase().includes(q) ||
      (n.nominee?.department || '').toLowerCase().includes(q) ||
      (n.nominator?.name || '').toLowerCase().includes(q);

    return (cycle?.categories || []).map(category => ({
      ...category,
      items: nominations.filter(n => n.category_id === category.id && matches(n)),
    }));
  }, [cycle, nominations, query]);

  if (loading) return <PageSkeleton />;

  if (!cycles.length) {
    return (
      <>
        <PageHeader title="Nominations" />
        <EmptyState icon="list" title="No cycles yet" action={<Button to="/management/cycles">Go to cycles</Button>}>
          Nominations appear here once a cycle is open.
        </EmptyState>
      </>
    );
  }

  async function remove(nomination) {
    const ok = await confirm({
      title: `Remove ${nomination.nominee?.name}?`,
      message:
        cycle.phase === 'voting'
          ? `This removes their nomination for ${nomination.category?.name} and deletes any votes already cast for them.`
          : `This removes their nomination for ${nomination.category?.name}.`,
      confirmLabel: 'Remove nomination',
      danger: true,
    });
    if (!ok) return;

    try {
      await api.delete(`/nominations/${nomination.id}`);
      toast.success('Nomination removed.');
      refetch();
    } catch (err) {
      toast.error(errorMessage(err, 'The nomination could not be removed.'));
    }
  }

  return (
    <div>
      <PageHeader title="Nominations" description="Review who has been nominated, why and by whom." />

      <div className="mb-6 grid gap-3 sm:grid-cols-[minmax(0,320px)_1fr] sm:items-end">
        <Select label="Cycle" value={cycleId} onChange={e => setCycleId(e.target.value)}>
          {cycles.map(c => (
            <option key={c.id} value={c.id}>{c.title} ({PHASE_LABEL[c.phase].toLowerCase()})</option>
          ))}
        </Select>
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search nominee, department or nominator"
            className="field pl-9"
            aria-label="Search nominations"
          />
        </div>
      </div>

      <p className="mb-4 text-sm text-muted">{plural(nominations.length, 'nomination')} in this cycle</p>

      {nomsLoading ? (
        <SkeletonLine className="h-48 w-full rounded-xl" />
      ) : grouped.length === 0 ? (
        <EmptyState icon="layers" title="This cycle has no categories" compact />
      ) : (
        <div className="space-y-5">
          {grouped.map(category => (
            <Card key={category.id} padded={false}>
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
                <h2 className="text-base">{category.name}</h2>
                <span className="tabular text-sm text-muted">{plural(category.items.length, 'nominee')}</span>
              </div>

              {category.items.length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted sm:px-6">{query ? 'No matches.' : 'No nominations yet.'}</p>
              ) : (
                <ul className="divide-y divide-line">
                  {category.items.map(n => (
                    <li key={n.id} className="flex items-start gap-3 px-5 py-4 sm:px-6">
                      <Avatar name={n.nominee?.name} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{n.nominee?.name}</p>
                        <p className="text-sm text-muted">
                          {[n.nominee?.department, n.nominator && (n.nominator.id === n.nominee_id ? 'Self-nominated' : `Nominated by ${n.nominator.name}`)]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                        {n.reason && <p className="mt-2 max-w-2xl whitespace-pre-line border-l-2 border-lime pl-3 text-sm">{n.reason}</p>}
                      </div>
                      {cycle.phase !== 'results' && (
                        <Button size="sm" variant="danger-outline" onClick={() => remove(n)}>Remove</Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
