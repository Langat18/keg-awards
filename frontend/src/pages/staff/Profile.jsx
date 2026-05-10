import { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../../components/Toast';
import Card from '../../components/Card';
import Button from '../../components/Button';
import api from '../../api/axios';

export default function Profile() {
  const { user, login } = useAuth();
  const { toast }       = useToast();

  const [form, setForm] = useState({
    name:       user?.name       || '',
    department: user?.department || '',
  });

  const [pwForm, setPwForm] = useState({
    current_password:      '',
    password:              '',
    password_confirmation: '',
  });

  const [busyProfile, setBusyProfile] = useState(false);
  const [busyPw, setBusyPw]           = useState(false);

  function set(setter) {
    return field => e => setter(f => ({ ...f, [field]: e.target.value }));
  }

  async function saveProfile(e) {
    e.preventDefault();
    setBusyProfile(true);
    try {
      const { data } = await api.patch('/auth/profile', form);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setBusyProfile(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setBusyPw(true);
    try {
      await api.patch('/auth/password', pwForm);
      setPwForm({ current_password: '', password: '', password_confirmation: '' });
      toast.success('Password changed successfully.');
    } catch (err) {
      const msgs = err.response?.data?.errors;
      toast.error(msgs ? Object.values(msgs).flat().join(' ') : 'Password change failed.');
    } finally {
      setBusyPw(false);
    }
  }

  const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7F622C]';

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold text-[#7F622C] mb-1">My Profile</h2>
      <p className="text-gray-500 text-sm mb-6">{user?.email}</p>

      {/* Profile details */}
      <Card className="mb-6">
        <h4 className="font-bold text-gray-700 mb-4">Personal Details</h4>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              required
              className={inp}
              value={form.name}
              onChange={set(setForm)('name')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-gray-400 font-normal">(cannot be changed)</span>
            </label>
            <input
              disabled
              className={`${inp} bg-gray-50 text-gray-400 cursor-not-allowed`}
              value={user?.email}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              className={inp}
              value={form.department}
              onChange={set(setForm)('department')}
              placeholder="e.g. Finance & Administration"
            />
          </div>
          <Button type="submit" disabled={busyProfile}>
            {busyProfile ? 'Saving…' : 'Save Changes'}
          </Button>
        </form>
      </Card>

      {/* Change password */}
      <Card>
        <h4 className="font-bold text-gray-700 mb-4">Change Password</h4>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              required
              type="password"
              className={inp}
              value={pwForm.current_password}
              onChange={set(setPwForm)('current_password')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              required
              type="password"
              className={inp}
              value={pwForm.password}
              onChange={set(setPwForm)('password')}
              placeholder="Minimum 8 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              required
              type="password"
              className={inp}
              value={pwForm.password_confirmation}
              onChange={set(setPwForm)('password_confirmation')}
            />
          </div>
          <Button type="submit" disabled={busyPw} variant="outline">
            {busyPw ? 'Changing…' : 'Change Password'}
          </Button>
        </form>
      </Card>
    </div>
  );
}