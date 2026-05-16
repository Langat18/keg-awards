
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
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton />;

  async function toggle(userId) {
    setBusy(b => ({ ...b, [userId]: true }));
    try {
      const { data } = await api.patch(`/admin/users/${userId}/toggle`);
      setUsers(u => u.map(x => x.id === userId ? { ...x, is_active: data.is_active } : x));
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally {
      setBusy(b => ({ ...b, [userId]: false }));
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

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-gray-900">Staff Accounts</h2>
        <p className="text-gray-500 text-sm mt-1">
          {users.length} registered user{users.length !== 1 ? 's' : ''}
        </p>
      </div>

      <input
        type="text"
        placeholder="Search by name, email or department…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#7F622C] focus:border-[#7F622C] bg-white mb-4"
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#7F622C] text-white text-left">
              <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wide">Name</th>
              <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wide">Email</th>
              <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wide hidden md:table-cell">Department</th>
              <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wide">Role</th>
              <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wide">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 text-sm py-10">
                  No users match your search.
                </td>
              </tr>
            )}
            {filtered.map(u => (
              <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${!u.is_active ? 'opacity-50' : ''}`}>
                <td className="px-5 py-3.5 font-semibold text-gray-800">{u.name}</td>
                <td className="px-5 py-3.5 text-gray-500 text-xs">{u.email}</td>
                <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">{u.department || '—'}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    u.role === 'admin'
                      ? 'bg-[#CBD300]/20 text-[#5c4620]'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`flex items-center gap-1.5 text-xs font-semibold ${
                    u.is_active ? 'text-green-600' : 'text-red-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-400'}`} />
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  {u.role !== 'admin' && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggle(u.id)}
                        disabled={busy[u.id]}
                        className={`text-xs font-medium px-3 py-1.5 rounded border transition-colors disabled:opacity-50 ${
                          u.is_active
                            ? 'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500'
                            : 'border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600'
                        }`}
                      >
                        {busy[u.id] ? '…' : u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      {!u.is_active && (
                        <button
                          onClick={() => destroy(u.id)}
                          disabled={busy[u.id]}
                          className="text-xs font-medium px-3 py-1.5 rounded border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}