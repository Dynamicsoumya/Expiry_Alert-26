import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './Profile.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    company: user?.company || '',
    emailNotifications: user?.emailNotifications ?? true,
    notifyDaysBefore: user?.notifyDaysBefore || 30
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>Profile Settings</h1>
        <p>Manage your account and notification preferences</p>
      </div>

      <div className="profile-grid">
        <div className="profile-card user-card">
          <div className="user-avatar-big">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="user-details">
            <h2>{user?.name}</h2>
            <div className="user-email">📧 {user?.email}</div>
            {user?.company && <div className="user-company-tag">🏢 {user?.company}</div>}
            <div className="user-role-tag">{user?.role}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form-card">
          <h3>Personal Information</h3>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Company</label>
            <input type="text" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Your company name" />
          </div>

          <h3 style={{ marginTop: 28 }}>Notification Settings</h3>
          <div className="toggle-group">
            <div>
              <div className="toggle-label">Email Notifications</div>
              <div className="toggle-sub">Receive email alerts for expiring records</div>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={form.emailNotifications} onChange={e => set('emailNotifications', e.target.checked)} />
              <span className="toggle-slider"></span>
            </label>
          </div>
          {form.emailNotifications && (
            <div className="form-group">
              <label>Notify me this many days before expiry</label>
              <div className="days-selector">
                {[7, 14, 30, 60, 90].map(d => (
                  <button type="button" key={d} className={`day-opt ${form.notifyDaysBefore === d ? 'active' : ''}`}
                    onClick={() => set('notifyDaysBefore', d)}>
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          )}
          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <div className="profile-info-card">
          <h3>Account Information</h3>
          <div className="info-row"><span>Email</span><strong>{user?.email}</strong></div>
          <div className="info-row"><span>Role</span><strong style={{ textTransform: 'capitalize' }}>{user?.role}</strong></div>
          <div className="info-row"><span>Member since</span><strong>{new Date(user?.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</strong></div>

          <h3 style={{ marginTop: 24 }}>Need Help?</h3>
          <div className="help-links">
            <a href="#!" className="help-link">📖 Documentation</a>
            <a href="#!" className="help-link">💬 Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
