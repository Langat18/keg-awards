import Avatar from './Avatar';
import Card from './Card';
import { Rosette } from './Icon';
import { plural } from '../lib/format';

export default function ResultsBoard({ results }) {
  return (
    <div className="space-y-5">
      {results.map(category => (
        <CategoryResult key={category.category_id} category={category} />
      ))}
    </div>
  );
}

function CategoryResult({ category }) {
  const winners = category.nominees.filter(n => n.is_winner);
  const others = category.nominees.filter(n => !n.is_winner);

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pt-5 sm:px-6">
        <h2 className="text-lg">{category.category_name}</h2>
        <span className="tabular text-sm text-muted">{plural(category.total_votes, 'vote')}</span>
      </div>

      {category.nominees.length === 0 ? (
        <p className="px-5 pb-5 pt-2 text-sm text-muted sm:px-6">No votes were cast in this category.</p>
      ) : (
        <>
          <div className="mt-4 border-y border-lime-dark/30 bg-lime-tint px-5 py-4 sm:px-6">
            <p className="mb-3 text-sm font-semibold text-brand-dark">
              {category.is_tie ? `Joint winners, tied on ${plural(winners[0].vote_count, 'vote')}` : 'Winner'}
            </p>
            <ul className="space-y-3">
              {winners.map(n => (
                <li key={n.nominee_id} className="flex items-center gap-3">
                  <Rosette className="h-9 w-9" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-bold">{n.nominee_name}</p>
                    {n.department && <p className="truncate text-sm text-muted">{n.department}</p>}
                  </div>
                  <div className="text-right">
                    <p className="tabular text-xl font-extrabold leading-none text-brand-ink">{n.vote_count}</p>
                    <p className="tabular text-xs text-muted">{n.percentage}%</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {others.length > 0 && (
            <ol className="divide-y divide-line/70 px-5 sm:px-6">
              {others.map(n => (
                <li key={n.nominee_id} className="flex items-center gap-3 py-3">
                  <Avatar name={n.nominee_name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{n.nominee_name}</p>
                    <div className="mt-1.5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-canvas">
                      <div className="h-full rounded-full bg-brand/40" style={{ width: `${n.percentage}%` }} />
                    </div>
                  </div>
                  <p className="tabular w-20 text-right text-sm">
                    <span className="font-semibold">{n.vote_count}</span>
                    <span className="ml-1.5 text-muted">{n.percentage}%</span>
                  </p>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </Card>
  );
}
