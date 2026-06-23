import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Records from './pages/Records';
import Settings from './pages/Settings';
import Login from './pages/Login';

function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) {
      api.get('/records/stats').then(res => setStats(res.data.stats)).catch(() => {});
    }
  }, [user, location.pathname]);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app">
      <Sidebar stats={stats} />
      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/records" element={<Records />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function AuthGuard() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
        <div className="text-muted">Loading ExpiryAlert...</div>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/*" element={<Layout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthGuard />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1A2235', color: '#E8EDF5', border: '1px solid #263352' },
            success: { iconTheme: { primary: '#22C55E', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
