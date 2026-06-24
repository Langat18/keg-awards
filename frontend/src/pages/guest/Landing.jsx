import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

const FEATURES = [
  {
    n:     '01',
    title: 'Peer Nominations',
    desc:  'Staff nominate themselves or colleagues across defined award categories, with clear judging criteria for each.',
  },
  {
    n:     '02',
    title: 'Transparent Voting',
    desc:  'Every nominee is visible to all staff. One vote per category keeps the process simple and fair.',
  },
];

export default function Landing() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/management' : '/staff', { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-ksg-bg flex flex-col">

      <header className="bg-ksg-bg sticky top-0 z-40 border-b border-ksg-brown/10">
        <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link to="/" className="bg-white rounded-lg shadow-sm border border-ksg-brown/10 px-3 py-1.5">
            <img src="/ksg-logo.png" alt="Kenya School of Government" className="h-9 w-auto" />
          </Link>
          <div className="hidden sm:flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm font-semibold  bg-ksg-brown text-white px-5 py-2.5 rounded-md hover:bg-ksg-brownDk transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold bg-ksg-brown text-white px-5 py-2.5 rounded-md hover:bg-ksg-brownDk transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

       <section className="relative overflow-hidden border-b border-ksg-brown/10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/homepage.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/5" />
 
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-32 sm:py-40 text-center">
          <h3 className="font-serif text-[2.75rem] sm:text-4xl text-ksg-lime mb-6">
            Kenya School of Government — Mombasa Campus
          </h3>
 
          <h1 className="font-serif text-[2.75rem] sm:text-5xl font-bold text-white leading-[1.08] mb-6">
            Staff Rewards &amp;<br />Recognition System
          </h1>
 
          <div className="w-14 h-[3px] bg-ksg-lime mx-auto mb-6" />
 
          <p className="text-white/85 text-lg leading-relaxed max-w-xl mx-auto mb-12">
            A staff-driven platform for nominating, voting, and celebrating
            outstanding colleagues.
          </p>
 
          {/*<div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="bg-ksg-lime text-gray-900 font-bold px-8 py-3.5 rounded-md hover:bg-ksg-limeDk transition-colors text-sm"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="bg-white/10 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-md hover:bg-white/20 transition-colors text-sm backdrop-blur-sm"
            >
              Sign In
            </Link>
          </div>*/}
        </div>
      </section>
 
      <section className="bg-ksg-bg py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-xl mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-ksg-brown mb-3">
              How it works
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              Built on fairness and transparency
            </h2>
            <div className="w-14 h-[3px] bg-ksg-lime mt-6" />
          </div>

          <div className="grid sm:grid-cols-2 gap-px bg-ksg-brown/10 rounded-xl overflow-hidden border border-ksg-brown/10">
            {FEATURES.map(f => (
              <div key={f.n} className="bg-ksg-bg p-10">
                <p className="font-serif text-sm font-bold text-ksg-brown/40 mb-4">{f.n}</p>
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-md">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ksg-brown py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to take part?
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-8 max-w-md mx-auto">
            Register with your email to nominate colleagues and cast
            your vote in the current awards cycle.
          </p>
          <Link
            to="/register"
            className="inline-block bg-ksg-lime text-gray-900 font-bold px-8 py-3.5 rounded-md hover:bg-ksg-limeDk transition-colors text-sm"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      <footer className="bg-ksg-bg border-t border-ksg-brown/10 py-7 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Kenya School of Government. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 font-medium">Empowering the Public Service</p>
        </div>
      </footer>

    </div>
  );
}