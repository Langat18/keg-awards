
import { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../api/axios';

export default function Profile() {
  const { user }  = useAuth();
  const { toast } = useToast();

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

  const inp = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#7F622C] focus:border-[#7F622C] bg-white transition-colors';
  const inpDisabled = `${inp} bg-gray-50 text-gray-400 cursor-not-allowed`;

  async function saveProfile(e) {
    e.preventDefault();
    setBusyProfile(true);
    try {
      const { data } = await api.patch('/auth/profile', form);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success('Profile updated successfully.');
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

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
        <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 text-base mb-1">Personal Details</h3>
          <p className="text-xs text-gray-400 mb-5">Update your name and department.</p>
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Full Name</label>
              <input required className={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Email Address</label>
              <input disabled className={inpDisabled} value={user?.email} />
              <p className="text-xs text-gray-400 mt-1">Email address cannot be changed.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Department <span className="text-gray-400 font-normal normal-case">(optional)</span>
              </label>
              <input className={inp} value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="e.g. Finance & Administration" />
            </div>
            <div className="pt-1">
              <button
                type="submit"
                disabled={busyProfile}
                className="bg-[#7F622C] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#5c4620] disabled:opacity-50 transition-colors"
              >
                {busyProfile ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 text-base mb-1">Change Password</h3>
          <p className="text-xs text-gray-400 mb-5">Choose a strong password of at least 8 characters.</p>
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Current Password</label>
              <input
                required
                type="password"
                className={inp}
                value={pwForm.current_password}
                onChange={e => setPwForm(f => ({ ...f, current_password: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">New Password</label>
              <input
                required
                type="password"
                className={inp}
                value={pwForm.password}
                onChange={e => setPwForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Minimum 8 characters"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Confirm New Password</label>
              <input
                required
                type="password"
                className={inp}
                value={pwForm.password_confirmation}
                onChange={e => setPwForm(f => ({ ...f, password_confirmation: e.target.value }))}
              />
            </div>
            <div className="pt-1">
              <button
                type="submit"
                disabled={busyPw}
                className="border border-[#7F622C] text-[#7F622C] text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#7F622C] hover:text-white disabled:opacity-50 transition-colors"
              >
                {busyPw ? 'Changing…' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}