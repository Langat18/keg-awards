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

  const inp = 'w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7F622C]/30 focus:border-[#7F622C] bg-white transition-colors placeholder-gray-400';

  return (
    <div className="min-h-screen flex">

      {/* Left — brand panel */}
      <div className="hidden lg:flex w-5/12 bg-[#7F622C] flex-col p-12">
        <img src="/ksg-logo.png" alt="KSG" className="h-11 w-auto brightness-0 invert mb-auto" />
        <div className="mb-auto">
          <h2 className="text-white text-4xl font-black leading-tight mb-4">
            Join the KSG<br />Recognition<br />System.
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Register with your official KSG email to nominate colleagues and participate in the awards process.
          </p>
        </div>
        <div className="h-1 w-12 bg-[#CBD300] rounded-full" />
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col bg-[#f7f6f3]">

        <div className="lg:hidden px-6 py-5 bg-[#7F622C]">
          <img src="/ksg-logo.png" alt="KSG" className="h-9 w-auto brightness-0 invert" />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
              <p className="text-gray-400 text-sm mb-7">
                Use your official <strong className="text-gray-600">@ksg.ac.ke</strong> email address
              </p>

              {error && (
                <div className="mb-5 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input required className={inp} value={form.name} onChange={set('name')} placeholder="e.g. Jane Mwangi" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">KSG Email</label>
                  <input required type="email" className={inp} value={form.email} onChange={set('email')} placeholder="firstname.lastname@ksg.ac.ke" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Department <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input className={inp} value={form.department} onChange={set('department')} placeholder="e.g. ICT" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <input required type="password" className={inp} value={form.password} onChange={set('password')} placeholder="Min. 8 chars" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm</label>
                    <input required type="password" className={inp} value={form.password_confirmation} onChange={set('password_confirmation')} placeholder="Repeat" />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-[#7F622C] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#5c4620] disabled:opacity-50 transition-colors"
                >
                  {busy ? 'Creating account…' : 'Sign Up'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-6">
                Already registered?{' '}
                <Link to="/login" className="text-[#7F622C] font-semibold hover:underline">Log In</Link>
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