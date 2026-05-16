
import { useEffect, useState } from 'react';
import { useToast } from '../../components/Toast';
import api from '../../api/axios';

const PHASE_COLORS = {
  closed:     'bg-gray-100 text-gray-600',
  nominating: 'bg-blue-100 text-blue-700',
  voting:     'bg-amber-100 text-amber-700',
  results:    'bg-green-100 text-green-700',
};

export default function ManageCycles() {
  const { toast }             = useToast();
  const [cycles, setCycles]   = useState([]);
  const [openId, setOpenId]   = useState(null);
  const [busy, setBusy]       = useState(false);
  const [form, setForm]       = useState({ title: '', description: '' });
  const [catForm, setCatForm] = useState({ name: '', description: '', criteria: '', sort_order: '' });

  const load = () => api.get('/cycles').then(r => setCycles(r.data));
  useEffect(() => { load(); }, []);

  async function createCycle(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/cycles', form);
      setForm({ title: '', description: '' });
      toast.success('Cycle created.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create cycle.');
    } finally {
      setBusy(false);
    }
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
    } finally {
      setBusy(false);
    }
  }

  async function deleteCategory(cycleId, catId) {
    if (!confirm('Delete this category? All its nominations will also be removed.')) return;
    try {
      await api.delete(`/cycles/${cycleId}/categories/${catId}`);
      toast.success('Category removed.');
      load();
    } catch {
      toast.error('Failed to remove category.');
    }
  }

  async function deleteCycle(cycleId) {
    if (!confirm('Delete this cycle? This cannot be undone.')) return;
    try {
      await api.delete(`/cycles/${cycleId}`);
      toast.success('Cycle deleted.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete cycle.');
    }
  }

  const inp = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#7F622C] focus:border-[#7F622C] bg-white transition-colors';

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Manage Cycles</h2>
        <p className="text-gray-500 text-sm mt-1">Create award cycles and define categories before opening nominations.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-20">
            <h3 className="font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">New Cycle</h3>
            <form onSubmit={createCycle} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Title</label>
                <input
                  required
                  placeholder="e.g. Q2 2026 KSG Awards"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className={inp}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Description <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
                <input
                  placeholder="Brief description of this cycle"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className={inp}
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-[#7F622C] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#5c4620] disabled:opacity-50 transition-colors"
              >
                {busy ? 'Creating…' : 'Create Cycle'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {cycles.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-10 text-center">
              <p className="text-gray-400 text-sm">No cycles yet. Create one to get started.</p>
            </div>
          )}

          {cycles.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">

              {/* Cycle header */}
              <div className="flex items-start justify-between p-5 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900 text-base">{c.title}</h4>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${PHASE_COLORS[c.phase]}`}>
                      {c.phase}
                    </span>
                  </div>
                  {c.description && (
                    <p className="text-xs text-gray-400">{c.description}</p>
                  )}
                </div>
                {c.phase === 'closed' && (
                  <button
                    onClick={() => deleteCycle(c.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors shrink-0 ml-4"
                  >
                    Delete
                  </button>
                )}
              </div>

              <div className="p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Categories ({c.categories?.length || 0})
                </p>

                {c.categories?.length === 0 && (
                  <p className="text-xs text-gray-400 italic mb-3">No categories added yet.</p>
                )}

                <div className="space-y-2 mb-4">
                  {c.categories?.map(cat => (
                    <div key={cat.id} className="flex items-start justify-between bg-gray-50 rounded-lg px-3.5 py-2.5">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{cat.name}</p>
                        {cat.criteria && (
                          <p className="text-xs text-gray-400 mt-0.5">{cat.criteria}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteCategory(c.id, cat.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors ml-3 shrink-0 text-base leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {openId !== c.id ? (
                  <button
                    onClick={() => setOpenId(c.id)}
                    className="text-xs font-semibold text-[#7F622C] hover:underline"
                  >
                    + Add Category
                  </button>
                ) : (
                  <form onSubmit={e => addCategory(e, c.id)} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">New Category</p>
                    <input required placeholder="Category name *" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} className={inp} />
                    <input placeholder="Description" value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} className={inp} />
                    <input placeholder="Judging criteria" value={catForm.criteria} onChange={e => setCatForm(f => ({ ...f, criteria: e.target.value }))} className={inp} />
                    <input type="number" min="0" placeholder="Sort order (0, 1, 2…)" value={catForm.sort_order} onChange={e => setCatForm(f => ({ ...f, sort_order: e.target.value }))} className={inp} />
                    <div className="flex gap-2">
                      <button type="submit" disabled={busy} className="bg-[#7F622C] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#5c4620] disabled:opacity-50 transition-colors">
                        {busy ? '…' : 'Add Category'}
                      </button>
                      <button type="button" onClick={() => setOpenId(null)} className="text-xs text-gray-400 hover:text-gray-600 px-3 py-2">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}