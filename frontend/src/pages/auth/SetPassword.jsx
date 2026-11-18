import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { errorMessage, fieldErrors } from '../../lib/format';
import api from '../../api/axios';
import AuthLayout from './AuthLayout';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Icon from '../../components/Icon';

export default function SetPassword() {
  const { user, setUser, signInPassword, logout } = useAuth();
  const navigate = useNavigate();
  const knownCurrent = signInPassword.current;

  const [form, setForm] = useState({ current_password: knownCurrent, password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const bind = field => ({
    value: form[field],
    error: errors[field],
    onChange: e => {
      setForm(f => ({ ...f, [field]: e.target.value }));
      setErrors(er => ({ ...er, [field]: undefined }));
    },
  });

  async function submit(e) {
    e.preventDefault();

    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: 'The passwords do not match.' });
      return;
    }

    setBusy(true);
    setError('');
    try {
      await api.patch('/auth/password', form);
      signInPassword.current = '';
      setUser({ ...user, must_change_password: false });
      navigate(user.role === 'admin' ? '/management' : '/staff', { replace: true });
    } catch (err) {
      const fields = fieldErrors(err);
      setErrors(fields);
      if (!Object.keys(fields).length || (knownCurrent && fields.current_password)) {
        setError(errorMessage(err, 'Your password could not be changed. Try again.'));
      }
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <AuthLayout
      title="Choose your own password"
      description="You signed in with a temporary password. Pick one only you know before you continue."
      footer={
        <button type="button" onClick={signOut} className="font-semibold text-brand hover:underline">Sign out</button>
      }
    >
      {user?.login_id && (
        <div className="mb-6 rounded-lg border border-line bg-canvas px-4 py-3 text-sm">
          <p className="text-muted">Your sign-in ID</p>
          <p className="mt-0.5 font-mono text-lg font-bold text-brand-ink">{user.login_id}</p>
          <p className="mt-1 text-muted">Use it {user.email ? 'or your email ' : ''}to sign in next time.</p>
        </div>
      )}

      {error && (
        <p role="alert" className="mb-5 flex items-start gap-2 rounded border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
          <Icon name="alert" className="mt-0.5 h-4 w-4" />
          {error}
        </p>
      )}

      <form onSubmit={submit} className="space-y-5" noValidate>
        {!knownCurrent && (
          <Input label="Temporary password" type="password" autoComplete="current-password" required {...bind('current_password')} />
        )}
        <Input label="New password" type="password" autoComplete="new-password" hint="At least 8 characters." required {...bind('password')} />
        <Input label="Confirm new password" type="password" autoComplete="new-password" required {...bind('password_confirmation')} />
        <Button type="submit" size="lg" loading={busy} className="w-full">
          Save and continue
        </Button>
      </form>
    </AuthLayout>
  );
}
