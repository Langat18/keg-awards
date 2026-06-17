import { useEffect, useState } from 'react';
import { useToast } from '../../components/Toast';
import { PageSkeleton } from '../../components/Skeleton';
import api from '../../api/axios';

export default function ManageUsers() {
  const { toast }             = useToast();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]       = useState({});
  const [search, setSearch]   = useState('');

  useEffect(() => {
    api.get('/admin/users')
      .then(r => setUsers(r.data))
      .catch(() => toast.error('Failed to load users.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton />;

  async function toggleActive(userId) {
    setBusy(b => ({ ...b, [userId]: true }));
    try {
      const { data } = await api.patch(`/admin/users/${userId}/toggle`);
      setUsers(u => u.map(x => x.id === data.id ? { ...x, is_active: data.is_active } : x));
      toast.success(data.is_active ? 'User activated.' : 'User deactivated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setBusy(b => ({ ...b, [userId]: false }));
    }
  }

  async function toggleResults(userId) {
    setBusy(b => ({ ...b, [`r_${userId}`]: true }));
    try {
      const { data } = await api.patch(`/admin/users/${userId}/toggle-results`);
      setUsers(u => u.map(x => x.id === data.id ? { ...x, can_view_results: data.can_view_results } : x));
      toast.success(data.can_view_results ? 'Results access granted.' : 'Results access revoked.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update results access.');
    } finally {
      setBusy(b => ({ ...b, [`r_${userId}`]: false }));
    }
  }

  async function destroy(userId) {
    if (!confirm('Permanently delete this user? This cannot be undone.')) return;
    setBusy(b => ({ ...b, [userId]: true }));
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(u => u.filter(x => x.id !== userId));
      toast.success('User deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setBusy(b => ({ ...b, [userId]: false }));
    }
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.department || '').toLowerCase().includes(search.toLowerCase())
  );

  const activeCount  = users.filter(u => u.is_active).length;
  const resultsCount = users.filter(u => u.can_view_results).length;

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#7F622C] uppercase tracking-widest mb-1">Administration</p>
          <h2 className="text-2xl font-bold text-gray-900">Staff Accounts</h2>
          <p className="text-gray-400 text-sm mt-1">Manage user access and results visibility.</p>
        </div>
        <div className="flex gap-6 text-right shrink-0">
          <div>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            <p className="text-xs text-gray-400">total users</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
            <p className="text-xs text-gray-400">active</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#7F622C]">{resultsCount}</p>
            <p className="text-xs text-gray-400">results access</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
        </svg>
        <input
          type="text"
          placeholder="Search by name, email or department…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7F622C]/20 focus:border-[#7F622C] bg-white transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/></svg>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#7F622C] text-white text-left">
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Name</th>
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">Email</th>
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Department</th>
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Role</th>
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Status</th>
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">Results Access</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-14">
                  <p className="text-gray-300 text-sm">{search ? 'No users match your search.' : 'No users registered yet.'}</p>
                </td>
              </tr>
            )}

            {filtered.map(u => {
              const isAdmin = u.role === 'admin';
              return (
                <tr key={u.id} className={`transition-colors hover:bg-gray-50/80 ${!u.is_active ? 'opacity-60' : ''}`}>

                  {/* Name */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#7F622C]/10 text-[#7F622C] text-xs font-bold flex items-center justify-center shrink-0">
                        {u.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-800">{u.name}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-5 py-4 text-gray-400 text-xs hidden sm:table-cell">{u.email}</td>

                  {/* Department */}
                  <td className="px-5 py-4 text-gray-500 text-xs hidden md:table-cell">{u.department || '—'}</td>

                  {/* Role */}
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                      isAdmin
                        ? 'bg-[#CBD300]/20 text-[#5c4620]'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {u.role}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                      u.is_active ? 'text-emerald-600' : 'text-red-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-red-400'}`} />
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Results Access */}
                  <td className="px-5 py-4 hidden lg:table-cell">
                    {isAdmin ? (
                      <span className="text-xs text-gray-300 font-medium">Always on</span>
                    ) : (
                      <button
                        onClick={() => toggleResults(u.id)}
                        disabled={busy[`r_${u.id}`]}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors disabled:opacity-50 ${
                          u.can_view_results
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                        }`}
                      >
                        {busy[`r_${u.id}`] ? '…' : (
                          <>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.can_view_results ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                            {u.can_view_results ? 'Granted' : 'Restricted'}
                          </>
                        )}
                      </button>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    {!isAdmin && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleActive(u.id)}
                          disabled={busy[u.id]}
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                            u.is_active
                              ? 'border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500 hover:bg-red-50'
                              : 'border-gray-200 text-gray-500 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {busy[u.id] ? '…' : u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        {!u.is_active && (
                          <button
                            onClick={() => destroy(u.id)}
                            disabled={busy[u.id]}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            Delete
                          </button>
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

      {filtered.length > 0 && (
        <p className="text-xs text-gray-300 mt-3 text-right">
          Showing {filtered.length} of {users.length} user{users.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}