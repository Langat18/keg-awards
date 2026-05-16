
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/management' : '/staff', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setBusy(false);
    }
  }

  const inp = 'w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#7F622C] focus:border-[#7F622C] bg-white transition-colors';

  return (
    <div className="min-h-screen bg-[#f5f3ee] flex flex-col items-center justify-center px-4">

      <div className="w-full max-w-sm mb-4">
        <Link to="/" className="text-xs text-gray-400 hover:text-[#7F622C] transition-colors flex items-center gap-1">
          ← Back to homepage
        </Link>
      </div>

      <div className="w-full max-w-sm bg-white rounded-lg shadow-sm border border-gray-100 px-8 py-10">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/ksg-logo.png" alt="Kenya School of Government" className="h-16 w-auto" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-lg font-bold text-[#7F622C]">Kenya School of Government</h1>
          <p className="text-sm text-gray-500 mt-0.5">Staff Rewards & Recognition System</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className={inp}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className={inp}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-[#7F622C] text-white py-2.5 rounded text-sm font-semibold hover:bg-[#5c4620] disabled:opacity-50 transition-colors mt-2"
          >
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          No account?{' '}
          <Link to="/register" className="text-[#7F622C] font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>

      <p className="text-xs text-gray-400 mt-6">
        &copy; {new Date().getFullYear()} Kenya School of Government
      </p>
    </div>
  );
}