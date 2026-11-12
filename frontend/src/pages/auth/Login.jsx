import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { errorMessage } from '../../lib/format';
import AuthLayout from './AuthLayout';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Icon from '../../components/Icon';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(form.email.trim(), form.password);
      navigate(user.role === 'admin' ? '/management' : '/staff', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Sign in failed. Try again.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      description="Staff Rewards and Recognition"
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-semibold text-brand hover:underline">Create an account</Link>
        </>
      }
    >
      {params.get('expired') && !error && (
        <p className="mb-5 flex items-start gap-2 rounded border border-line bg-canvas px-3 py-2.5 text-sm">
          <Icon name="info" className="mt-0.5 h-4 w-4 text-brand" />
          Your session ended. Sign in again to continue.
        </p>
      )}

      {error && (
        <p role="alert" className="mb-5 flex items-start gap-2 rounded border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
          <Icon name="alert" className="mt-0.5 h-4 w-4" />
          {error}
        </p>
      )}

      <form onSubmit={submit} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="firstname.lastname@ksg.ac.ke"
          required
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
        />
        <Button type="submit" size="lg" loading={busy} className="w-full">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
