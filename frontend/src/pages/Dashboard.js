import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import { formatDate, getDaysUntilExpiry, formatDays, getDaysPillClass, CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/helpers';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard').then(res => {
      setData(res.data.dashboard);
    }).catch(() => toast.error('Failed to load dashboard'))
    .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 16px', borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'var(--accent)' }} />
        <div className="text-muted">Loading dashboard...</div>
      </div>
    </div>
  );

  if (!data) return null;

  const { summary, expiredRecords, expiringSoon, recentlyAdded, upcomingRenewals, categoryBreakdown } = data;

  const doughnutData = {
    labels: ['Active', 'Expiring Soon', 'Expired'],
    datasets: [{
      data: [summary.active, summary.expiringSoon, summary.expired],
      backgroundColor: ['rgba(34,197,94,0.8)', 'rgba(245,158,11,0.8)', 'rgba(239,68,68,0.8)'],
      borderColor: ['#22C55E', '#F59E0B', '#EF4444'],
      borderWidth: 2
    }]
  };

  const barData = {
    labels: categoryBreakdown.map(c => c._id.split(' ')[0]),
    datasets: [
      { label: 'Active', data: categoryBreakdown.map(c => c.total - c.expired - c.expiringSoon), backgroundColor: 'rgba(34,197,94,0.7)' },
      { label: 'Expiring Soon', data: categoryBreakdown.map(c => c.expiringSoon), backgroundColor: 'rgba(245,158,11,0.7)' },
      { label: 'Expired', data: categoryBreakdown.map(c => c.expired), backgroundColor: 'rgba(239,68,68,0.7)' }
    ]
  };

  const chartOpts = { responsive: true, plugins: { legend: { labels: { color: '#8895B3', font: { size: 11 } } } } };
  const barOpts = { ...chartOpts, scales: { x: { ticks: { color: '#8895B3' }, grid: { color: '#263352' } }, y: { ticks: { color: '#8895B3' }, grid: { color: '#263352' } }, stacked: true } };

  return (
    <div>
      <Header
        title={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, ${user?.name?.split(' ')[0]} 👋`}
        actions={
          <button className="btn btn-primary" onClick={() => navigate('/records?add=true')}>
            + Add Record
          </button>
        }
      />

      <div className="page">
        {/* Alerts */}
        {summary.expired > 0 && (
          <div className="alert alert-danger mb-4">
            ⚠️ <strong>{summary.expired} record{summary.expired > 1 ? 's' : ''} have expired</strong> — immediate attention required!
            <button className="btn btn-sm" style={{ marginLeft: 'auto', background: 'var(--danger)', color: 'white' }} onClick={() => navigate('/records?status=expired')}>
              View All →
            </button>
          </div>
        )}
        {upcomingRenewals.length > 0 && (
          <div className="alert alert-warning mb-4">
            ⏰ <strong>{upcomingRenewals.length} record{upcomingRenewals.length > 1 ? 's' : ''}</strong> expire within 7 days
          </div>
        )}

        {/* Stats */}
        <div className="stat-grid">
          <StatCard icon="📋" value={summary.total} label="Total Records" color="blue" onClick={() => navigate('/records')} />
          <StatCard icon="🟢" value={summary.active} label="Active Records" sub="Documents in good standing" color="green" onClick={() => navigate('/records?status=active')} />
          <StatCard icon="⚠️" value={summary.expiringSoon} label="Expiring Soon" sub="Within next 30 days" color="yellow" onClick={() => navigate('/records?status=expiring_soon')} />
          <StatCard icon="🔴" value={summary.expired} label="Expired" sub="Require immediate renewal" color="red" onClick={() => navigate('/records?status=expired')} />
          <StatCard icon="🚨" value={summary.critical} label="Critical Priority" color="purple" onClick={() => navigate('/records?priority=critical')} />
        </div>

        {/* Charts + Upcoming */}
        <div className="grid-2 mb-6">
          <div className="card">
            <div style={{ marginBottom: 16, fontWeight: 600 }}>📊 Records Overview</div>
            {summary.total > 0 ? (
              <Doughnut data={doughnutData} options={{ ...chartOpts, cutout: '65%' }} />
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <div>No records yet</div>
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ marginBottom: 16, fontWeight: 600 }}>🚨 Needs Immediate Action</div>
            {expiredRecords.length === 0 && upcomingRenewals.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <div style={{ color: 'var(--success)', fontWeight: 600 }}>All clear!</div>
                <div className="text-muted text-sm">No urgent items</div>
              </div>
            ) : (
              <div>
                {[...upcomingRenewals, ...expiredRecords].slice(0, 6).map(r => {
                  const days = getDaysUntilExpiry(r.expiryDate);
                  return (
                    <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <span>{CATEGORY_ICONS[r.category]}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="text-sm font-semibold truncate">{r.name}</div>
                        <div className="text-xs text-muted">{r.category}</div>
                      </div>
                      <span className={`days-pill ${getDaysPillClass(days)}`} style={{ whiteSpace: 'nowrap' }}>{formatDays(days)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <div className="card mb-6">
            <div style={{ marginBottom: 16, fontWeight: 600 }}>📂 By Category</div>
            <Bar data={barData} options={{ ...barOpts, plugins: { ...barOpts.plugins, legend: { ...barOpts.plugins.legend, position: 'top' } } }} />
          </div>
        )}

        {/* Recent Activity */}
        <div className="card">
          <div style={{ marginBottom: 16, fontWeight: 600 }}>🕐 Recently Added</div>
          {recentlyAdded.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-title">No records yet</div>
              <div className="empty-desc">Start by adding your first document</div>
              <button className="btn btn-primary" onClick={() => navigate('/records?add=true')}>+ Add Record</button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Record</th>
                    <th>Category</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentlyAdded.map(r => {
                    const days = getDaysUntilExpiry(r.expiryDate);
                    return (
                      <tr key={r._id}>
                        <td><span className="font-semibold">{r.name}</span></td>
                        <td><span>{CATEGORY_ICONS[r.category]} {r.category}</span></td>
                        <td>{formatDate(r.expiryDate)}</td>
                        <td><span className={`days-pill ${getDaysPillClass(days)}`}>{formatDays(days)}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
