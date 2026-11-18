import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/Dialog';
import { errorMessage, plural } from '../../lib/format';
import { PageSkeleton } from '../../components/Skeleton';
import api from '../../api/axios';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Icon from '../../components/Icon';
import PageHeader from '../../components/PageHeader';
import CredentialsDialog from './CredentialsDialog';
import ImportDialog from './ImportDialog';
import StaffDialog from './StaffDialog';

const FILTERS = [
  { key: 'all', label: 'Everyone', test: p => p.status !== 'left' },
  { key: 'pending', label: 'Not registered', test: p => p.status === 'pending' },
  { key: 'registered', label: 'Registered', test: p => p.status === 'registered' },
  { key: 'no-email', label: 'No email', test: p => p.status !== 'left' && !p.email },
  { key: 'left', label: 'Left', test: p => p.status === 'left' },
];

function Status({ person }) {
  if (person.status === 'left') return <Badge tone="bad" dot>Left</Badge>;
  if (person.status === 'pending') return <Badge dot>Not registered</Badge>;
  if (person.account?.must_change_password) return <Badge tone="live" dot>Awaiting first sign-in</Badge>;
  return <Badge tone="good" dot>Registered</Badge>;
}

export default function ManageStaff() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [importing, setImporting] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    return api.get('/admin/staff')
      .then(({ data }) => setPeople(data))
      .catch(err => toast.error(errorMessage(err, 'The staff list could not be loaded.')))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const test = FILTERS.find(f => f.key === filter).test;
    return people.filter(p =>
      test(p) &&
      (!q || [p.name, p.email, p.department, p.pf_number, p.login_id].some(v => (v || '').toLowerCase().includes(q)))
    );
  }, [people, search, filter]);

  if (loading) return <PageSkeleton />;

  const counts = Object.fromEntries(FILTERS.map(f => [f.key, people.filter(f.test).length]));
  const withoutEmail = people.filter(p => p.status === 'pending' && !p.email);

  async function createAccounts(list) {
    if (list.length > 1) {
      const ok = await confirm({
        title: `Create ${plural(list.length, 'account')}?`,
        message: 'Each person gets a sign-in ID and a temporary password, which you can print as slips or download as a sheet.',
        confirmLabel: 'Create accounts',
      });
      if (!ok) return;
    }

    setBusy(true);
    try {
      const { data } = await api.post('/admin/staff/accounts', { ids: list.map(p => p.id) });
      setCredentials(data.credentials);
      await load();
    } catch (err) {
      toast.error(errorMessage(err, 'The accounts could not be created.'));
    } finally {
      setBusy(false);
    }
  }

  function saved(person) {
    setPeople(list => {
      const exists = list.some(p => p.id === person.id);
      const next = exists ? list.map(p => (p.id === person.id ? person : p)) : [...list, person];
      return next.sort((a, b) => a.name.localeCompare(b.name));
    });
    setEditing(null);
  }

  return (
    <div>
      <PageHeader
        title="Staff list"
        description="Everyone who can take part. Staff with an email on this list can register themselves. Create accounts for anyone without one."
        actions={
          <>
            <Button variant="secondary" icon="userPlus" onClick={() => setEditing('new')}>Add person</Button>
            <Button icon="upload" onClick={() => setImporting(true)}>Import list</Button>
          </>
        }
      />

      {withoutEmail.length > 0 && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-lime-dark/40 bg-lime-tint px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2.5">
            <Icon name="key" className="mt-0.5 h-5 w-5 text-brand" />
            <span>
              <span className="font-semibold">{plural(withoutEmail.length, 'person has', 'people have')} no email</span>
              <span className="block text-sm text-muted">They cannot register themselves. Create their accounts and hand out the sign-in slips.</span>
            </span>
          </p>
          <Button variant="primary" onClick={() => createAccounts(withoutEmail)} loading={busy}>
            Create {plural(withoutEmail.length, 'account')}
          </Button>
        </div>
      )}

      {people.length === 0 ? (
        <EmptyState
          icon="users"
          title="The staff list is empty"
          action={<Button icon="upload" onClick={() => setImporting(true)}>Import list</Button>}
        >
          Import the list from HR, or add people one at a time.
        </EmptyState>
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  role="tab"
                  aria-selected={filter === f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                    filter === f.key ? 'bg-brand text-white' : 'text-muted hover:bg-white hover:text-brand-ink'
                  }`}
                >
                  {f.label}
                  <span className={`tabular text-xs ${filter === f.key ? 'text-white/70' : 'text-muted'}`}>{counts[f.key]}</span>
                </button>
              ))}
            </div>
            <div className="relative lg:w-80">
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                placeholder="Search name, email, PF or sign-in ID"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="field pl-9"
                aria-label="Search the staff list"
              />
            </div>
          </div>

          {visible.length === 0 ? (
            <EmptyState icon="users" title={search ? 'No one matches your search' : 'No one in this list'} compact />
          ) : (
            <div className="overflow-hidden rounded-xl border border-line bg-white">
              <table className="w-full text-left text-sm">
                <thead className="hidden border-b border-line bg-canvas/60 text-xs font-semibold text-muted md:table-header-group">
                  <tr>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Department</th>
                    <th className="px-5 py-3">Sign-in ID</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {visible.map(p => (
                    <tr key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 md:table-row md:p-0">
                      <td className="flex min-w-0 basis-full items-center gap-3 md:table-cell md:px-5 md:py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={p.name} className={p.status === 'left' ? 'opacity-50' : ''} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{p.name}</p>
                            <p className="truncate text-muted">
                              {p.email || <span className="italic">No email</span>}
                              {p.pf_number && <span>, PF {p.pf_number}</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden text-muted md:table-cell md:px-5">{p.department || '-'}</td>
                      <td className="text-muted md:table-cell md:px-5">
                        {p.login_id ? (
                          <span className="whitespace-nowrap font-mono text-brand-ink">{p.login_id}</span>
                        ) : (
                          <span className="md:hidden">Not registered yet</span>
                        )}
                      </td>
                      <td className="md:table-cell md:px-5"><Status person={p} /></td>
                      <td className="ml-auto md:table-cell md:px-5 md:text-right">
                        <div className="flex justify-end gap-2">
                          {p.status === 'pending' && (
                            <Button size="sm" variant="secondary" icon="key" onClick={() => createAccounts([p])} disabled={busy}>
                              Create account
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" icon="edit" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`}>
                            <span className="sr-only md:not-sr-only">Edit</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-3 text-right text-sm text-muted">
            Showing {visible.length} of {plural(people.length, 'person', 'people')}
          </p>
        </>
      )}

      <StaffDialog
        open={Boolean(editing)}
        person={editing === 'new' ? null : editing}
        onClose={() => setEditing(null)}
        onSaved={saved}
        onRemoved={person => {
          setPeople(list => list.filter(p => p.id !== person.id));
          setEditing(null);
        }}
      />

      <ImportDialog
        open={importing}
        onClose={() => setImporting(false)}
        onImported={() => {
          setImporting(false);
          load();
        }}
      />

      <CredentialsDialog
        credentials={credentials}
        title={credentials?.length === 1 ? `Account created for ${credentials[0].name}` : `${plural(credentials?.length ?? 0, 'account')} created`}
        onClose={() => setCredentials(null)}
      />
    </div>
  );
}
