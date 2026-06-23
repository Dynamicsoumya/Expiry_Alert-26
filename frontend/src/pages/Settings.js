import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    company: user?.company || '',
    notificationEmail: user?.notificationEmail || '',
    notifyDaysBefore: user?.notifyDaysBefore?.join(', ') || '7, 14, 30'
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setPw = (k) => (e) => setPasswords(p => ({ ...p, [k]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        ...form,
        notifyDaysBefore: form.notifyDaysBefore.split(',').map(d => parseInt(d.trim())).filter(Boolean)
      });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPw(true);
    try {
      await api.put('/auth/password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div>
      <Header title="⚙️ Settings" />
      <div className="page">
        <div style={{ maxWidth: 600 }}>
          <div className="card mb-6">
            <h3 style={{ marginBottom: 20, fontFamily: 'Space Grotesk', fontWeight: 700 }}>Profile Settings</h3>
            <form onSubmit={saveProfile}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={set('name')} />
              </div>
              <div className="form-group">
                <label className="form-label">Company</label>
                <input className="form-input" value={form.company} onChange={set('company')} placeholder="Your company name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Notification Email (optional)</label>
                <input className="form-input" type="email" value={form.notificationEmail} onChange={set('notificationEmail')} placeholder="alerts@company.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Alert Days Before Expiry (comma separated)</label>
                <input className="form-input" value={form.notifyDaysBefore} onChange={set('notifyDaysBefore')} placeholder="7, 14, 30" />
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>You'll be notified this many days before a record expires</div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><span className="spinner" /> Saving...</> : 'Save Profile'}
              </button>
            </form>
          </div>

          <div className="card mb-6">
            <h3 style={{ marginBottom: 20, fontFamily: 'Space Grotesk', fontWeight: 700 }}>Change Password</h3>
            <form onSubmit={changePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="form-input" type="password" value={passwords.currentPassword} onChange={setPw('currentPassword')} />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" value={passwords.newPassword} onChange={setPw('newPassword')} minLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="form-input" type="password" value={passwords.confirm} onChange={setPw('confirm')} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={changingPw}>
                {changingPw ? <><span className="spinner" /> Changing...</> : 'Change Password'}
              </button>
            </form>
          </div>

          <div className="card" style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
            <h3 style={{ marginBottom: 8, color: 'var(--danger)' }}>⚠️ Danger Zone</h3>
            <p className="text-muted text-sm" style={{ marginBottom: 16 }}>Once you delete your account, there is no going back. Please be certain.</p>
            <button className="btn btn-danger btn-sm" onClick={() => {
              if (window.confirm('Are you absolutely sure? This will delete all your records.')) {
                toast.error('Account deletion not implemented in demo');
              }
            }}>Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
}
