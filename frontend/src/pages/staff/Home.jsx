import { useAuth } from '../../store/AuthContext';
import { useCycle } from '../../hooks/useCycle';
import { useVotes } from '../../hooks/useVotes';
import { useNominations } from '../../hooks/useNominations';
import { criteriaList, firstName, plural } from '../../lib/format';
import { PHASE_LABEL, PHASE_TONE } from '../../lib/phases';
import { PageSkeleton } from '../../components/Skeleton';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import PhaseTrack from '../../components/PhaseTrack';

function NextStep({ cycle, canViewResults }) {
  const { user } = useAuth();
  const live = cycle.phase === 'nominating' || cycle.phase === 'voting';
  const { myVotes } = useVotes(cycle.phase === 'voting' ? cycle.id : null);
  const { nominations } = useNominations(cycle.phase === 'nominating' ? cycle.id : null);

  const total = cycle.categories?.length || 0;

  if (cycle.phase === 'nominating') {
    const mine = nominations.filter(n => n.nominated_by === user.id).length;
    return (
      <Action
        title="Nominations are open"
        text={mine ? `You have made ${plural(mine, 'nomination')} so far. You can nominate in every category.` : `Put forward the colleagues who deserve recognition in ${plural(total, 'category', 'categories')}.`}
        cta={<Button to="/staff/nominate" size="lg" variant="lime" icon="pen">Make a nomination</Button>}
      />
    );
  }

  if (cycle.phase === 'voting') {
    const done = myVotes.length;
    return (
      <Action
        title={done >= total && total > 0 ? 'You have voted in every category' : 'Voting is open'}
        text={`You have voted in ${done} of ${plural(total, 'category', 'categories')}. You can change a vote until voting closes.`}
        cta={<Button to="/staff/vote" size="lg" variant={done >= total ? 'secondary' : 'lime'} icon="ballot">{done ? 'Review my votes' : 'Start voting'}</Button>}
      />
    );
  }

  if (cycle.phase === 'results') {
    return (
      <Action
        title="Results are published"
        text={canViewResults ? 'See the winners and the full vote count for each category.' : 'Winners will be announced by the administration. Thank you for taking part.'}
        cta={canViewResults && <Button to="/staff/results" size="lg" icon="trophy">See the results</Button>}
      />
    );
  }

  return live ? null : (
    <Action title="Getting ready" text="The categories are being prepared. Nominations will open soon." />
  );
}

function Action({ title, text, cta }) {
  return (
    <div className="flex flex-col gap-4 border-t border-white/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-lg font-bold text-white">{title}</p>
        <p className="mt-1 max-w-lg text-white/70">{text}</p>
      </div>
      {cta}
    </div>
  );
}

export default function StaffHome() {
  const { user, canViewResults } = useAuth();
  const { cycle, loading, error } = useCycle();

  if (loading) return <PageSkeleton />;

  return (
    <div>
      <h1 className="text-2xl sm:text-[28px]">Hello, {firstName(user?.name)}</h1>
      <p className="mt-1 text-muted">Here is where this cycle stands.</p>

      {!cycle ? (
        <div className="mt-8">
          <EmptyState icon="trophy" title={error ? 'The awards cycle could not be loaded' : 'No awards cycle is running'}>
            {error ? 'Refresh the page to try again.' : 'When the administration opens a new cycle you will be able to nominate colleagues here.'}
          </EmptyState>
        </div>
      ) : (
        <>
          <section className="mt-8 overflow-hidden rounded-xl bg-brand-ink p-6 text-white sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-white sm:text-3xl">{cycle.title}</h2>
                {cycle.description && <p className="mt-2 max-w-2xl text-white/70">{cycle.description}</p>}
              </div>
              <Badge tone={PHASE_TONE[cycle.phase]} dot>{PHASE_LABEL[cycle.phase]}</Badge>
            </div>

            <div className="my-8">
              <PhaseTrack cycle={cycle} theme="dark" />
            </div>

            <NextStep cycle={cycle} canViewResults={canViewResults} />
          </section>

          {cycle.categories?.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl">Award categories</h2>
              <p className="mt-1 text-muted">What each award recognises and how nominees are judged.</p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {cycle.categories.map(category => {
                  const points = criteriaList(category.criteria);
                  return (
                    <Card key={category.id}>
                      <h3 className="text-base">{category.name}</h3>
                      {category.description && <p className="mt-1.5 text-sm text-muted">{category.description}</p>}
                      {points.length > 0 && (
                        <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
                          {points.map((point, i) => (
                            <li key={i} className="flex gap-2.5">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-dark" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
