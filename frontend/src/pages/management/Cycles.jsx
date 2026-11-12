import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/Dialog';
import { criteriaList, errorMessage, fieldErrors, formatDate, plural } from '../../lib/format';
import { PHASE_LABEL, PHASE_TONE } from '../../lib/phases';
import { PageSkeleton } from '../../components/Skeleton';
import { ADVANCE } from './phaseActions';
import api from '../../api/axios';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card from '../../components/Card';
import CategoryDialog from './CategoryDialog';
import Dialog from '../../components/Dialog';
import EmptyState from '../../components/EmptyState';
import Icon from '../../components/Icon';
import Input, { Textarea } from '../../components/Input';
import PageHeader from '../../components/PageHeader';
import PhaseTrack from '../../components/PhaseTrack';

function CycleForm({ open, cycle, onClose, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ title: '', description: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ title: cycle?.title || '', description: cycle?.description || '' });
      setErrors({});
    }
  }, [open, cycle]);

  async function submit(e) {
    e?.preventDefault();
    setBusy(true);
    try {
      const payload = { title: form.title.trim(), description: form.description.trim() || null };
      const { data } = cycle ? await api.put(`/cycles/${cycle.id}`, payload) : await api.post('/cycles', payload);
      toast.success(cycle ? 'Cycle updated.' : 'Cycle created. Add its categories next.');
      onSaved(data);
    } catch (err) {
      setErrors(fieldErrors(err));
      if (!err.response?.data?.errors) toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      title={cycle ? 'Edit cycle' : 'New awards cycle'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={busy} disabled={!form.title.trim()}>{cycle ? 'Save changes' : 'Create cycle'}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="mt-4 space-y-5 text-brand-ink">
        <Input label="Title" required placeholder="e.g. 2027 Q1 Staff Awards" value={form.title} error={errors.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        <Textarea label="Description" optional rows={3} placeholder="Shown to staff on their home page" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </form>
    </Dialog>
  );
}

function CloneDialog({ cycle, onClose, onCloned }) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => setTitle(''), [cycle]);

  async function submit(e) {
    e?.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post(`/cycles/${cycle.id}/clone`, { title: title.trim() });
      toast.success(`"${data.title}" created with ${plural(data.categories.length, 'category', 'categories')}.`);
      onCloned(data);
    } catch (err) {
      toast.error(errorMessage(err, 'The cycle could not be copied.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={Boolean(cycle)}
      title="Copy this cycle"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={busy} disabled={!title.trim()}>Create copy</Button>
        </>
      }
    >
      <p>
        Creates a new cycle with the same {plural(cycle?.categories?.length || 0, 'category', 'categories')} as “{cycle?.title}”.
        Nominations, votes and results are not copied.
      </p>
      <form onSubmit={submit} className="mt-4 text-brand-ink">
        <Input label="Title for the new cycle" required placeholder="e.g. 2027 Q2 Staff Awards" value={title} onChange={e => setTitle(e.target.value)} />
      </form>
    </Dialog>
  );
}

function ForceDeleteDialog({ cycle, onClose, onDeleted }) {
  const { toast } = useToast();
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => setTyped(''), [cycle]);

  async function submit(e) {
    e?.preventDefault();
    if (typed !== cycle.title) return;
    setBusy(true);
    try {
      await api.post(`/cycles/${cycle.id}/force-delete`, { confirm_title: typed });
      toast.success(`“${cycle.title}” was deleted.`);
      onDeleted();
    } catch (err) {
      toast.error(errorMessage(err, 'The cycle could not be deleted.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={Boolean(cycle)}
      title="Delete this cycle permanently?"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={submit} loading={busy} disabled={typed !== cycle?.title}>Delete permanently</Button>
        </>
      }
    >
      <p>
        “{cycle?.title}” is in the <strong className="text-brand-ink">{PHASE_LABEL[cycle?.phase]?.toLowerCase()}</strong> stage.
        Deleting it removes all of its categories, {plural(cycle?.nominations_count || 0, 'nomination')} and {plural(cycle?.votes_count || 0, 'vote')}. This cannot be undone.
      </p>
      <form onSubmit={submit} className="mt-4 text-brand-ink">
        <Input label="Type the cycle title to confirm" value={typed} placeholder={cycle?.title} onChange={e => setTyped(e.target.value)} />
      </form>
    </Dialog>
  );
}

function CycleCard({ cycle, expanded, onToggle, onChanged, onEdit, onClone, onForceDelete }) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);
  const [categoryDialog, setCategoryDialog] = useState(null);

  const action = ADVANCE[cycle.phase];
  const locked = cycle.phase === 'voting' || cycle.phase === 'results';
  const categories = cycle.categories || [];

  async function run(fn, success, failure) {
    setBusy(true);
    try {
      await fn();
      toast.success(success);
      await onChanged();
    } catch (err) {
      toast.error(errorMessage(err, failure));
    } finally {
      setBusy(false);
    }
  }

  async function advance() {
    const ok = await confirm({ title: action.title, message: action.message, confirmLabel: action.label });
    if (ok) run(() => api.post(`/cycles/${cycle.id}/phase`), action.done, 'The cycle could not be moved on.');
  }

  async function pause() {
    const ok = await confirm({
      title: 'Pause nominations?',
      message: 'Staff will not be able to submit nominations until you open them again. Nominations already made are kept.',
      confirmLabel: 'Pause nominations',
    });
    if (ok) run(() => api.post(`/cycles/${cycle.id}/close-nominations`), 'Nominations paused.', 'Nominations could not be paused.');
  }

  async function remove() {
    const ok = await confirm({
      title: 'Delete this cycle?',
      message: `“${cycle.title}” and its ${plural(categories.length, 'category', 'categories')} will be deleted.`,
      confirmLabel: 'Delete cycle',
      danger: true,
    });
    if (ok) run(() => api.delete(`/cycles/${cycle.id}`), 'Cycle deleted.', 'The cycle could not be deleted.');
  }

  async function removeCategory(category) {
    const ok = await confirm({
      title: `Remove “${category.name}”?`,
      message: 'Any nominations already made in this category will be removed too.',
      confirmLabel: 'Remove category',
      danger: true,
    });
    if (ok) run(() => api.delete(`/cycles/${cycle.id}/categories/${category.id}`), 'Category removed.', 'The category could not be removed.');
  }

  async function saveCategory(payload) {
    const editing = categoryDialog?.id;
    try {
      if (editing) await api.put(`/cycles/${cycle.id}/categories/${editing}`, payload);
      else await api.post(`/cycles/${cycle.id}/categories`, payload);
      toast.success(editing ? 'Category saved.' : `“${payload.name}” added.`);
      setCategoryDialog(null);
      await onChanged();
    } catch (err) {
      const fields = fieldErrors(err);
      if (!Object.keys(fields).length) toast.error(errorMessage(err, 'The category was not saved.'));
      throw Object.assign(new Error('invalid'), { fields });
    }
  }

  return (
    <Card padded={false}>
      <div className="flex items-start gap-3 p-5 sm:px-6">
        <button onClick={onToggle} aria-expanded={expanded} className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted hover:bg-canvas">
          <Icon name="chevronRight" className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
        <button onClick={onToggle} className="min-w-0 flex-1 text-left">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="text-lg">{cycle.title}</h2>
            <Badge tone={PHASE_TONE[cycle.phase]} dot={cycle.phase === 'nominating' || cycle.phase === 'voting'}>
              {PHASE_LABEL[cycle.phase]}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted">
            {plural(categories.length, 'category', 'categories')}, {plural(cycle.nominations_count || 0, 'nomination')}, {plural(cycle.votes_count || 0, 'vote')}
            {cycle.created_at && `. Created ${formatDate(cycle.created_at)}`}
          </p>
        </button>
      </div>

      {expanded && (
        <div className="border-t border-line">
          <div className="space-y-5 p-5 sm:px-6">
            {cycle.description && <p className="max-w-2xl text-muted">{cycle.description}</p>}
            <PhaseTrack cycle={cycle} compact />

            <div className="flex flex-wrap items-center gap-2">
              {action && (
                <Button
                  icon={action.icon}
                  variant={cycle.phase === 'voting' ? 'lime' : 'primary'}
                  onClick={advance}
                  disabled={busy || !categories.length}
                >
                  {action.label}
                </Button>
              )}
              {cycle.phase === 'nominating' && (
                <Button variant="secondary" icon="pause" onClick={pause} disabled={busy}>Pause nominations</Button>
              )}
              <Button variant="ghost" icon="edit" onClick={onEdit}>Edit details</Button>
              <Button variant="ghost" icon="copy" onClick={onClone}>Copy</Button>
              {cycle.phase === 'closed' ? (
                <Button variant="ghost" icon="trash" className="text-red-700 hover:bg-red-50" onClick={remove} disabled={busy}>Delete</Button>
              ) : (
                <Button variant="ghost" icon="trash" className="text-red-700 hover:bg-red-50" onClick={onForceDelete}>Delete permanently</Button>
              )}
            </div>
            {!categories.length && cycle.phase === 'closed' && (
              <p className="text-sm text-amber-800">Add at least one category before opening nominations.</p>
            )}
          </div>

          <div className="border-t border-line bg-canvas/50 p-5 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base">Categories</h3>
              {!locked && <Button size="sm" variant="secondary" icon="plus" onClick={() => setCategoryDialog({})}>Add category</Button>}
            </div>

            {categories.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No categories yet.</p>
            ) : (
              <ul className="mt-3 grid gap-3 md:grid-cols-2">
                {categories.map(category => {
                  const points = criteriaList(category.criteria);
                  return (
                    <li key={category.id} className="rounded-lg border border-line bg-white p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold">{category.name}</p>
                        <div className="-mr-2 -mt-1 flex">
                          <button onClick={() => setCategoryDialog(category)} className="flex h-8 w-8 items-center justify-center rounded text-muted hover:bg-canvas hover:text-brand-ink" aria-label={`Edit ${category.name}`}>
                            <Icon name="edit" className="h-4 w-4" />
                          </button>
                          {!locked && (
                            <button onClick={() => removeCategory(category)} className="flex h-8 w-8 items-center justify-center rounded text-muted hover:bg-red-50 hover:text-red-700" aria-label={`Remove ${category.name}`}>
                              <Icon name="trash" className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      {category.description && <p className="mt-1 text-sm text-muted">{category.description}</p>}
                      {points.length > 0 && (
                        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-muted">
                          {points.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      <CategoryDialog
        open={Boolean(categoryDialog)}
        category={categoryDialog?.id ? categoryDialog : null}
        onClose={() => setCategoryDialog(null)}
        onSave={saveCategory}
      />
    </Card>
  );
}

export default function ManageCycles() {
  const { toast } = useToast();
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [cycleForm, setCycleForm] = useState(null);
  const [cloning, setCloning] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(() => {
    return api.get('/cycles')
      .then(({ data }) => setCycles(data))
      .catch(err => toast.error(errorMessage(err, 'Cycles could not be loaded.')))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageSkeleton />;

  const isExpanded = (cycle, index) => expanded[cycle.id] ?? (cycle.phase !== 'results' || index === 0);

  function opened(cycle) {
    setExpanded(e => ({ ...e, [cycle.id]: true }));
    load();
  }

  return (
    <div>
      <PageHeader
        title="Awards cycles"
        description="Create a cycle, add its categories, then move it through nominations, voting and results."
        actions={<Button icon="plus" onClick={() => setCycleForm({})}>New cycle</Button>}
      />

      {cycles.length === 0 ? (
        <EmptyState icon="layers" title="No cycles yet" action={<Button icon="plus" onClick={() => setCycleForm({})}>Create the first cycle</Button>}>
          A cycle is one round of awards, such as a quarter or a year.
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {cycles.map((cycle, i) => (
            <CycleCard
              key={cycle.id}
              cycle={cycle}
              expanded={isExpanded(cycle, i)}
              onToggle={() => setExpanded(e => ({ ...e, [cycle.id]: !isExpanded(cycle, i) }))}
              onChanged={load}
              onEdit={() => setCycleForm(cycle)}
              onClone={() => setCloning(cycle)}
              onForceDelete={() => setDeleting(cycle)}
            />
          ))}
        </div>
      )}

      <CycleForm
        open={Boolean(cycleForm)}
        cycle={cycleForm?.id ? cycleForm : null}
        onClose={() => setCycleForm(null)}
        onSaved={cycle => {
          setCycleForm(null);
          opened(cycle);
        }}
      />
      <CloneDialog
        cycle={cloning}
        onClose={() => setCloning(null)}
        onCloned={cycle => {
          setCloning(null);
          opened(cycle);
        }}
      />
      <ForceDeleteDialog
        cycle={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={() => {
          setDeleting(null);
          load();
        }}
      />
    </div>
  );
}
