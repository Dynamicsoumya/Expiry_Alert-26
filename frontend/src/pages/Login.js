import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password, form.company);
      }
      toast.success(mode === 'login' ? 'Welcome back!' : 'Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="logo-icon" style={{ width: 60, height: 60, fontSize: 28, margin: '0 auto 12px', borderRadius: 16, background: 'linear-gradient(135deg, #4F8EF7, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔔</div>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 700, marginBottom: 4 }}>ExpiryAlert '26</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Track. Alert. Stay Ahead.</div>
        </div>

        <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: 4, marginBottom: 24, border: '1px solid var(--border)' }}>
          {['login', 'register'].map(m => (
            <button key={m} type="button"
              onClick={() => setMode(m)}
              className="btn"
              style={{
                flex: 1, justifyContent: 'center', padding: '8px',
                background: mode === m ? 'var(--accent)' : 'transparent',
                color: mode === m ? 'white' : 'var(--text-muted)',
                borderRadius: 6, fontSize: 13
              }}>
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Your name" value={form.name} onChange={set('name')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Company (optional)</label>
                <input className="form-input" placeholder="Acme Corp" value={form.company} onChange={set('company')} />
              </div>
            </>
          )}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? <><span className="spinner" /> Processing...</> : (mode === 'login' ? 'Sign In →' : 'Create Account →')}
          </button>
        </form>

        <div style={{ marginTop: 20, padding: 12, background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>🧪 Demo credentials</div>
          <div style={{ fontSize: 12, fontFamily: 'monospace' }}>demo@expiryalert.com / demo1234</div>
        </div>
      </div>
    </div>
  );
}
