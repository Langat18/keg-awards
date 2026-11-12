import { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../components/Toast';
import { errorMessage, fieldErrors, formatDate } from '../lib/format';
import api from '../api/axios';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import Card, { CardHeader } from '../components/Card';
import Input from '../components/Input';
import PageHeader from '../components/PageHeader';

const EMPTY_PASSWORD = { current_password: '', password: '', password_confirmation: '' };

export default function Profile() {
  const { user, setUser, isAdmin } = useAuth();
  const { toast } = useToast();

  const [details, setDetails] = useState({ name: user?.name || '', department: user?.department || '' });
  const [passwords, setPasswords] = useState(EMPTY_PASSWORD);
  const [pwErrors, setPwErrors] = useState({});
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const detailsChanged = details.name !== (user?.name || '') || details.department !== (user?.department || '');

  async function saveDetails(e) {
    e.preventDefault();
    setSavingDetails(true);
    try {
      const { data } = await api.patch('/auth/profile', details);
      setUser(data);
      toast.success('Profile saved.');
    } catch (err) {
      toast.error(errorMessage(err, 'Your profile was not saved.'));
    } finally {
      setSavingDetails(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();

    if (passwords.password !== passwords.password_confirmation) {
      setPwErrors({ password_confirmation: 'The new passwords do not match.' });
      return;
    }

    setSavingPassword(true);
    setPwErrors({});
    try {
      const { data } = await api.patch('/auth/password', passwords);
      setPasswords(EMPTY_PASSWORD);
      toast.success(data.message || 'Password changed.');
    } catch (err) {
      const fields = fieldErrors(err);
      setPwErrors(fields);
      if (!Object.keys(fields).length) toast.error(errorMessage(err, 'Your password was not changed.'));
    } finally {
      setSavingPassword(false);
    }
  }

  const bindPassword = field => ({
    value: passwords[field],
    error: pwErrors[field],
    onChange: e => {
      setPasswords(p => ({ ...p, [field]: e.target.value }));
      setPwErrors(er => ({ ...er, [field]: undefined }));
    },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Your profile">
        <div className="mt-5 flex items-center gap-4">
          <Avatar name={user?.name} size="lg" />
          <div>
            <p className="font-semibold">{user?.email}</p>
            <p className="text-sm text-muted">
              {isAdmin ? 'Administrator' : 'Staff'}
              {user?.created_at && `, joined ${formatDate(user.created_at)}`}
            </p>
          </div>
        </div>
      </PageHeader>

      <div className="space-y-6">
        <Card as="form" onSubmit={saveDetails}>
          <CardHeader title="Personal details" description="Your name and department appear on nominations and results." />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Input label="Full name" required value={details.name} onChange={e => setDetails(d => ({ ...d, name: e.target.value }))} />
            <Input
              label="Department"
              optional
              value={details.department}
              onChange={e => setDetails(d => ({ ...d, department: e.target.value }))}
              placeholder="e.g. Finance and Administration"
            />
            <Input label="Email address" value={user?.email || ''} disabled hint="Contact ICT to change your email address." className="sm:col-span-2" />
          </div>
          <Button type="submit" className="mt-6" loading={savingDetails} disabled={!detailsChanged}>
            Save details
          </Button>
        </Card>

        <Card as="form" onSubmit={changePassword}>
          <CardHeader title="Password" description="Changing your password signs you out on other devices." />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Input label="Current password" type="password" autoComplete="current-password" required className="sm:col-span-2" {...bindPassword('current_password')} />
            <Input label="New password" type="password" autoComplete="new-password" required hint={isAdmin ? 'Use at least 12 characters for an administrator account.' : 'At least 8 characters.'} {...bindPassword('password')} />
            <Input label="Confirm new password" type="password" autoComplete="new-password" required {...bindPassword('password_confirmation')} />
          </div>
          <Button type="submit" className="mt-6" loading={savingPassword}>
            Change password
          </Button>
        </Card>
      </div>
    </div>
  );
}
