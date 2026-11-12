import { Link } from 'react-router-dom';
import Button from '../../components/Button';

const STEPS = [
  {
    title: 'Nominate',
    text: 'Put forward a colleague, or yourself, in any award category. Each category lists what the judges look for.',
  },
  {
    title: 'Vote',
    text: 'Every nominee is listed for all staff to see. You get one vote per category and can change it until voting closes.',
  },
  {
    title: 'Celebrate',
    text: 'Votes are counted automatically and the winners in each category are announced when results are published.',
  },
];

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
          <Link to="/">
            <img src="/ksg-logo.png" alt="Kenya School of Government" className="h-9 w-auto sm:h-11" />
          </Link>
          <div className="flex items-center gap-2">
            <Button to="/login" variant="ghost" size="sm" className="sm:h-10 sm:px-4 sm:text-sm">Sign in</Button>
            <Button to="/register" size="sm" className="sm:h-10 sm:px-4 sm:text-sm">Create account</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl items-end gap-10 px-4 pb-0 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          <div className="pb-4 lg:pb-16">
            <p className="text-sm font-semibold text-brand">Kenya School of Government, Mombasa Campus</p>
            <h1 className="mt-4 text-[40px] font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-[56px]">
              Staff Rewards and Recognition
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
              Nominate the colleagues who make a difference, vote in each award category and see who the campus chose.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/register" size="lg">Create your account</Button>
              <Button to="/login" size="lg" variant="secondary">Sign in</Button>
            </div>
            <p className="mt-4 text-sm text-muted">Use your @ksg.ac.ke email address to register.</p>
          </div>

          <div className="parapet relative h-64 overflow-hidden rounded-b-none sm:h-80 lg:h-[440px]">
            <img
              src="/homepage.jpg"
              alt="The KSG Mombasa campus building"
              className="absolute inset-0 h-full w-full object-cover object-[50%_35%]"
            />
          </div>
        </section>

        <section className="bg-brand-ink text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="max-w-lg text-2xl font-bold text-white sm:text-3xl">How an awards cycle runs</h2>
            <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
              {STEPS.map((step, i) => (
                <li key={step.title} className="border-t-[3px] border-white/15 pt-5 first:border-lime">
                  <p className="text-sm font-semibold text-lime">Stage {i + 1}</p>
                  <h3 className="mt-1 text-xl font-bold text-white">{step.title}</h3>
                  <p className="mt-2 max-w-sm leading-relaxed text-white/70">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-muted sm:flex-row sm:justify-between sm:px-6">
          <p>&copy; {new Date().getFullYear()} Kenya School of Government</p>
          <p>Empowering the Public Service</p>
        </div>
      </footer>
    </div>
  );
}
