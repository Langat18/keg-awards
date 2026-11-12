import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { errorMessage, fieldErrors } from '../../lib/format';
import AuthLayout from './AuthLayout';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Icon from '../../components/Icon';

const EMPTY = { name: '', email: '', department: '', password: '', password_confirmation: '' };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
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
      await register({ ...form, email: form.email.trim() });
      navigate('/staff', { replace: true });
    } catch (err) {
      const fields = fieldErrors(err);
      setErrors(fields);
      if (!Object.keys(fields).length) setError(errorMessage(err, 'Registration failed. Try again.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Takes a minute. You will be signed in straight away."
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand hover:underline">Sign in</Link>
        </>
      }
    >
      {error && (
        <p role="alert" className="mb-5 flex items-start gap-2 rounded border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
          <Icon name="alert" className="mt-0.5 h-4 w-4" />
          {error}
        </p>
      )}

      <form onSubmit={submit} className="space-y-5" noValidate>
        <Input label="Full name" autoComplete="name" placeholder="e.g. Jane Mwangi" required {...bind('name')} />
        <Input
          label="KSG email address"
          type="email"
          autoComplete="email"
          placeholder="firstname.lastname@ksg.ac.ke"
          hint="Only @ksg.ac.ke addresses can register."
          required
          {...bind('email')}
        />
        <Input label="Department" optional placeholder="e.g. Finance and Administration" {...bind('department')} />
        <Input label="Password" type="password" autoComplete="new-password" hint="At least 8 characters." required {...bind('password')} />
        <Input label="Confirm password" type="password" autoComplete="new-password" required {...bind('password_confirmation')} />
        <Button type="submit" size="lg" loading={busy} className="w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
