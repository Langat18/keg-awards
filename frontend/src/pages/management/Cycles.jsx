
import { useEffect, useState } from 'react';
import { useToast } from '../../components/Toast';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import api from '../../api/axios';

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
    if (!confirm('Delete this category? All its nominations will also be deleted.')) return;
    try {
      await api.delete(`/cycles/${cycleId}/categories/${catId}`);
      toast.success('Category removed.');
      load();
    } catch (err) {
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

  const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7F622C]';

  const phaseBadge = { closed: 'default', nominating: 'blue', voting: 'lime', results: 'green' };

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-[#7F622C] mb-6">Manage Cycles</h2>

      {/* Create */}
      <Card className="mb-6">
        <h4 className="font-bold text-gray-700 mb-4">New Cycle</h4>
        <form onSubmit={createCycle} className="space-y-3">
          <input required placeholder="Title (e.g. Q2 2025 KSG Awards)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inp} />
          <input placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inp} />
          <Button type="submit" disabled={busy} size="sm">
            {busy ? '…' : 'Create Cycle'}
          </Button>
        </form>
      </Card>

      {/* List */}
      <div className="space-y-4">
        {cycles.length === 0 && <p className="text-gray-400 text-sm text-center py-6">No cycles yet.</p>}
        {cycles.map(c => (
          <Card key={c.id}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-gray-800">{c.title}</p>
                {c.description && <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={phaseBadge[c.phase]}>{c.phase}</Badge>
                {c.phase === 'closed' && (
                  <button onClick={() => deleteCycle(c.id)} className="text-xs text-red-400 hover:text-red-600">
                    Delete
                  </button>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-2">
              {c.categories?.map(cat => (
                <span key={cat.id} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                  {cat.name}
                  <button onClick={() => deleteCategory(c.id, cat.id)} className="text-red-400 hover:text-red-600 leading-none ml-0.5">×</button>
                </span>
              ))}
              <button
                onClick={() => setOpenId(openId === c.id ? null : c.id)}
                className="text-xs text-[#7F622C] font-semibold hover:underline"
              >
                {openId === c.id ? 'Cancel' : '+ Add Category'}
              </button>
            </div>

            {/* Add category form */}
            {openId === c.id && (
              <form onSubmit={e => addCategory(e, c.id)} className="mt-3 border-t pt-4 space-y-2">
                <input required placeholder="Category name *" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} className={inp} />
                <input placeholder="Description" value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} className={inp} />
                <input placeholder="Judging criteria" value={catForm.criteria} onChange={e => setCatForm(f => ({ ...f, criteria: e.target.value }))} className={inp} />
                <input type="number" min="0" placeholder="Sort order (0, 1, 2…)" value={catForm.sort_order} onChange={e => setCatForm(f => ({ ...f, sort_order: e.target.value }))} className={inp} />
                <Button type="submit" disabled={busy} variant="lime" size="sm">
                  {busy ? '…' : 'Add Category'}
                </Button>
              </form>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
