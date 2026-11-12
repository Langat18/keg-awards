import { useAuth } from '../store/AuthContext';
import Button from '../components/Button';

export default function NotFoundPage() {
  const { user, homePath } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="tabular text-6xl font-extrabold text-brand">404</p>
        <h1 className="mt-3 text-2xl">This page does not exist</h1>
        <p className="mt-2 text-muted">The link may be old or mistyped.</p>
        <Button to={user ? homePath : '/'} className="mt-6">Go to the home page</Button>
      </div>
    </main>
  );
}
