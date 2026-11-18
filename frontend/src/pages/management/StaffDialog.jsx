import { useEffect, useState } from 'react';
import { errorMessage, fieldErrors } from '../../lib/format';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/Dialog';
import api from '../../api/axios';
import Button from '../../components/Button';
import Dialog from '../../components/Dialog';
import Input from '../../components/Input';

const EMPTY = { name: '', department: '', email: '', pf_number: '' };

export default function StaffDialog({ open, person, onClose, onSaved, onRemoved }) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(person ? {
      name: person.name,
      department: person.department || '',
      email: person.email || '',
      pf_number: person.pf_number || '',
    } : EMPTY);
  }, [open, person]);

  const bind = field => ({
    value: form[field],
    error: errors[field],
    onChange: e => {
      setForm(f => ({ ...f, [field]: e.target.value }));
      setErrors(er => ({ ...er, [field]: undefined }));
    },
  });

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = person
        ? await api.put(`/admin/staff/${person.id}`, form)
        : await api.post('/admin/staff', form);
      toast.success(person ? 'Changes saved.' : `${data.name} was added to the staff list.`);
      onSaved(data);
    } catch (err) {
      const fields = fieldErrors(err);
      setErrors(fields);
      if (!Object.keys(fields).length) toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function toggleLeft() {
    const leaving = person.status !== 'left';
    if (leaving) {
      const ok = await confirm({
        title: `Mark ${person.name} as having left?`,
        message: person.account
          ? 'Their account is deactivated and they are signed out. Past nominations and votes are kept.'
          : 'They will not be able to register.',
        confirmLabel: 'Mark as left',
        danger: true,
      });
      if (!ok) return;
    }

    setBusy(true);
    try {
      const { data } = await api.patch(`/admin/staff/${person.id}/left`);
      toast.success(leaving ? `${person.name} is marked as having left.` : `${person.name} is back on the staff list.`);
      onSaved(data);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    const ok = await confirm({
      title: `Remove ${person.name}?`,
      message: 'Use this for entries added by mistake. To record that someone left, mark them as having left instead.',
      confirmLabel: 'Remove',
      danger: true,
    });
    if (!ok) return;

    setBusy(true);
    try {
      await api.delete(`/admin/staff/${person.id}`);
      toast.success(`${person.name} was removed from the staff list.`);
      onRemoved(person);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} title={person ? `Edit ${person.name}` : 'Add a person'} onClose={onClose}>
      <form id="staff-form" onSubmit={save} className="mt-4 space-y-4 text-brand-ink" noValidate>
        <Input label="Full name" required {...bind('name')} />
        <Input label="Department" optional {...bind('department')} />
        <Input
          label="Email"
          type="email"
          optional
          hint="Any address they use: KSG or personal. Leave blank if they have none."
          {...bind('email')}
        />
        <Input label="PF number" optional {...bind('pf_number')} />
      </form>

      {person && (
        <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-4">
          <Button size="sm" variant="secondary" onClick={toggleLeft} disabled={busy}>
            {person.status === 'left' ? 'Back on staff' : 'Mark as left'}
          </Button>
          {!person.account && (
            <Button size="sm" variant="danger-outline" icon="trash" onClick={remove} disabled={busy}>Remove from list</Button>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" form="staff-form" loading={busy}>{person ? 'Save changes' : 'Add person'}</Button>
      </div>
    </Dialog>
  );
}
