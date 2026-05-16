
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', department: '',
    password: '', password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy]   = useState(false);

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/staff', { replace: true });
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(msgs ? Object.values(msgs).flat().join(' ') : (err.response?.data?.message || 'Registration failed.'));
    } finally {
      setBusy(false);
    }
  }

  const inp = 'w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#7F622C] focus:border-[#7F622C] bg-white transition-colors';

  return (
    <div className="min-h-screen bg-[#f5f3ee] flex flex-col items-center justify-center px-4 py-10">

      {/* Back to homepage */}
      <div className="w-full max-w-sm mb-4">
        <Link to="/" className="text-xs text-gray-400 hover:text-[#7F622C] transition-colors flex items-center gap-1">
          ← Back to homepage
        </Link>
      </div>

      <div className="w-full max-w-sm bg-white rounded-lg shadow-sm border border-gray-100 px-8 py-10">

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
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
            <input
              required
              className={inp}
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Jane Mwangi"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
            <input
              required
              type="email"
              className={inp}
              value={form.email}
              onChange={set('email')}
              placeholder="firstname.lastname@ksg.ac.ke"
            />
            <p className="text-xs text-gray-400 mt-1">Must be a valid @ksg.ac.ke address</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Department <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              className={inp}
              value={form.department}
              onChange={set('department')}
              placeholder="e.g. Finance & Administration"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <input
              required
              type="password"
              className={inp}
              value={form.password}
              onChange={set('password')}
              placeholder="Minimum 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
            <input
              required
              type="password"
              className={inp}
              value={form.password_confirmation}
              onChange={set('password_confirmation')}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-[#7F622C] text-white py-2.5 rounded text-sm font-semibold hover:bg-[#5c4620] disabled:opacity-50 transition-colors mt-2"
          >
            {busy ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-[#7F622C] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <p className="text-xs text-gray-400 mt-6">
        &copy; {new Date().getFullYear()} Kenya School of Government
      </p>
    </div>
  );
}