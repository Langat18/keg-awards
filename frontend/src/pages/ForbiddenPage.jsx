import { useAuth } from '../store/AuthContext';
import Button from '../components/Button';

export default function ForbiddenPage() {
  const { user, homePath } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="tabular text-6xl font-extrabold text-brand">403</p>
        <h1 className="mt-3 text-2xl">You do not have access to this page</h1>
        <p className="mt-2 text-muted">This area is for administrators. If you need access, contact the ICT office.</p>
        <Button to={user ? homePath : '/login'} className="mt-6">Back to your dashboard</Button>
      </div>
    </main>
  );
}
