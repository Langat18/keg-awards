import { useEffect, useRef, useState } from 'react';
import { criteriaList } from '../../lib/format';
import Button from '../../components/Button';
import Dialog from '../../components/Dialog';
import Icon from '../../components/Icon';
import Input, { Field } from '../../components/Input';

function blank(category) {
  const points = criteriaList(category?.criteria);
  return {
    name: category?.name || '',
    description: category?.description || '',
    sort_order: category?.sort_order ?? '',
    points: points.length ? points : [''],
  };
}

export default function CategoryDialog({ open, category, onClose, onSave }) {
  const [form, setForm] = useState(blank(category));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const pointRefs = useRef([]);
  const focusIndex = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(blank(category));
      setErrors({});
    }
  }, [open, category]);

  useEffect(() => {
    if (focusIndex.current !== null) {
      pointRefs.current[focusIndex.current]?.focus();
      focusIndex.current = null;
    }
  });

  function setPoint(index, value) {
    setForm(f => ({ ...f, points: f.points.map((p, i) => (i === index ? value : p)) }));
  }

  function insertPoint(after) {
    focusIndex.current = after + 1;
    setForm(f => {
      const points = [...f.points];
      points.splice(after + 1, 0, '');
      return { ...f, points };
    });
  }

  function removePoint(index) {
    focusIndex.current = Math.max(index - 1, 0);
    setForm(f => {
      const points = f.points.filter((_, i) => i !== index);
      return { ...f, points: points.length ? points : [''] };
    });
  }

  function onPointKey(e, index) {
    if (e.key === 'Enter') {
      e.preventDefault();
      insertPoint(index);
    } else if (e.key === 'Backspace' && e.currentTarget.value === '' && form.points.length > 1) {
      e.preventDefault();
      removePoint(index);
    }
  }

  async function submit(e) {
    e?.preventDefault();
    setBusy(true);
    try {
      await onSave({
        name: form.name.trim(),
        description: form.description.trim() || null,
        criteria: form.points.map(p => p.trim()).filter(Boolean).join('\n') || null,
        sort_order: form.sort_order === '' ? null : Number(form.sort_order),
      });
    } catch (err) {
      setErrors(err.fields || {});
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      size="lg"
      title={category ? 'Edit category' : 'Add a category'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={busy} disabled={!form.name.trim()}>
            {category ? 'Save category' : 'Add category'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="mt-4 space-y-5 text-brand-ink">
        <div className="grid gap-5 sm:grid-cols-[1fr_120px]">
          <Input
            label="Category name"
            required
            placeholder="e.g. Employee of the Year"
            value={form.name}
            error={errors.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Order"
            type="number"
            min="0"
            optional
            placeholder="0"
            value={form.sort_order}
            error={errors.sort_order}
            onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))}
          />
        </div>

        <Input
          label="Short description"
          optional
          placeholder="What this award recognises"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />

        <Field label="Judging criteria" optional aside={<span className="text-xs text-muted">Enter adds a new line</span>}>
          <div className="space-y-2">
            {form.points.map((point, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime-dark" />
                <input
                  ref={el => (pointRefs.current[i] = el)}
                  value={point}
                  onChange={e => setPoint(i, e.target.value)}
                  onKeyDown={e => onPointKey(e, i)}
                  placeholder={i === 0 ? 'e.g. Shows leadership across teams' : 'Another criterion'}
                  className="field"
                  aria-label={`Criterion ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removePoint(i)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded text-muted hover:bg-canvas hover:text-red-700"
                  aria-label={`Remove criterion ${i + 1}`}
                >
                  <Icon name="close" className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" icon="plus" className="mt-2" onClick={() => insertPoint(form.points.length - 1)}>
            Add criterion
          </Button>
        </Field>
      </form>
    </Dialog>
  );
}
