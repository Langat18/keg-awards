
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

const FEATURES = [
  {
    title: 'Peer Nominations',
    desc:  'Staff nominate themselves or colleagues across defined award categories.',
  },
  {
    title: 'Transparent Voting',
    desc:  'One vote per category. All nominees visible to all staff — no hidden ballots.',
  },
  {
    title: 'Instant Results',
    desc:  'Winners are revealed the moment voting closes, with full vote counts published.',
  },
];

const STEPS = [
  { n: '1', label: 'Admin opens nominations' },
  { n: '2', label: 'Staff nominate colleagues or self' },
  { n: '3', label: 'Voting opens — one vote per category' },
  { n: '4', label: 'Results published to all staff' },
];

export default function Landing() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/management' : '/staff', { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col">


      <header className="bg-[#7F622C] sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <img src="/ksg-logo.png" alt="Kenya School of Government" className="h-9 w-auto" />
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm font-medium text-white/80 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">
              Log In
            </Link>
            <Link to="/register" className="text-sm font-semibold bg-[#CBD300] text-[#3d2e00] px-4 py-2 rounded-lg hover:bg-[#b8be00] transition-colors">
              Register
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-white py-20 px-6 border-b border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#7F622C] mb-5">
            Kenya School of Government
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight mb-6">
            Staff Rewards &amp;<br />Recognition System
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            A formal, staff-driven platform for nominating, voting, and celebrating outstanding colleagues across KSG campuses.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="bg-[#7F622C] text-white font-bold px-7 py-3.5 rounded-xl hover:bg-[#5c4620] transition-colors text-sm">
              Create Account
            </Link>
            <Link to="/login" className="border border-gray-200 text-gray-700 font-semibold px-7 py-3.5 rounded-xl hover:border-[#7F622C] hover:text-[#7F622C] transition-colors text-sm">
              Sign In
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-5">
            Access restricted to <strong className="text-gray-500">@ksg.ac.ke</strong> email addresses only
          </p>
        </div>
      </section>

      <section className="bg-[#f7f6f3] py-16 px-6 border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 text-center">Process</p>
          <h2 className="text-2xl font-black text-gray-900 text-center mb-10">How the awards cycle works</h2>
          <div className="grid sm:grid-cols-4 gap-4">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm h-full">
                  <div className="w-8 h-8 rounded-full bg-[#7F622C] text-white text-xs font-black flex items-center justify-center mb-3">
                    {s.n}
                  </div>
                  <p className="text-sm font-semibold text-gray-700 leading-snug">{s.label}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-9 -right-2 text-gray-300 text-lg z-10">›</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 px-6 border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 text-center">Why it matters</p>
          <h2 className="text-2xl font-black text-gray-900 text-center mb-10">Built on fairness and transparency</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="border border-gray-100 rounded-2xl p-6 hover:border-[#CBD300] transition-colors">
                <div className="w-8 h-1 bg-[#CBD300] rounded-full mb-4" />
                <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#7F622C] py-14 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-black text-white mb-3">
            Ready to participate?
          </h2>
          <p className="text-white/60 text-sm mb-7 max-w-md mx-auto">
            Register with your official KSG email address and take part in the current awards cycle.
          </p>
          <Link
            to="/register"
            className="inline-block bg-[#CBD300] text-[#3d2e00] font-bold px-8 py-3.5 rounded-xl hover:bg-[#b8be00] transition-colors text-sm"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-100 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <img src="/ksg-logo.png" alt="KSG" className="h-7 w-auto opacity-70" />
          <p className="text-xs text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Kenya School of Government. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">Empowering the Public Service</p>
        </div>
      </footer>

    </div>
  );
}