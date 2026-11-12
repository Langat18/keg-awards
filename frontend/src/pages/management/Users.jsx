import { useEffect, useMemo, useState } from 'react';
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

const FILTERS = [
  { key: 'all', label: 'Everyone', test: () => true },
  { key: 'active', label: 'Active', test: u => u.is_active },
  { key: 'inactive', label: 'Deactivated', test: u => !u.is_active },
  { key: 'results', label: 'Results access', test: u => u.role === 'admin' || u.can_view_results },
];

function Switch({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${checked ? 'bg-brand' : 'bg-line'}`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  );
}

export default function ManageUsers() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/admin/users')
      .then(({ data }) => setUsers(data))
      .catch(err => toast.error(errorMessage(err, 'Staff accounts could not be loaded.')))
      .finally(() => setLoading(false));
  }, [toast]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const test = FILTERS.find(f => f.key === filter).test;
    return users.filter(u =>
      test(u) &&
      (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.department || '').toLowerCase().includes(q))
    );
  }, [users, search, filter]);

  if (loading) return <PageSkeleton />;

  function patch(id, changes) {
    setUsers(list => list.map(u => (u.id === id ? { ...u, ...changes } : u)));
  }

  async function withBusy(id, fn) {
    setBusy(b => ({ ...b, [id]: true }));
    try {
      await fn();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(b => ({ ...b, [id]: false }));
    }
  }

  function toggleResults(user) {
    withBusy(user.id, async () => {
      const { data } = await api.patch(`/admin/users/${user.id}/toggle-results`);
      patch(user.id, { can_view_results: data.can_view_results });
      toast.success(data.can_view_results ? `${user.name} can now see results.` : `${user.name} can no longer see results.`);
    });
  }

  async function toggleActive(user) {
    if (user.is_active) {
      const ok = await confirm({
        title: `Deactivate ${user.name}?`,
        message: 'They will be signed out immediately and will not be able to sign in. Their past nominations and votes are kept.',
        confirmLabel: 'Deactivate',
        danger: true,
      });
      if (!ok) return;
    }

    withBusy(user.id, async () => {
      const { data } = await api.patch(`/admin/users/${user.id}/toggle`);
      patch(user.id, { is_active: data.is_active });
      toast.success(data.is_active ? `${user.name} was reactivated.` : `${user.name} was deactivated.`);
    });
  }

  async function remove(user) {
    const ok = await confirm({
      title: `Delete ${user.name}?`,
      message: 'The account is removed permanently. Accounts with nominations or votes on record can only be deactivated.',
      confirmLabel: 'Delete account',
      danger: true,
    });
    if (!ok) return;

    withBusy(user.id, async () => {
      await api.delete(`/admin/users/${user.id}`);
      setUsers(list => list.filter(u => u.id !== user.id));
      toast.success(`${user.name} was deleted.`);
    });
  }

  const counts = Object.fromEntries(FILTERS.map(f => [f.key, users.filter(f.test).length]));

  return (
    <div>
      <PageHeader title="Staff accounts" description="Control who can sign in and who can see the full results." />

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
            placeholder="Search name, email or department"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="field pl-9"
            aria-label="Search staff"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon="users" title={search ? 'No one matches your search' : 'No accounts in this list'} compact />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="hidden border-b border-line bg-canvas/60 text-xs font-semibold text-muted md:table-header-group">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Sees results</th>
                <th className="px-5 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map(u => {
                const admin = u.role === 'admin';
                return (
                  <tr key={u.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4 md:table-row md:p-0">
                    <td className="flex min-w-0 flex-1 basis-full items-center gap-3 md:table-cell md:px-5 md:py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} className={u.is_active ? '' : 'opacity-50'} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {u.name}
                            {admin && <Badge tone="done" className="ml-2 align-middle">Admin</Badge>}
                          </p>
                          <p className="truncate text-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden text-muted md:table-cell md:px-5">{u.department || '-'}</td>
                    <td className="md:table-cell md:px-5">
                      {u.is_active ? <Badge tone="good" dot>Active</Badge> : <Badge tone="bad" dot>Deactivated</Badge>}
                    </td>
                    <td className="flex items-center gap-2 md:table-cell md:px-5">
                      {admin ? (
                        <span className="text-muted">Always</span>
                      ) : (
                        <>
                          <Switch checked={u.can_view_results} onChange={() => toggleResults(u)} disabled={busy[u.id]} label={`Results access for ${u.name}`} />
                          <span className="text-muted md:hidden">Sees results</span>
                        </>
                      )}
                    </td>
                    <td className="ml-auto md:table-cell md:px-5 md:text-right">
                      {!admin && (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="secondary" onClick={() => toggleActive(u)} disabled={busy[u.id]}>
                            {u.is_active ? 'Deactivate' : 'Reactivate'}
                          </Button>
                          {!u.is_active && (
                            <Button size="sm" variant="danger-outline" onClick={() => remove(u)} disabled={busy[u.id]}>Delete</Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-right text-sm text-muted">Showing {visible.length} of {plural(users.length, 'account')}</p>
    </div>
  );
}
