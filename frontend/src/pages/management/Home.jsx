import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/Dialog';
import { errorMessage, plural } from '../../lib/format';
import { PHASE_LABEL, PHASE_TONE } from '../../lib/phases';
import { PageSkeleton } from '../../components/Skeleton';
import { ADVANCE } from './phaseActions';
import api from '../../api/axios';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import Icon from '../../components/Icon';
import PageHeader from '../../components/PageHeader';
import PhaseTrack from '../../components/PhaseTrack';

function pickCurrent(cycles) {
  return cycles.find(c => c.phase === 'nominating' || c.phase === 'voting')
    || cycles.find(c => c.phase === 'closed')
    || cycles[0]
    || null;
}

export default function ManagementHome() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [cycles, setCycles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    return Promise.all([api.get('/cycles'), api.get('/admin/users')])
      .then(([c, u]) => {
        setCycles(c.data);
        setUsers(u.data);
      })
      .catch(err => toast.error(errorMessage(err, 'The overview could not be loaded.')))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageSkeleton />;

  const cycle = pickCurrent(cycles);
  const action = cycle && ADVANCE[cycle.phase];
  const staff = users.filter(u => u.role === 'staff');

  async function advance() {
    const ok = await confirm({ title: action.title, message: action.message, confirmLabel: action.label });
    if (!ok) return;

    setBusy(true);
    try {
      await api.post(`/cycles/${cycle.id}/phase`);
      toast.success(action.done);
      await load();
    } catch (err) {
      toast.error(errorMessage(err, 'The cycle could not be moved on.'));
    } finally {
      setBusy(false);
    }
  }

  const stats = [
    { label: 'Nominations', icon: 'pen', value: cycle?.nominations_count ?? 0, to: '/management/nominations' },
    { label: 'Votes cast', icon: 'ballot', value: cycle?.votes_count ?? 0, to: cycle?.phase === 'results' ? '/management/results' : null },
    { label: 'Active staff', icon: 'users', value: staff.filter(u => u.is_active).length, to: '/management/users' },
    { label: 'Categories', icon: 'layers', value: cycle?.categories?.length ?? 0, to: '/management/cycles' },
  ];

  return (
    <div>
      <PageHeader title="Overview" description="The current awards cycle at a glance." />

      {!cycle ? (
        <EmptyState icon="layers" title="No awards cycles yet" action={<Button to="/management/cycles" icon="plus">Create a cycle</Button>}>
          Create a cycle, add its award categories, then open nominations to staff.
        </EmptyState>
      ) : (
        <>
          <Card className="sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <Badge tone={PHASE_TONE[cycle.phase]} dot>{PHASE_LABEL[cycle.phase]}</Badge>
                <h2 className="mt-3 text-2xl">{cycle.title}</h2>
                {cycle.description && <p className="mt-1 max-w-2xl text-muted">{cycle.description}</p>}
              </div>
              {action ? (
                <Button size="lg" variant={cycle.phase === 'voting' ? 'lime' : 'primary'} icon={action.icon} loading={busy} onClick={advance} disabled={!cycle.categories?.length}>
                  {action.label}
                </Button>
              ) : (
                <Button to="/management/results" size="lg" variant="secondary" icon="trophy">View results</Button>
              )}
            </div>

            <div className="mt-8">
              <PhaseTrack cycle={cycle} />
            </div>

            {cycle.phase === 'closed' && !cycle.categories?.length && (
              <p className="mt-6 flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <Icon name="alert" className="h-4 w-4" />
                Add at least one category on the <Link to="/management/cycles" className="font-semibold underline">Cycles page</Link> before opening nominations.
              </p>
            )}
          </Card>

          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
            {stats.map(stat => {
              const body = (
                <>
                  <dt className="flex items-center gap-2 text-sm text-muted">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-tint text-brand">
                      <Icon name={stat.icon} className="h-4 w-4" />
                    </span>
                    {stat.label}
                  </dt>
                  <dd className="tabular mt-3 font-serif text-4xl font-bold text-brand">{stat.value}</dd>
                </>
              );
              return stat.to ? (
                <Link key={stat.label} to={stat.to} className="bg-white p-5 hover:bg-brand-tint">{body}</Link>
              ) : (
                <div key={stat.label} className="bg-white p-5">{body}</div>
              );
            })}
          </dl>

          {cycles.length > 1 && (
            <section className="mt-10">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg">Other cycles</h2>
                <Link to="/management/cycles" className="text-sm font-semibold text-brand hover:underline">Manage cycles</Link>
              </div>
              <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-white">
                {cycles.filter(c => c.id !== cycle.id).slice(0, 5).map(c => (
                  <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{c.title}</p>
                      <p className="text-sm text-muted">{plural(c.nominations_count, 'nomination')}, {plural(c.votes_count, 'vote')}</p>
                    </div>
                    <Badge tone={PHASE_TONE[c.phase]}>{PHASE_LABEL[c.phase]}</Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
