import { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { useCycle } from '../../hooks/useCycle';
import { useNominations } from '../../hooks/useNominations';
import { useVotes } from '../../hooks/useVotes';
import { useToast } from '../../components/Toast';
import { criteriaList, errorMessage, plural } from '../../lib/format';
import { PageSkeleton } from '../../components/Skeleton';
import api from '../../api/axios';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import Icon from '../../components/Icon';
import PageHeader from '../../components/PageHeader';

function CategoryBallot({ category, nominees, vote, onVote, busy, userId }) {
  const [query, setQuery] = useState('');
  const [showCriteria, setShowCriteria] = useState(false);
  const points = criteriaList(category.criteria);

  const q = query.trim().toLowerCase();
  const visible = q
    ? nominees.filter(n => n.nominee?.name.toLowerCase().includes(q) || (n.nominee?.department || '').toLowerCase().includes(q))
    : nominees;

  return (
    <Card id={`category-${category.id}`} className="scroll-mt-24">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg">{category.name}</h2>
          <p className="text-sm text-muted">{plural(nominees.length, 'nominee')}</p>
        </div>
        {vote ? <Badge tone="good" dot>Voted</Badge> : <Badge>Not voted yet</Badge>}
      </div>

      {points.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowCriteria(s => !s)}
            aria-expanded={showCriteria}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            {showCriteria ? 'Hide' : 'Show'} judging criteria
            <Icon name="chevronDown" className={`h-4 w-4 transition-transform ${showCriteria ? 'rotate-180' : ''}`} />
          </button>
          {showCriteria && (
            <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-muted">
              {points.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          )}
        </div>
      )}

      {nominees.length === 0 ? (
        <p className="mt-4 rounded-lg bg-canvas px-4 py-3 text-sm text-muted">Nobody was nominated in this category.</p>
      ) : (
        <>
          {nominees.length > 6 && (
            <div className="relative mt-4">
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={`Search ${nominees.length} nominees`}
                className="field pl-9"
                aria-label={`Search nominees in ${category.name}`}
              />
            </div>
          )}

          <div role="radiogroup" aria-label={category.name} className="mt-4 grid gap-2 sm:grid-cols-2">
            {visible.map(n => {
              const chosen = vote?.nomination_id === n.id;
              return (
                <button
                  key={n.id}
                  type="button"
                  role="radio"
                  aria-checked={chosen}
                  disabled={busy}
                  onClick={() => !chosen && onVote(category.id, n.id)}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors disabled:cursor-wait ${
                    chosen ? 'border-brand bg-brand text-white' : 'border-line bg-white hover:border-brand/50 hover:bg-brand-tint'
                  }`}
                >
                  <Avatar name={n.nominee?.name} size="md" inverted={chosen} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {n.nominee?.name}
                      {n.nominee_id === userId && <span className={`ml-1.5 font-normal ${chosen ? 'text-white/70' : 'text-muted'}`}>(you)</span>}
                    </span>
                    {n.nominee?.department && (
                      <span className={`block truncate text-sm ${chosen ? 'text-white/70' : 'text-muted'}`}>{n.nominee.department}</span>
                    )}
                  </span>
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      chosen ? 'border-lime bg-lime text-brand-ink' : 'border-line'
                    }`}
                  >
                    {chosen && <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>

          {q && visible.length === 0 && <p className="mt-3 text-sm text-muted">No nominee matches “{query}”.</p>}
        </>
      )}
    </Card>
  );
}

export default function Vote() {
  const { user } = useAuth();
  const { cycle, loading } = useCycle();
  const isVoting = cycle?.phase === 'voting';
  const { nominations, loading: nomsLoading } = useNominations(isVoting ? cycle.id : null);
  const { myVotes, recordVote } = useVotes(isVoting ? cycle.id : null);
  const { toast } = useToast();
  const [busy, setBusy] = useState(null);

  if (loading || (isVoting && nomsLoading)) return <PageSkeleton />;

  if (!isVoting) {
    return (
      <>
        <PageHeader title="Vote" />
        <EmptyState icon="ballot" title="Voting is not open" action={<Button to="/staff" variant="secondary">Back to home</Button>}>
          {cycle?.phase === 'nominating'
            ? 'Nominations are still being collected. Voting opens once they close.'
            : cycle?.phase === 'results'
              ? 'Voting has closed and the results are published.'
              : 'You will be able to vote here when the next cycle reaches the voting stage.'}
        </EmptyState>
      </>
    );
  }

  async function castVote(categoryId, nominationId) {
    setBusy(categoryId);
    try {
      await api.post(`/cycles/${cycle.id}/votes`, { category_id: categoryId, nomination_id: nominationId });
      recordVote(categoryId, nominationId);
      const nominee = nominations.find(n => n.id === nominationId)?.nominee?.name;
      toast.success(`Vote saved for ${nominee}.`);
    } catch (err) {
      toast.error(errorMessage(err, 'Your vote was not saved. Try again.'));
    } finally {
      setBusy(null);
    }
  }

  const categories = cycle.categories || [];
  const voted = categories.filter(c => myVotes.some(v => v.category_id === c.id)).length;
  const percent = categories.length ? Math.round((voted / categories.length) * 100) : 0;

  return (
    <div>
      <PageHeader title="Vote" description={`${cycle.title}. Pick one nominee in each category. You can change your choice until voting closes.`} />

      <div className="sticky top-[67px] z-20 -mx-4 mb-6 border-b border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:bg-white sm:px-5">
        <div className="flex items-center justify-between gap-4 text-sm">
          <p className="font-semibold">
            {voted === categories.length ? 'All votes cast' : `${voted} of ${plural(categories.length, 'category', 'categories')} voted`}
          </p>
          <p className="tabular text-muted">{percent}%</p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-lime transition-[width] duration-500" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="space-y-5">
        {categories.map(category => (
          <CategoryBallot
            key={category.id}
            category={category}
            nominees={nominations.filter(n => n.category_id === category.id)}
            vote={myVotes.find(v => v.category_id === category.id)}
            onVote={castVote}
            busy={busy === category.id}
            userId={user.id}
          />
        ))}
      </div>
    </div>
  );
}
