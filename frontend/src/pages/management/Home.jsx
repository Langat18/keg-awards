import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import { PageSkeleton } from '../../components/Skeleton';
import api from '../../api/axios';

const PHASE_STEPS = ['closed', 'nominating', 'voting', 'results'];

const PHASE_BTN = {
  closed:     { label: 'Open Nominations', cls: 'bg-[#7F622C] hover:bg-[#5c4620] text-white' },
  nominating: { label: 'Start Voting',     cls: 'bg-[#7F622C] hover:bg-[#5c4620] text-white' },
  voting:     { label: 'Publish Results',  cls: 'bg-[#7F622C] hover:bg-[#5c4620] text-white' },
};

const QUICK_LINKS = [
  { to: '/management/cycles',      label: 'Cycles',      desc: 'Create & manage award cycles'  },
  { to: '/management/nominations', label: 'Nominations', desc: 'Review submitted nominations'  },
  { to: '/management/results',     label: 'Results',     desc: 'View vote breakdown & winners' },
  { to: '/management/users',       label: 'Users',       desc: 'Manage staff accounts'         },
];

export default function ManagementHome() {
  const { toast }             = useToast();
  const [cycle, setCycle]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]       = useState(false);

  async function loadCycle() {
    setLoading(true);
    try {
      const { data } = await api.get('/cycles/active');
      setCycle(data);
    } catch {
      try {
        const { data } = await api.get('/cycles');
        setCycle(data?.[0] ?? null);
      } catch {
        setCycle(null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCycle(); }, []);

  async function advance() {
    setBusy(true);
    try {
      const { data } = await api.post(`/cycles/${cycle.id}/phase`);
      setCycle(data);
      toast.success(`Phase advanced to: ${data.phase}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to advance phase.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <PageSkeleton />;

  const stepIdx = PHASE_STEPS.indexOf(cycle?.phase || 'closed');
  const btn     = cycle ? PHASE_BTN[cycle.phase] : null;

  return (
    <div className="max-w-5xl mx-auto">

      <div className="mb-8">
        <p className="text-xs font-semibold text-[#7F622C] uppercase tracking-widest mb-1">Administration</p>
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <p className="text-gray-400 text-sm mt-1">Manage the current awards cycle from this panel.</p>
      </div>

      {!cycle ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <p className="text-3xl mb-3">🏆</p>
          <p className="text-sm font-semibold text-gray-400 mb-1">No cycles found</p>
          <p className="text-xs text-gray-300 mb-6">Create a cycle to begin the awards process.</p>
          <Link
            to="/management/cycles"
            className="inline-block bg-[#7F622C] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#5c4620] transition-colors"
          >
            Go to Cycles
          </Link>
        </div>
      ) : (
        <>
  
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Current Cycle</p>
                <h3 className="text-xl font-bold text-gray-900">{cycle.title}</h3>
                {cycle.description && <p className="text-sm text-gray-400 mt-1">{cycle.description}</p>}
              </div>
              {btn ? (
                <button
                  onClick={advance}
                  disabled={busy}
                  className={`shrink-0 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 ${btn.cls}`}
                >
                  {busy ? 'Please wait…' : btn.label}
                </button>
              ) : (
                <span className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Results Published
                </span>
              )}
            </div>

   
            <div className="flex items-center mb-2">
              {PHASE_STEPS.map((s, i) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className={`w-7 h-7 rounded-full border-2 shrink-0 flex items-center justify-center text-[11px] font-bold transition-all ${
                    i < stepIdx   ? 'bg-[#7F622C] border-[#7F622C] text-white'
                    : i === stepIdx ? 'bg-[#CBD300] border-[#CBD300] text-[#3d2e00]'
                    :                 'bg-white border-gray-200 text-gray-300'
                  }`}>
                    {i < stepIdx ? (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    ) : i + 1}
                  </div>
                  {i < PHASE_STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-2 transition-colors ${i < stepIdx ? 'bg-[#7F622C]' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              {PHASE_STEPS.map((s, i) => (
                <span key={s} className={`text-xs capitalize font-medium ${
                  i === stepIdx ? 'text-[#7F622C] font-bold' : 'text-gray-400'
                }`}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {QUICK_LINKS.map(c => (
              <Link
                key={c.to}
                to={c.to}
                className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#7F622C]/40 hover:shadow-sm transition-all group shadow-sm"
              >
                <p className="font-bold text-gray-800 text-sm mb-1 group-hover:text-[#7F622C] transition-colors">{c.label}</p>
                <p className="text-xs text-gray-400 leading-snug">{c.desc}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}