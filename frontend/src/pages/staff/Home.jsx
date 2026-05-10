
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { useCycle } from '../../hooks/useCycle';
import { PageSkeleton } from '../../components/Skeleton';
import Card from '../../components/Card';
import Badge from '../../components/Badge';

const PHASE_INFO = {
  nominating: { badge: 'blue',    label: 'Nominations Open',  tip: 'Submit your nominations before this phase closes.'  },
  voting:     { badge: 'lime',    label: 'Voting Open',       tip: 'Cast your votes — one vote per category.'           },
  results:    { badge: 'green',   label: 'Results Published', tip: 'Winners have been announced. View the results tab.' },
  closed:     { badge: 'default', label: 'No Active Cycle',   tip: 'There is no active awards cycle at the moment.'     },
};

const PHASE_STEPS = ['closed', 'nominating', 'voting', 'results'];

const ACTION_CARDS = [
  { to: '/staff/nominate', icon: '✍️', label: 'Nominate', desc: 'Nominate yourself or a colleague', phase: 'nominating' },
  { to: '/staff/vote',     icon: '🗳️', label: 'Vote',      desc: 'Cast your vote for each category', phase: 'voting'    },
  { to: '/staff/results',  icon: '🏅', label: 'Results',  desc: 'See who took home the awards',      phase: 'results'   },
];

export default function StaffHome() {
  const { user }           = useAuth();
  const { cycle, loading } = useCycle();

  if (loading) return <PageSkeleton />;

  const phase   = cycle?.phase || 'closed';
  const info    = PHASE_INFO[phase];
  const stepIdx = PHASE_STEPS.indexOf(phase);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#7F622C]">
          Welcome, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-gray-500 text-sm mt-0.5">{user?.email}</p>
      </div>

      {/* Cycle status */}
      <Card className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Active Cycle</p>
            <h3 className="text-xl font-bold text-gray-800">
              {cycle?.title || 'No active cycle'}
            </h3>
            {cycle?.description && (
              <p className="text-gray-500 text-sm mt-1">{cycle.description}</p>
            )}
          </div>
          <Badge variant={info.badge}>{info.label}</Badge>
        </div>

        {cycle && (
          <div className="mb-4">
            <div className="flex items-center">
              {PHASE_STEPS.map((s, i) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                    i < stepIdx  ? 'bg-[#7F622C] border-[#7F622C] text-white' :
                    i === stepIdx ? 'bg-[#CBD300] border-[#CBD300]'            :
                                    'bg-white border-gray-300'
                  }`}>
                    {i < stepIdx && <span className="text-[9px] leading-none">✓</span>}
                  </div>
                  {i < PHASE_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${i < stepIdx ? 'bg-[#7F622C]' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1.5">
              {PHASE_STEPS.map((s, i) => (
                <span key={s} className={`text-xs capitalize ${i === stepIdx ? 'text-[#7F622C] font-semibold' : 'text-gray-400'}`}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-2.5">{info.tip}</p>
      </Card>

      {/* Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {ACTION_CARDS.map(c => {
          const active = phase === c.phase;
          return (
            <Link
              key={c.to}
              to={c.to}
              className={`rounded-xl border p-5 transition-all ${
                active
                  ? 'bg-[#7F622C] border-[#7F622C] shadow-md'
                  : 'bg-white border-gray-100 hover:border-[#CBD300] shadow-sm'
              }`}
            >
              <p className="text-2xl mb-2">{c.icon}</p>
              <p className={`font-bold text-base ${active ? 'text-white' : 'text-gray-800'}`}>{c.label}</p>
              <p className={`text-xs mt-1 ${active ? 'text-[#CBD300]' : 'text-gray-400'}`}>{c.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* Categories */}
      {cycle?.categories?.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
            Award Categories
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {cycle.categories.map(cat => (
              <Card key={cat.id}>
                <p className="font-semibold text-[#7F622C]">{cat.name}</p>
                {cat.description && <p className="text-xs text-gray-500 mt-1">{cat.description}</p>}
                {cat.criteria && (
                  <div className="mt-2 bg-[#CBD300]/10 border border-[#CBD300]/30 rounded px-3 py-1.5">
                    <p className="text-xs text-[#5c4620]"><strong>Criteria:</strong> {cat.criteria}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}