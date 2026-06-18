import { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import { useCycle } from '../../hooks/useCycle';
import { useNominations } from '../../hooks/useNominations';
import { useUsers } from '../../hooks/useUsers';
import { useToast } from '../../components/Toast';
import { PageSkeleton } from '../../components/Skeleton';
import PhaseBanner from '../../components/PhaseBanner';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import StaffPicker from '../../components/StaffPicker';
import api from '../../api/axios';

export default function Nominate() {
  const { user }                         = useAuth();
  const { cycle, loading: cycleLoading } = useCycle();
  const { nominations, refetch }         = useNominations(cycle?.id);
  const { users }                        = useUsers();
  const { toast }                        = useToast();

  const [self, setSelf]     = useState(false);
  const [busy, setBusy]     = useState(false);
  const [form, setForm]     = useState({ category_id: '', nominee_id: '', reason: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(f => ({ ...f, nominee_id: self ? String(user.id) : '' }));
  }, [self]);

  if (cycleLoading) return <PageSkeleton />;
  if (!cycle || cycle.phase !== 'nominating') {
    return <PhaseBanner phase={cycle?.phase} expected="nominating" label="Nominations" />;
  }

  function validate() {
    const e = {};
    if (!form.category_id) e.category_id = 'Please select a category.';
    if (!form.nominee_id)  e.nominee_id  = 'Please select a nominee.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      await api.post(`/cycles/${cycle.id}/nominations`, {
        category_id: Number(form.category_id),
        nominee_id:  Number(form.nominee_id),
        reason:      form.reason.trim(),
      });
      toast.success('Nomination submitted successfully.');
      setForm({ category_id: '', nominee_id: '', reason: '' });
      setSelf(false);
      setErrors({});
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally {
      setBusy(false);
    }
  }

  const selectedCat = cycle.categories?.find(c => c.id == form.category_id);
  const myNoms      = nominations.filter(n => n.nominated_by === user.id);
  const sel         = `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7F622C]`;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-[#7F622C] mb-1">Submit a Nomination</h2>
      <p className="text-gray-500 text-sm mb-6">{cycle.title}</p>

      <Card className="mb-8">
        <form onSubmit={submit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Award Category</label>
            <select
              value={form.category_id}
              onChange={e => { setForm(f => ({ ...f, category_id: e.target.value })); setErrors(er => ({ ...er, category_id: '' })); }}
              className={`${sel} ${errors.category_id ? 'border-red-400' : 'border-gray-300'}`}
            >
              <option value="">— Select category —</option>
              {cycle.categories?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id}</p>}
            {selectedCat?.criteria && (
              <p className="text-xs text-[#5c4620] bg-[#CBD300]/10 rounded px-3 py-1.5 mt-2">
                <strong>Criteria:</strong> {selectedCat.criteria}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Nominee</label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[#7F622C] font-medium select-none">
                <input
                  type="checkbox"
                  checked={self}
                  onChange={e => setSelf(e.target.checked)}
                  className="accent-[#7F622C]"
                />
                Self-nominate
              </label>
            </div>

            {self ? (
              <div className="border border-[#CBD300] bg-[#CBD300]/10 rounded-lg px-3 py-2.5 text-sm text-[#5c4620] font-medium flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#7F622C]/20 text-[#7F622C] text-[10px] font-bold flex items-center justify-center shrink-0">
                  {user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                {user.name} <span className="text-[#7F622C]/60 font-normal">(You)</span>
              </div>
            ) : (
              <>
                <StaffPicker
                  users={users}
                  value={form.nominee_id}
                  onChange={id => { setForm(f => ({ ...f, nominee_id: id })); setErrors(er => ({ ...er, nominee_id: '' })); }}
                  error={errors.nominee_id}
                  placeholder="Search by name or department…"
                />
                {errors.nominee_id && <p className="text-xs text-red-500 mt-1">{errors.nominee_id}</p>}
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason <span className="text-gray-400 font-normal">(optional — max 600 chars)</span>
            </label>
            <textarea
              rows={3}
              maxLength={600}
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              placeholder="Why does this person deserve the award?"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7F622C] resize-none"
            />
            <p className="text-xs text-gray-400 text-right">{form.reason.length}/600</p>
          </div>

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'Submitting…' : 'Submit Nomination'}
          </Button>
        </form>
      </Card>

      {myNoms.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Your Submissions</h4>
          <div className="space-y-2">
            {myNoms.map(n => (
              <div key={n.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex justify-between items-center shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{n.nominee?.name}</p>
                  <p className="text-xs text-gray-400">{n.nominee?.department}</p>
                </div>
                <Badge variant="lime">{n.category?.name}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}