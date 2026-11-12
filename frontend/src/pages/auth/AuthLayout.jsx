import { Link } from 'react-router-dom';

export default function AuthLayout({ title, description, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_minmax(0,560px)]">
      <aside className="relative hidden overflow-hidden lg:block">
        <img src="/homepage.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-[40%_40%]" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-10 pt-32">
          <p className="font-serif text-lg font-semibold text-lime">Kenya School of Government, Mombasa Campus</p>
          <div className="my-4 h-[3px] w-12 rounded-full bg-lime" />
          <p className="max-w-md font-serif text-3xl font-bold leading-snug text-white">
            Recognising the people who make our campus work.
          </p>
        </div>
      </aside>

      <main className="flex flex-col bg-white px-5 py-8 sm:px-12">
        <div className="-mx-5 -mt-8 mb-8 h-[3px] bg-lime sm:-mx-12" />
        <Link to="/" className="self-start">
          <img src="/ksg-logo.png" alt="Kenya School of Government, back to home" className="h-10 w-auto" />
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-[28px] leading-tight">{title}</h1>
          {description && <p className="mt-2 text-muted">{description}</p>}
          <div className="mt-8">{children}</div>
          {footer && <p className="mt-8 text-sm text-muted">{footer}</p>}
        </div>

        <p className="text-xs text-muted">&copy; {new Date().getFullYear()} Kenya School of Government</p>
      </main>
    </div>
  );
}
