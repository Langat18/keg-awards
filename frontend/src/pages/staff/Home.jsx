import { Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { useCycle } from '../../hooks/useCycle';
import { PageSkeleton } from '../../components/Skeleton';
import Card from '../../components/Card';
import Badge from '../../components/Badge';

const PHASE_INFO = {
  nominating: { badge: 'blue',    label: 'Nominations Open', tip: 'Submit your nominations before this phase closes.' },
  voting:     { badge: 'lime',    label: 'Voting Open',      tip: 'Cast your votes — one vote per category.'          },
  closed:     { badge: 'default', label: 'No Active Cycle',  tip: 'There is no active awards cycle at the moment.'    },
};

const PHASE_STEPS = ['closed', 'nominating', 'voting', 'results'];

const CATEGORY_STYLES = [
  { icon: '🏆', accent: 'border-l-[#7F622C]' },
  { icon: '⭐', accent: 'border-l-amber-400'  },
  { icon: '💡', accent: 'border-l-blue-400'   },
  { icon: '🤝', accent: 'border-l-emerald-400'},
  { icon: '🎯', accent: 'border-l-rose-400'   },
  { icon: '🚀', accent: 'border-l-violet-400' },
];

export default function StaffHome() {
  const { user, canViewResults } = useAuth();
  const { cycle, loading }       = useCycle();

  if (loading) return <PageSkeleton />;

  const phase   = cycle?.phase || 'closed';
  const info    = PHASE_INFO[phase] ?? PHASE_INFO['closed'];
  const stepIdx = PHASE_STEPS.indexOf(phase);

  const ACTION_CARDS = [
    { to: '/staff/nominate', icon: '✍️', label: 'Nominate', desc: 'Nominate yourself or a colleague', phase: 'nominating' },
    { to: '/staff/vote',     icon: '🗳️', label: 'Vote',     desc: 'Cast your vote for each category', phase: 'voting'     },
    ...(canViewResults
      ? [{ to: '/staff/results', icon: '🏅', label: 'Results', desc: 'See who took home the awards', phase: 'results' }]
      : []),
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#7F622C]">
          Welcome, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-gray-500 text-sm mt-0.5">{user?.email}</p>
      </div>

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
                    i < stepIdx   ? 'bg-[#7F622C] border-[#7F622C] text-white' :
                    i === stepIdx ? 'bg-[#CBD300] border-[#CBD300]'             :
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

    
      <div className="flex gap-4 mb-10">
        {ACTION_CARDS.map(c => {
          const active = phase === c.phase;
          return (
            <Link
              key={c.to}
              to={c.to}
              className={`flex-1 rounded-xl border p-5 transition-all ${
                active
                  ? 'bg-[#7F622C] border-[#7F622C] shadow-md scale-[1.01]'
                  : 'bg-white border-gray-200 hover:border-[#CBD300] shadow-sm opacity-90 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-2xl">{c.icon}</p>
                {active && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#CBD300] bg-white/10 px-2 py-0.5 rounded-full">
                    Active now
                  </span>
                )}
              </div>
              <p className={`font-bold text-base ${active ? 'text-white' : 'text-gray-800'}`}>{c.label}</p>
              <p className={`text-xs mt-1 ${active ? 'text-[#CBD300]' : 'text-gray-400'}`}>{c.desc}</p>
            </Link>
          );
        })}
      </div>

      {cycle?.categories?.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
            Award Categories
          </h4>
          <div className="flex flex-col gap-4">
            {cycle.categories.map((cat, idx) => {
              const style  = CATEGORY_STYLES[idx % CATEGORY_STYLES.length];
              const points = (cat.criteria || '')
                .split('\n')
                .map(p => p.trim())
                .filter(Boolean);

              return (
                <div
                  key={cat.id}
                  className={`bg-white rounded-xl border border-gray-100 border-l-[3px] ${style.accent} shadow-sm p-5`}
                >
                  <div className="flex items-start gap-2.5 mb-2">
                    <span className="text-xl leading-none shrink-0 mt-0.5">{style.icon}</span>
                    <h5 className="font-bold text-gray-900 text-sm leading-snug">{cat.name}</h5>
                  </div>

                  {cat.description && (
                    <p className="text-xs text-gray-500 leading-relaxed mb-3 ml-[30px] max-w-3xl">{cat.description}</p>
                  )}

                  {points.length > 0 && (
                    <div className="ml-[30px] max-w-3xl bg-gray-50 border border-gray-100 rounded-lg px-3.5 py-3">
                      <p className="text-[10px] font-bold text-[#7F622C] uppercase tracking-wider mb-1.5">
                        Judging Criteria
                      </p>
                      <ul className="space-y-1">
                        {points.map((pt, i) => (
                          <li key={i} className="text-xs text-gray-600 leading-snug flex gap-1.5">
                            <span className="text-[#7F622C] shrink-0">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}