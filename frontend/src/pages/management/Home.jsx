// FILE: frontend/src/pages/management/Home.jsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import { PageSkeleton } from '../../components/Skeleton';
import Card from '../../components/Card';
import Button from '../../components/Button';
import api from '../../api/axios';

const PHASE_STEPS = ['closed', 'nominating', 'voting', 'results'];

const PHASE_BTN = {
  closed:     { label: 'Open Nominations', variant: 'outline' },
  nominating: { label: 'Start Voting',     variant: 'lime'    },
  voting:     { label: 'Publish Results',  variant: 'primary' },
};

const QUICK_LINKS = [
  { to: '/management/cycles',      icon: '⚙️', label: 'Cycles',      desc: 'Create & manage award cycles' },
  { to: '/management/nominations', icon: '📋', label: 'Nominations', desc: 'Review all nominations'       },
  { to: '/management/results',     icon: '🏅', label: 'Results',     desc: 'Full vote breakdown'          },
  { to: '/management/users',       icon: '👥', label: 'Users',       desc: 'Manage staff accounts'        },
];

export default function ManagementHome() {
  const { toast }             = useToast();
  const [cycle, setCycle]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]       = useState(false);

  async function loadCycle() {
    setLoading(true);
    try {
      // Try active cycle first (nominating/voting/results)
      const { data } = await api.get('/cycles/active');
      setCycle(data);
    } catch {
      // Fall back to most recent closed cycle
      try {
        const { data } = await api.get('/cycles');
        const latest = data?.[0] ?? null;
        setCycle(latest);
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
      <h2 className="text-2xl font-bold text-[#7F622C] mb-6">Admin Overview</h2>

      {!cycle ? (
        <Card className="text-center py-10">
          <p className="text-gray-400 mb-4">No cycles found. Create one to begin.</p>
          <Link
            to="/management/cycles"
            className="inline-block bg-[#7F622C] text-white text-sm px-5 py-2.5 rounded-lg hover:bg-[#5c4620] transition-colors"
          >
            Manage Cycles →
          </Link>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <div className="flex items-start justify-between mb-6 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Current Cycle</p>
                <h3 className="text-xl font-bold text-gray-800">{cycle.title}</h3>
                {cycle.description && (
                  <p className="text-gray-500 text-sm mt-1">{cycle.description}</p>
                )}
              </div>
              <div className="shrink-0">
                {btn ? (
                  <Button variant={btn.variant} onClick={advance} disabled={busy}>
                    {busy ? '…' : btn.label}
                  </Button>
                ) : (
                  <span className="text-sm font-semibold px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                    ✅ Results Published
                  </span>
                )}
              </div>
            </div>

            {/* Phase stepper */}
            <div className="flex items-center mb-2">
              {PHASE_STEPS.map((s, i) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
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
            <div className="flex justify-between">
              {PHASE_STEPS.map((s, i) => (
                <span key={s} className={`text-xs capitalize font-medium ${
                  i === stepIdx ? 'text-[#7F622C]' : 'text-gray-400'
                }`}>
                  {s}
                </span>
              ))}
            </div>
          </Card>

          {/* Quick links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {QUICK_LINKS.map(c => (
              <Link
                key={c.to}
                to={c.to}
                className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-[#CBD300] transition-all text-center"
              >
                <p className="text-3xl mb-2">{c.icon}</p>
                <p className="text-sm font-bold text-gray-700">{c.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{c.desc}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}