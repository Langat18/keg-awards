import { Link } from 'react-router-dom';

const FEATURES = [
  {
    n: '01',
    title: 'Peer Nominations',
    desc: 'Staff nominate themselves or colleagues across defined award categories, with clear judging criteria for each.',
  },
  {
    n: '02',
    title: 'Transparent Voting',
    desc: 'Every nominee is visible to all staff. One vote per category keeps the process simple and fair.',
  },
];

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-[#1a1a1a] [&_h1]:tracking-normal [&_h2]:tracking-normal [&_h3]:tracking-normal">
      <header className="sticky top-0 z-40 border-b border-brand/10 bg-canvas">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="rounded-lg border border-brand/10 bg-white px-3 py-1.5 shadow-sm">
            <img src="/ksg-logo.png" alt="Kenya School of Government" className="h-8 w-auto sm:h-9" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark sm:px-5 sm:py-2.5"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark sm:px-5 sm:py-2.5"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-brand/10">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'url(/homepage.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/5" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 py-32 text-center sm:py-40">
          <h3 className="mb-6 font-serif text-[2.75rem] text-lime sm:text-4xl">Kenya School of Government</h3>
          <h3 className="mb-6 font-serif text-[2.75rem] text-lime sm:text-4xl">Mombasa Campus</h3>

          <h1 className="mb-6 font-serif text-[2.75rem] font-bold leading-[1.08] text-white sm:text-5xl">
            Staff Rewards &amp;<br />Recognition System
          </h1>

          <div className="mx-auto mb-6 h-[3px] w-14 bg-lime" />

          <p className="mx-auto mb-12 max-w-xl text-lg leading-relaxed text-white/85">
            A staff-driven platform for nominating, voting and celebrating
            outstanding colleagues
          </p>
        </div>
      </section>

      <section className="bg-canvas px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 max-w-xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand">How it works</p>
            <h2 className="font-serif text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
              Built on fairness and transparency
            </h2>
            <div className="mt-6 h-[3px] w-14 bg-lime" />
          </div>

          <div className="grid gap-px overflow-hidden rounded-xl border border-brand/10 bg-brand/10 sm:grid-cols-2">
            {FEATURES.map(f => (
              <div key={f.n} className="bg-canvas p-10">
                <p className="mb-4 font-serif text-sm font-bold text-brand/40">{f.n}</p>
                <h3 className="mb-3 font-serif text-xl font-bold text-gray-900">{f.title}</h3>
                <p className="max-w-md text-sm leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 font-serif text-2xl font-bold text-white sm:text-3xl">Ready to take part?</h2>
          <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-white/70">
            Register with your email to nominate colleagues and cast
            your vote in the current awards cycle.
          </p>
          <Link
            to="/register"
            className="inline-block rounded-md bg-lime px-8 py-3.5 text-sm font-bold text-gray-900 transition-colors hover:bg-lime-dark"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      <footer className="border-t border-brand/10 bg-canvas px-6 py-7">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Kenya School of Government. All rights reserved.
          </p>
          <p className="text-xs font-medium text-gray-500">Empowering the Public Service</p>
        </div>
      </footer>
    </div>
  );
}
