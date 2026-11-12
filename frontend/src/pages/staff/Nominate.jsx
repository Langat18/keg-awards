import { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { useCycle } from '../../hooks/useCycle';
import { useNominations } from '../../hooks/useNominations';
import { useUsers } from '../../hooks/useUsers';
import { useToast } from '../../components/Toast';
import api from '../../api/axios';
import { criteriaList, errorMessage } from '../../lib/format';
import { PageSkeleton } from '../../components/Skeleton';
import { Field, Select, Textarea } from '../../components/Input';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import StaffPicker from '../../components/StaffPicker';

const EMPTY = { category_id: '', nominee_id: '', reason: '' };

export default function Nominate() {
  const { user } = useAuth();
  const { cycle, loading } = useCycle();
  const { nominations, refetch } = useNominations(cycle?.phase === 'nominating' ? cycle.id : null);
  const { users } = useUsers();
  const { toast } = useToast();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (loading) return <PageSkeleton />;

  if (cycle?.phase !== 'nominating') {
    return (
      <>
        <PageHeader title="Nominate a colleague" />
        <EmptyState icon="pen" title="Nominations are closed" action={<Button to="/staff" variant="secondary">Back to home</Button>}>
          {cycle?.phase === 'voting'
            ? 'Nominations for this cycle have closed and voting is now open.'
            : 'You will be able to nominate here when the next cycle opens.'}
        </EmptyState>
      </>
    );
  }

  const category = cycle.categories?.find(c => String(c.id) === form.category_id);
  const points = criteriaList(category?.criteria);
  const mine = nominations.filter(n => n.nominated_by === user.id);
  const isSelf = form.nominee_id === String(user.id);
  const alreadyIn = form.category_id && form.nominee_id
    && nominations.some(n => String(n.category_id) === form.category_id && String(n.nominee_id) === form.nominee_id);

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  }

  async function submit(e) {
    e.preventDefault();

    const next = {};
    if (!form.category_id) next.category_id = 'Choose a category.';
    if (!form.nominee_id) next.nominee_id = 'Choose who you are nominating.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const nominee = isSelf ? user : users.find(u => String(u.id) === form.nominee_id);
      await api.post(`/cycles/${cycle.id}/nominations`, {
        category_id: Number(form.category_id),
        nominee_id: Number(form.nominee_id),
        reason: form.reason.trim() || null,
      });
      toast.success(`${isSelf ? 'You are' : `${nominee?.name} is`} now nominated for ${category.name}.`);
      setForm(EMPTY);
      refetch();
    } catch (err) {
      toast.error(errorMessage(err, 'The nomination was not saved. Try again.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <PageHeader title="Nominate a colleague" description={`${cycle.title}. Nominate as many people as you like, in any category.`} />

        <Card as="form" onSubmit={submit} noValidate className="space-y-6">
          <Select
            label="Award category"
            value={form.category_id}
            error={errors.category_id}
            onChange={e => update('category_id', e.target.value)}
          >
            <option value="">Choose a category</option>
            {cycle.categories?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>

          {category && (category.description || points.length > 0) && (
            <div className="-mt-2 rounded-lg bg-lime-tint px-4 py-3 text-sm">
              {category.description && <p>{category.description}</p>}
              {points.length > 0 && (
                <>
                  <p className="mt-2 font-semibold text-brand-dark">Judges look for</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5">
                    {points.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </>
              )}
            </div>
          )}

          <Field
            label="Nominee"
            error={errors.nominee_id || (alreadyIn ? 'This person is already nominated in this category.' : undefined)}
            aside={
              !isSelf && (
                <button type="button" onClick={() => update('nominee_id', String(user.id))} className="text-sm font-semibold text-brand hover:underline">
                  Nominate myself
                </button>
              )
            }
          >
            {isSelf ? (
              <div className="flex items-center gap-3 rounded border border-line bg-white px-3 py-2">
                <Avatar name={user.name} size="sm" />
                <p className="flex-1 text-sm font-semibold">{user.name} <span className="font-normal text-muted">(you)</span></p>
                <button type="button" onClick={() => update('nominee_id', '')} className="text-sm font-semibold text-brand hover:underline">
                  Change
                </button>
              </div>
            ) : (
              <StaffPicker users={users} value={form.nominee_id} onChange={id => update('nominee_id', id)} error={errors.nominee_id} />
            )}
          </Field>

          <Textarea
            label="Why do they deserve it?"
            optional
            rows={4}
            maxLength={600}
            value={form.reason}
            onChange={e => update('reason', e.target.value)}
            placeholder="A specific example helps, such as a project they led or how they helped others."
            hint={`${form.reason.length} of 600 characters`}
          />

          <Button type="submit" size="lg" loading={busy} disabled={alreadyIn} className="w-full sm:w-auto">
            Submit nomination
          </Button>
        </Card>
      </div>

      <aside className="lg:pt-[104px]">
        <h2 className="text-base">Your nominations</h2>
        {mine.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Nominations you submit in this cycle will appear here.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-white">
            {mine.map(n => (
              <li key={n.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={n.nominee?.name} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{n.nominee?.name}</p>
                  <p className="truncate text-xs text-muted">{n.category?.name}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}

