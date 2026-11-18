import { useEffect, useRef, useState } from 'react';
import { downloadTemplate, readStaffFile } from '../../lib/staffFile';
import { errorMessage, plural } from '../../lib/format';
import { useToast } from '../../components/Toast';
import api from '../../api/axios';
import Button from '../../components/Button';
import Dialog from '../../components/Dialog';
import Icon from '../../components/Icon';

const SHOW = 50;

function Section({ title, tone = 'neutral', count, note, children }) {
  const [open, setOpen] = useState(tone !== 'neutral');
  if (!count) return null;

  const tones = {
    neutral: 'text-brand-ink',
    warn: 'text-amber-800',
    bad: 'text-red-700',
  };

  return (
    <section className="border-t border-line py-3 first:border-t-0">
      <button type="button" onClick={() => setOpen(o => !o)} className="flex w-full items-center justify-between gap-3 text-left" aria-expanded={open}>
        <span className={`font-semibold ${tones[tone]}`}>{title} <span className="tabular font-normal text-muted">{count}</span></span>
        <Icon name={open ? 'chevronDown' : 'chevronRight'} className="h-4 w-4 text-muted" />
      </button>
      {open && (
        <div className="mt-2">
          {note && <p className="mb-2 text-xs text-muted">{note}</p>}
          <ul className="space-y-1.5">{children}</ul>
        </div>
      )}
    </section>
  );
}

function who(row) {
  return [row.department, row.email, row.pf_number].filter(Boolean).join(', ');
}

function Line({ row, children }) {
  return (
    <li className="flex gap-3 text-brand-ink">
      {row.line !== undefined && <span className="tabular w-10 shrink-0 text-right text-xs text-muted">{row.line}</span>}
      <div className="min-w-0">
        <p className="font-semibold">{row.name || <span className="text-muted">No name</span>}</p>
        {children}
      </div>
    </li>
  );
}

export default function ImportDialog({ open, onClose, onImported }) {
  const { toast } = useToast();
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState(null);
  const [markLeft, setMarkLeft] = useState(false);
  const [preview, setPreview] = useState(null);
  const [include, setInclude] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) return;
    setFile(null);
    setRows(null);
    setPreview(null);
    setInclude({});
    setMarkLeft(false);
    setError('');
  }, [open]);

  async function choose(e) {
    const picked = e.target.files?.[0];
    e.target.value = '';
    if (!picked) return;

    setError('');
    setFile(picked);
    setRows(null);
    try {
      const parsed = await readStaffFile(picked);
      if (!parsed.length) throw new Error('The file has no people in it below the header row.');
      setRows(parsed);
    } catch (err) {
      setError(err.message || 'The file could not be read.');
    }
  }

  async function review() {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/admin/staff/preview', { rows, mark_missing_as_left: markLeft });
      setPreview(data);
      setInclude({});
    } catch (err) {
      setError(errorMessage(err, 'The file could not be checked.'));
    } finally {
      setBusy(false);
    }
  }

  async function apply() {
    setBusy(true);
    try {
      const includeLines = Object.keys(include).filter(k => include[k]).map(Number);
      const { data } = await api.post('/admin/staff/import', { rows, mark_missing_as_left: markLeft, include_lines: includeLines });
      const parts = [
        data.added && `${data.added} added`,
        data.updated && `${data.updated} updated`,
        data.left && `${data.left} marked as left`,
      ].filter(Boolean);
      toast.success(parts.length ? `Staff list updated: ${parts.join(', ')}.` : 'Nothing needed changing.');
      onImported();
    } catch (err) {
      toast.error(errorMessage(err, 'The import did not complete. Nothing was changed.'));
    } finally {
      setBusy(false);
    }
  }

  const byAction = action => preview?.rows.filter(r => r.action === action) ?? [];
  const flagged = byAction('flagged');
  const chosenFlagged = flagged.filter(r => include[r.line]).length;
  const changes = preview ? preview.counts.new + preview.counts.update + preview.counts.leaving + chosenFlagged : 0;

  return (
    <Dialog
      open={open}
      title={preview ? 'Check the changes' : 'Import the staff list'}
      onClose={onClose}
      size="lg"
      footer={preview ? (
        <>
          <Button variant="secondary" onClick={() => setPreview(null)} disabled={busy}>Back</Button>
          <Button onClick={apply} loading={busy} disabled={!changes}>
            {changes ? `Apply ${plural(changes, 'change')}` : 'Nothing to change'}
          </Button>
        </>
      ) : (
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={review} loading={busy} disabled={!rows?.length}>Check file</Button>
        </>
      )}
    >
      {!preview ? (
        <div className="space-y-4">
          <p>
            Use one row per person with the columns <strong className="text-brand-ink">Name</strong>, Department, Email and PF number.
            Only the name is required. People already on the list are matched by email or PF number and updated, so you can import a fresh list from HR at any time.
          </p>

          <button type="button" onClick={downloadTemplate} className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline">
            <Icon name="download" className="h-4 w-4" /> Download the template
          </button>

          <div className="rounded-lg border border-dashed border-brand/30 bg-canvas p-4">
            <input ref={fileRef} type="file" accept=".xlsx,.csv" className="sr-only" onChange={choose} aria-label="Staff list file" />
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" icon="upload" onClick={() => fileRef.current?.click()}>
                {file ? 'Choose another file' : 'Choose a file'}
              </Button>
              <span className="min-w-0 text-brand-ink">
                {file ? (
                  <>
                    <span className="font-semibold">{file.name}</span>
                    {rows && <span className="text-muted">, {plural(rows.length, 'person', 'people')}</span>}
                  </>
                ) : (
                  <span className="text-muted">Excel (.xlsx) or CSV</span>
                )}
              </span>
            </div>
          </div>

          <label className="flex items-start gap-3 text-brand-ink">
            <input type="checkbox" checked={markLeft} onChange={e => setMarkLeft(e.target.checked)} className="mt-1 h-4 w-4 accent-brand" />
            <span>
              <span className="font-semibold">This file is the complete staff list</span>
              <span className="block text-muted">Anyone on the current list but missing from the file is marked as having left, and their account is deactivated.</span>
            </span>
          </label>

          {error && (
            <p role="alert" className="flex items-start gap-2 rounded border border-red-200 bg-red-50 px-3 py-2.5 text-red-800">
              <Icon name="alert" className="mt-0.5 h-4 w-4" /> {error}
            </p>
          )}
        </div>
      ) : (
        <div className="max-h-[55vh] overflow-y-auto pr-1">
          <dl className="mb-3 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line text-center sm:grid-cols-6">
            {[
              ['New', preview.counts.new],
              ['Updated', preview.counts.update],
              ['Unchanged', preview.counts.unchanged],
              ['To check', preview.counts.flagged],
              ['Errors', preview.counts.error],
              ['Leaving', preview.counts.leaving],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col-reverse bg-white px-2 py-2.5">
                <dt className="text-xs">{label}</dt>
                <dd className="tabular font-serif text-xl font-bold text-brand">{value}</dd>
              </div>
            ))}
          </dl>

          <Section title="Rows with errors" tone="bad" count={preview.counts.error} note="These rows are skipped. Fix them in the file and import again.">
            {byAction('error').map(r => (
              <Line key={r.line} row={r}><p className="text-red-700">{r.message}</p></Line>
            ))}
          </Section>

          <Section title="Possible duplicates" tone="warn" count={flagged.length} note="Tick anyone who is a different person and should be added. Unticked rows are skipped.">
            {flagged.map(r => (
              <li key={r.line} className="flex gap-3 text-brand-ink">
                <span className="tabular w-10 shrink-0 text-right text-xs text-muted">{r.line}</span>
                <label className="flex min-w-0 items-start gap-2.5">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-brand"
                    checked={Boolean(include[r.line])}
                    onChange={e => setInclude(inc => ({ ...inc, [r.line]: e.target.checked }))}
                  />
                  <span className="min-w-0">
                    <span className="block font-semibold">Add {r.name}</span>
                    <span className="block text-muted">{r.message}</span>
                  </span>
                </label>
              </li>
            ))}
          </Section>

          <Section title="Leaving" tone="warn" count={preview.counts.leaving} note="Not in the file, so they will be marked as having left.">
            {preview.leaving.slice(0, SHOW).map(p => (
              <Line key={p.staff_id} row={p}>
                <p className="text-muted">{[p.department, p.registered ? 'account will be deactivated' : 'not registered'].filter(Boolean).join(', ')}</p>
              </Line>
            ))}
          </Section>

          <Section title="New people" count={preview.counts.new}>
            {byAction('new').slice(0, SHOW).map(r => (
              <Line key={r.line} row={r}><p className="text-muted">{who(r) || 'No department, email or PF number'}</p></Line>
            ))}
            {preview.counts.new > SHOW && <li className="text-muted">and {preview.counts.new - SHOW} more</li>}
          </Section>

          <Section title="Updates" count={preview.counts.update}>
            {byAction('update').slice(0, SHOW).map(r => (
              <Line key={r.line} row={r}>
                {r.returning && <p className="text-emerald-700">Back on staff</p>}
                {r.changes.map(c => (
                  <p key={c.field} className="text-muted">
                    {c.field}: <span className="line-through">{c.from || 'blank'}</span> <Icon name="chevronRight" className="inline h-3 w-3" /> <span className="text-brand-ink">{c.to}</span>
                  </p>
                ))}
              </Line>
            ))}
            {preview.counts.update > SHOW && <li className="text-muted">and {preview.counts.update - SHOW} more</li>}
          </Section>
        </div>
      )}
    </Dialog>
  );
}
