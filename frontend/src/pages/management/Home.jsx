
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
    <div>

      <div className="mb-7">
        <h2 className="text-2xl font-bold text-gray-900">Admin Overview</h2>
        <p className="text-gray-500 text-sm mt-1">Manage the current awards cycle from this panel.</p>
      </div>

      {!cycle ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-400 mb-4 text-sm">No cycles found. Create one to begin.</p>
          <Link to="/management/cycles" className="inline-block bg-[#7F622C] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#5c4620] transition-colors">
            Go to Cycles
          </Link>
        </div>
      ) : (
        <>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
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
                <span className="shrink-0 text-sm font-semibold px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg">
                  Results Published
                </span>
              )}
            </div>

            <div className="flex items-center">
              {PHASE_STEPS.map((s, i) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                    i < stepIdx  ? 'bg-[#7F622C] border-[#7F622C]' :
                    i === stepIdx ? 'bg-[#CBD300] border-[#CBD300]' :
                                    'bg-white border-gray-300'
                  }`}>
                    {i < stepIdx && (
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                  {i < PHASE_STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-2 ${i < stepIdx ? 'bg-[#7F622C]' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {PHASE_STEPS.map((s, i) => (
                <span key={s} className={`text-xs capitalize ${
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
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#7F622C] hover:shadow-sm transition-all group"
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