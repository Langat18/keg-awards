import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

const BENEFITS = [
  {
    title: 'Open Nominations',
    desc:  'Any staff member can nominate themselves or a colleague across defined award categories.',
  },
  {
    title: 'Fair Voting',
    desc:  'One vote per category. All nominees are visible — no hidden ballots, no bias.',
  },
  {
    title: 'Live Results',
    desc:  'Results are published the moment the admin closes voting, with full vote transparency.',
  },
];

export default function Landing() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/management' : '/staff', { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Nav ── */}
      <header className="bg-[#7F622C] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/ksg-logo.png" alt="KSG" className="h-9 w-auto brightness-0 invert" />
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm font-medium text-white/80 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold bg-[#CBD300] text-[#3d2e00] px-4 py-2 rounded-lg hover:bg-[#b8be00] transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="bg-white py-24 px-6 border-b border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-[#7F622C] mb-4">
              KSG Staff Recognition System
            </p>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight mb-6">
              Plug into a culture<br />of recognition.
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg">
              A transparent, staff-driven awards platform for the Kenya School of Government.
              Nominate, vote, and celebrate the colleagues who make a difference.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="bg-[#7F622C] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#5c4620] transition-colors text-sm"
              >
                Join Us
              </Link>
              <Link
                to="/login"
                className="border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:border-[#7F622C] hover:text-[#7F622C] transition-colors text-sm"
              >
                Log In
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Restricted to <strong>@ksg.ac.ke</strong> email addresses
            </p>
          </div>

          {/* Visual panel */}
          <div className="flex-1 w-full max-w-sm lg:max-w-none">
            <div className="bg-[#7F622C] rounded-2xl p-8 text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-[#CBD300] mb-6">How it works</p>
              <div className="space-y-5">
                {['Admin opens nominations', 'Staff nominate colleagues', 'Voting opens — one vote per category', 'Results published instantly'].map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="w-7 h-7 rounded-full bg-[#CBD300] text-[#3d2e00] text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-white/80 text-sm leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="bg-[#f7f6f3] py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 text-center">Benefits</p>
          <h2 className="text-2xl font-black text-gray-900 text-center mb-12">
            Built for transparency and fairness
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {BENEFITS.map(b => (
              <div key={b.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="w-8 h-1 bg-[#CBD300] rounded-full mb-4" />
                <h3 className="font-bold text-gray-800 mb-2">{b.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section className="bg-[#7F622C] py-16 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-white mb-1">
              Ready to recognise excellence?
            </h2>
            <p className="text-white/60 text-sm">
              Create your account and participate in the current awards cycle.
            </p>
          </div>
          <Link
            to="/register"
            className="shrink-0 bg-[#CBD300] text-[#3d2e00] font-bold px-7 py-3 rounded-xl hover:bg-[#b8be00] transition-colors text-sm"
          >
            Sign Up
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <img src="/ksg-logo.png" alt="KSG" className="h-7 w-auto opacity-50" />
          <p className="text-xs text-gray-400">
            Kenya School of Government — Empowering the Public Service &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}