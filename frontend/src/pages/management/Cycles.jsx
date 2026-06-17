import { useEffect, useState } from 'react';
import { useToast } from '../../components/Toast';
import api from '../../api/axios';

const PHASE_META = {
  closed:     { label: 'Closed',             color: 'text-gray-500',   dot: 'bg-gray-300',   badge: 'bg-gray-100 text-gray-600 border-gray-200' },
  nominating: { label: 'Nominations Open',   color: 'text-blue-600',   dot: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  voting:     { label: 'Voting Open',         color: 'text-amber-600',  dot: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  results:    { label: 'Results Published',   color: 'text-green-600',  dot: 'bg-green-500',  badge: 'bg-green-50 text-green-700 border-green-200' },
};

const STEPS = ['closed', 'nominating', 'voting', 'results'];
const STEP_LABELS = ['Closed', 'Nominations', 'Voting', 'Results'];

const ADVANCE_CONFIRM = {
  closed:     'Open nominations? Staff will be able to submit nominations.',
  nominating: 'Move to voting? No new nominations will be accepted.',
  voting:     'Publish results? Voting ends and winners become visible.',
};

const inp = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7F622C]/30 focus:border-[#7F622C] bg-white transition-all placeholder:text-gray-300';

export default function ManageCycles() {
  const { toast }             = useToast();
  const [cycles, setCycles]   = useState([]);
  const [openId, setOpenId]   = useState(null);
  const [expanded, setExpanded] = useState({});
  const [busy, setBusy]       = useState(false);
  const [form, setForm]       = useState({ title: '', description: '' });
  const [catForm, setCatForm] = useState({ name: '', description: '', criteria: '', sort_order: '' });

  const load = () => api.get('/cycles').then(r => setCycles(r.data));
  useEffect(() => { load(); }, []);

  function toggleExpand(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  async function createCycle(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/cycles', form);
      setForm({ title: '', description: '' });
      setExpanded(prev => ({ ...prev, [data.id]: true }));
      toast.success('Cycle created.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create cycle.');
    } finally { setBusy(false); }
  }

  async function addCategory(e, cycleId) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post(`/cycles/${cycleId}/categories`, catForm);
      setCatForm({ name: '', description: '', criteria: '', sort_order: '' });
      setOpenId(null);
      toast.success('Category added.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add category.');
    } finally { setBusy(false); }
  }

  async function deleteCategory(cycleId, catId) {
    if (!confirm('Delete this category? All its nominations will also be removed.')) return;
    try {
      await api.delete(`/cycles/${cycleId}/categories/${catId}`);
      toast.success('Category removed.');
      load();
    } catch { toast.error('Failed to remove category.'); }
  }

  async function deleteCycle(cycleId) {
    if (!confirm('Delete this cycle? This cannot be undone.')) return;
    try {
      await api.delete(`/cycles/${cycleId}`);
      toast.success('Cycle deleted.');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete cycle.'); }
  }

  async function advancePhase(cycle) {
    if (!confirm(ADVANCE_CONFIRM[cycle.phase])) return;
    setBusy(true);
    try {
      await api.post(`/cycles/${cycle.id}/phase`);
      toast.success('Phase updated.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to advance phase.');
    } finally { setBusy(false); }
  }

  async function closeNominations(cycle) {
    if (!confirm('Close nominations? Staff will no longer be able to submit.')) return;
    setBusy(true);
    try {
      await api.post(`/cycles/${cycle.id}/close-nominations`);
      toast.success('Nominations closed.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close nominations.');
    } finally { setBusy(false); }
  }

  return (
    <div className="max-w-5xl mx-auto">

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Award Cycles</h2>
        <p className="text-gray-400 text-sm mt-1">
          Create a cycle, add categories, then open nominations when ready.
        </p>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-8 items-start">

        <div className="sticky top-20">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">New Cycle</h3>
            </div>
            <form onSubmit={createCycle} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wide">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  placeholder="e.g. Q2 2026 KSG Awards"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className={inp}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wide">
                  Description <span className="text-gray-300 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of this cycle"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className={inp + ' resize-none'}
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-[#7F622C] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#5c4620] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {busy ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : '+ Create Cycle'}
              </button>
            </form>

            {/* Quick guide */}
            <div className="px-6 pb-6">
              <div className="bg-[#7F622C]/5 rounded-xl p-4 border border-[#7F622C]/10">
                <p className="text-xs font-bold text-[#7F622C] mb-2">How cycles work</p>
                <ol className="space-y-1.5">
                  {[
                    'Create a cycle',
                    'Add award categories',
                    'Open nominations',
                    'Start voting',
                    'Publish results',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#7F622C]/70">
                      <span className="w-4 h-4 rounded-full bg-[#7F622C]/15 text-[#7F622C] font-bold flex items-center justify-center shrink-0 text-[10px] mt-px">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>


        <div className="space-y-4">
          {cycles.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-14 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🏆</span>
              </div>
              <p className="text-gray-500 text-sm font-medium">No cycles yet</p>
              <p className="text-gray-400 text-xs mt-1">Create your first award cycle to get started.</p>
            </div>
          )}

          {cycles.map(c => {
            const meta = PHASE_META[c.phase];
            const isExpanded = expanded[c.id] ?? true;
            const phaseIdx = STEPS.indexOf(c.phase);

            return (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">


                <div
                  className="flex items-center justify-between px-6 py-4 cursor-pointer select-none hover:bg-gray-50/60 transition-colors"
                  onClick={() => toggleExpand(c.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${meta.dot} ${c.phase !== 'closed' && c.phase !== 'results' ? 'animate-pulse' : ''}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="font-bold text-gray-900 text-base leading-tight">{c.title}</h4>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </div>
                      {c.description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-sm">{c.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    {c.phase === 'closed' && (
                      <button
                        onClick={ev => { ev.stopPropagation(); deleteCycle(c.id); }}
                        className="text-xs text-gray-300 hover:text-red-400 transition-colors px-1"
                      >
                        Delete
                      </button>
                    )}
                    <span className="text-gray-300 text-sm">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <>
      
                    <div className="px-6 py-4 bg-gray-50/60 border-t border-gray-100">
                      <div className="flex items-center mb-4">
                        {STEPS.map((ph, i) => {
                          const done   = i < phaseIdx;
                          const active = i === phaseIdx;
                          const future = i > phaseIdx;
                          return (
                            <div key={ph} className="flex items-center flex-1 last:flex-none">
                              <div className="flex flex-col items-center">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all
                                  ${active  ? 'bg-[#7F622C] text-white shadow-md shadow-[#7F622C]/25 ring-3 ring-[#7F622C]/20'
                                  : done   ? 'bg-green-500 text-white'
                                  :          'bg-gray-100 text-gray-300 border border-gray-200'}`}
                                >
                                  {done ? '✓' : i + 1}
                                </div>
                                <span className={`text-[10px] mt-1.5 font-semibold hidden sm:block whitespace-nowrap
                                  ${active ? 'text-[#7F622C]' : done ? 'text-green-500' : 'text-gray-300'}`}
                                >
                                  {STEP_LABELS[i]}
                                </span>
                              </div>
                              {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-px mx-2 mb-4 transition-colors
                                  ${i < phaseIdx ? 'bg-green-400' : 'bg-gray-200'}`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>


                      <div className="flex flex-wrap gap-2">
                        {c.phase === 'closed' && (
                          <>
                            <button
                              onClick={() => advancePhase(c)}
                              disabled={busy || !c.categories?.length}
                              title={!c.categories?.length ? 'Add at least one category first' : ''}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-[#7F622C] text-white hover:bg-[#5c4620] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              <span>▶</span> Open Nominations
                            </button>
                            {!c.categories?.length && (
                              <span className="text-xs text-amber-500 self-center flex items-center gap-1">
                                <span>⚠</span> Add a category first
                              </span>
                            )}
                          </>
                        )}

                        {c.phase === 'nominating' && (
                          <>
                            <button
                              onClick={() => closeNominations(c)}
                              disabled={busy}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-white text-red-500 border border-red-200 hover:bg-red-50 disabled:opacity-40 transition-colors"
                            >
                              <span>✕</span> Close Nominations
                            </button>
                            <button
                              onClick={() => advancePhase(c)}
                              disabled={busy}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 transition-colors"
                            >
                              <span>▶</span> Start Voting
                            </button>
                          </>
                        )}

                        {c.phase === 'voting' && (
                          <button
                            onClick={() => advancePhase(c)}
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 transition-colors"
                          >
                            <span>🏆</span> Publish Results
                          </button>
                        )}

                        {c.phase === 'results' && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
                            <span>✓</span> Cycle complete
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="px-6 py-5 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Categories</span>
                          <span className="text-xs bg-gray-100 text-gray-500 font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                            {c.categories?.length || 0}
                          </span>
                        </div>
                      </div>

                      {c.categories?.length === 0 && openId !== c.id && (
                        <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center mb-4">
                          <p className="text-xs text-gray-400">No categories yet — add one below to enable nominations.</p>
                        </div>
                      )}

                      {c.categories?.length > 0 && (
                        <div className="grid sm:grid-cols-2 gap-2 mb-4">
                          {c.categories.map(cat => (
                            <div
                              key={cat.id}
                              className="group flex items-start justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 hover:border-gray-200 transition-colors"
                            >
                              <div className="min-w-0 pr-2">
                                <p className="text-sm font-semibold text-gray-800 leading-tight">{cat.name}</p>
                                {cat.criteria && (
                                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{cat.criteria}</p>
                                )}
                              </div>
                              <button
                                onClick={() => deleteCategory(c.id, cat.id)}
                                className="text-gray-200 hover:text-red-400 transition-colors shrink-0 text-lg leading-none mt-0.5 opacity-0 group-hover:opacity-100"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {openId !== c.id ? (
                        <button
                          onClick={() => setOpenId(c.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7F622C] hover:text-[#5c4620] bg-[#7F622C]/5 hover:bg-[#7F622C]/10 px-3.5 py-2 rounded-lg transition-colors"
                        >
                          + Add Category
                        </button>
                      ) : (
                        <div className="border border-[#7F622C]/20 rounded-xl overflow-hidden mt-2">
                          <div className="bg-[#7F622C]/5 px-4 py-2.5 border-b border-[#7F622C]/10">
                            <p className="text-xs font-bold text-[#7F622C] uppercase tracking-wider">New Category</p>
                          </div>
                          <form onSubmit={e => addCategory(e, c.id)} className="p-4 space-y-3">
                            <div className="grid sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Name <span className="text-red-400">*</span></label>
                                <input
                                  required
                                  placeholder="e.g. Employee of the Year"
                                  value={catForm.name}
                                  onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))}
                                  className={inp}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Sort Order</label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  value={catForm.sort_order}
                                  onChange={e => setCatForm(f => ({ ...f, sort_order: e.target.value }))}
                                  className={inp}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Description</label>
                              <input
                                placeholder="Short description"
                                value={catForm.description}
                                onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))}
                                className={inp}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Judging Criteria</label>
                              <input
                                placeholder="What qualifies someone for this award?"
                                value={catForm.criteria}
                                onChange={e => setCatForm(f => ({ ...f, criteria: e.target.value }))}
                                className={inp}
                              />
                            </div>
                            <div className="flex gap-2 pt-1">
                              <button
                                type="submit"
                                disabled={busy}
                                className="bg-[#7F622C] text-white text-xs font-semibold px-5 py-2 rounded-lg hover:bg-[#5c4620] disabled:opacity-50 transition-colors"
                              >
                                {busy ? 'Saving…' : 'Add Category'}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setOpenId(null); setCatForm({ name: '', description: '', criteria: '', sort_order: '' }); }}
                                className="text-xs text-gray-400 hover:text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}