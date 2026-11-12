import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';

const STEPS = [
  {
    icon: 'pen',
    title: 'Peer nominations',
    text: 'Nominate yourself or a colleague in any award category. Each category explains what the judges look for.',
  },
  {
    icon: 'ballot',
    title: 'Transparent voting',
    text: 'Every nominee is visible to all staff. One vote per category keeps the process simple and fair.',
  },
  {
    icon: 'trophy',
    title: 'Results and recognition',
    text: 'Votes are counted automatically and the winners in each category are announced when results are published.',
  },
];

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="sticky top-0 z-40 border-b border-brand/10 bg-canvas/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="rounded-lg border border-brand/10 bg-white px-3 py-1.5 shadow-sm">
            <img src="/ksg-logo.png" alt="Kenya School of Government" className="h-8 w-auto sm:h-9" />
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/login" className="rounded-md px-3 py-2 text-sm font-semibold text-brand hover:bg-brand/5 sm:px-4">
              Sign in
            </Link>
            <Link to="/register" className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark sm:px-5 sm:py-2.5">
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <img src="/homepage.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-[50%_35%]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/55 to-black/70" />

        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center sm:py-36">
          <p className="font-serif text-2xl font-semibold text-lime sm:text-3xl">Kenya School of Government</p>
          <p className="mt-1 font-serif text-xl font-semibold text-lime/90 sm:text-2xl">Mombasa Campus</p>

          <h1 className="mx-auto mt-8 max-w-3xl font-serif text-[2.6rem] font-bold leading-[1.08] text-white sm:text-6xl">
            Staff Rewards and Recognition System
          </h1>

          <div className="mx-auto my-8 h-[3px] w-16 rounded-full bg-lime" />

          <p className="mx-auto max-w-xl text-lg leading-relaxed text-white/85">
            A staff-driven platform for nominating, voting for and celebrating outstanding colleagues.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register" className="rounded-md bg-lime px-8 py-3.5 text-sm font-bold text-brand-ink hover:bg-lime-dark">
              Create your account
            </Link>
            <Link to="/login" className="rounded-md border border-white/40 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-brand">How it works</p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-brand-ink sm:text-4xl">Built on fairness and transparency</h2>
            <div className="mt-6 h-[3px] w-14 rounded-full bg-lime" />
          </div>

          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative rounded-2xl border border-brand/10 bg-white p-7 shadow-sm shadow-brand/5">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-lime">
                    <Icon name={step.icon} className="h-6 w-6" />
                  </span>
                  <span className="font-serif text-4xl font-bold text-brand/15">{i + 1}</span>
                </div>
                <h3 className="mt-6 font-serif text-xl font-bold text-brand-ink">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-brand px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-bold text-white">Ready to take part?</h2>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-white/75">
            Register with your KSG email to nominate colleagues and cast your vote in the current awards cycle.
          </p>
          <Link to="/register" className="mt-8 inline-block rounded-md bg-lime px-8 py-3.5 text-sm font-bold text-brand-ink hover:bg-lime-dark">
            Create your account
          </Link>
        </div>
      </section>

      <footer className="border-t border-brand/10 px-6 py-7">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-sm text-muted sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Kenya School of Government. All rights reserved.</p>
          <p className="font-medium">Empowering the Public Service</p>
        </div>
      </footer>
    </div>
  );
}
