import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, icon, label, badge }) => (
  <NavLink to={to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
    <span className="nav-icon">{icon}</span>
    <span>{label}</span>
    {badge > 0 && <span className="nav-badge">{badge > 99 ? '99+' : badge}</span>}
  </NavLink>
);

export default function Sidebar({ stats }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🔔</div>
        <div>
          <div className="logo-text">ExpiryAlert</div>
          <div className="logo-sub">'26 Edition</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-label">Overview</div>
          <NavItem to="/dashboard" icon="📊" label="Dashboard" />
          <NavItem to="/records" icon="📋" label="All Records" />
        </div>

        <div className="nav-section">
          <div className="nav-section-label">Quick Filters</div>
          <NavItem to="/records?status=expired" icon="🔴" label="Expired" badge={stats?.expired || 0} />
          <NavItem to="/records?status=expiring_soon" icon="🟡" label="Expiring Soon" badge={stats?.expiringSoon || 0} />
          <NavItem to="/records?status=active" icon="🟢" label="Active" />
          <NavItem to="/records?priority=critical" icon="⚠️" label="Critical Priority" />
        </div>

        <div className="nav-section">
          <div className="nav-section-label">Categories</div>
          <NavItem to="/records?category=Vendor+Contract" icon="📄" label="Vendor Contracts" />
          <NavItem to="/records?category=Compliance+Certificate" icon="✅" label="Compliance" />
          <NavItem to="/records?category=Insurance+Policy" icon="🛡️" label="Insurance" />
          <NavItem to="/records?category=Government+License" icon="🏛️" label="Licenses" />
        </div>

        <div className="nav-section">
          <div className="nav-section-label">Account</div>
          <NavItem to="/settings" icon="⚙️" label="Settings" />
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-card" onClick={() => navigate('/settings')}>
          <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.company || user?.email}</div>
          </div>
          <span style={{ marginLeft: 'auto', color: 'var(--text-dim)', fontSize: 12 }}>↗</span>
        </div>
        <button className="btn btn-ghost btn-sm w-full mt-4" style={{ justifyContent: 'center' }} onClick={logout}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
