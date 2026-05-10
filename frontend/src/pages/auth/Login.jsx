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

  const inp = 'w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7F622C]/30 focus:border-[#7F622C] bg-white transition-colors placeholder-gray-400';

  return (
    <div className="min-h-screen flex">

      {/* Left — brand panel */}
      <div className="hidden lg:flex w-5/12 bg-[#7F622C] flex-col p-12">
        <img src="/ksg-logo.png" alt="KSG" className="h-11 w-auto brightness-0 invert mb-auto" />
        <div className="mb-auto">
          <h2 className="text-white text-4xl font-black leading-tight mb-4">
            Empowering<br />the Public<br />Service.
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            The KSG Staff Recognition System celebrates excellence and outstanding contribution across all campuses.
          </p>
        </div>
        <div className="h-1 w-12 bg-[#CBD300] rounded-full" />
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col bg-[#f7f6f3]">

        {/* Mobile header */}
        <div className="lg:hidden px-6 py-5 bg-[#7F622C]">
          <img src="/ksg-logo.png" alt="KSG" className="h-9 w-auto brightness-0 invert" />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
              <p className="text-gray-400 text-sm mb-7">Sign in with your KSG email address</p>

              {error && (
                <div className="mb-5 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="firstname.lastname@ksg.ac.ke"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className={inp}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
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
                  className="w-full bg-[#7F622C] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#5c4620] disabled:opacity-50 transition-colors"
                >
                  {busy ? 'Signing in…' : 'Log In'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-6">
                No account?{' '}
                <Link to="/register" className="text-[#7F622C] font-semibold hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>

            <p className="text-center text-xs text-gray-400 mt-5">
              &copy; {new Date().getFullYear()} Kenya School of Government
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}