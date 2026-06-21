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
    desc:  'One vote per category. All nominees visible to all staff.',
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

      <header className="bg-white sticky top-0 z-40 shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-center">
          <img src="/ksg-logo.png" alt="Kenya School of Government" className="h-10 w-auto" />
        </div>
      </header>

    
      <section
        className="relative py-28 px-6 border-b border-gray-100 flex items-center justify-center"
        style={{
          backgroundImage: 'url(/homepage.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-3 drop-shadow-lg">
            Kenya School of Government
          </h1>
          <p className="text-4xl sm:text-5xl font-black text-white leading-tight mb-8 drop-shadow-lg">
            Staff Rewards &amp; Recognition System
          </p>
          <p className="text-white text-lg leading-relaxed mb-10 max-w-xl mx-auto font-medium">
            A formal, staff-driven platform for nominating, voting, and celebrating outstanding colleagues at KSG Mombasa Campus.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="bg-[#CBD300] text-black font-bold px-7 py-3.5 rounded-xl hover:bg-[#f5f3f2] transition-colors text-sm">
              Create Account
            </Link>
            <Link to="/login" className="bg-[#CBD300] text-black font-bold px-7 py-3.5 rounded-xl hover:bg-[#f5f3f2] transition-colors text-sm">
              Sign In
            </Link>
          </div>
        </div>
      
      </section>

      <section className="bg-white py-16 px-6 border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-10">Built on fairness and transparency</h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {FEATURES.map(f => (
              <div key={f.title} className="border border-gray-100 rounded-2xl p-6 hover:border-[#CBD300] transition-colors flex-1 max-w-sm">
                <div className="w-8 h-1 bg-[#CBD300] rounded-full mb-4" />
                <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-100 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Kenya School of Government. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">Empowering the Public Service</p>
        </div>
      </footer>

    </div>
  );
}