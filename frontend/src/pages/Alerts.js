import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatDate, getDaysLabel, getStatusColor } from '../utils/helpers';
import './Alerts.css';

export default function Alerts() {
  const [data, setData] = useState({ notifications: [], unreadCount: 0 });
  const [expiring, setExpiring] = useState([]);
  const [tab, setTab] = useState('urgent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/notifications'),
      api.get('/records/expiring?days=60')
    ]).then(([nRes, eRes]) => {
      setData(nRes.data);
      setExpiring(eRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const markRead = async () => {
    try {
      await api.put('/notifications/mark-read');
      setData(prev => ({ ...prev, unreadCount: 0, notifications: prev.notifications.map(n => ({ ...n, isRead: true })) }));
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed'); }
  };

  const critical = expiring.filter(r => r.daysUntilExpiry <= 7);
  const soon = expiring.filter(r => r.daysUntilExpiry > 7 && r.daysUntilExpiry <= 30);
  const upcoming = expiring.filter(r => r.daysUntilExpiry > 30);

  if (loading) return <div className="page-loading">Loading alerts...</div>;

  return (
    <div className="alerts-page">
      <div className="page-header">
        <div>
          <h1>Alerts & Notifications</h1>
          <p>Monitor critical expirations and stay ahead of renewals</p>
        </div>
      </div>

      <div className="alerts-summary">
        <div className="alert-stat critical"><div className="as-num">{critical.length}</div><div className="as-label">Critical (≤7 days)</div></div>
        <div className="alert-stat warning"><div className="as-num">{soon.length}</div><div className="as-label">Expiring Soon (≤30 days)</div></div>
        <div className="alert-stat info"><div className="as-num">{upcoming.length}</div><div className="as-label">Upcoming (31-60 days)</div></div>
        <div className="alert-stat neutral"><div className="as-num">{data.unreadCount}</div><div className="as-label">Unread Notifications</div></div>
      </div>

      <div className="alerts-tabs">
        <button className={tab === 'urgent' ? 'active' : ''} onClick={() => setTab('urgent')}>🚨 Urgent ({critical.length})</button>
        <button className={tab === 'soon' ? 'active' : ''} onClick={() => setTab('soon')}>⚠️ Soon ({soon.length})</button>
        <button className={tab === 'upcoming' ? 'active' : ''} onClick={() => setTab('upcoming')}>📅 Upcoming ({upcoming.length})</button>
        <button className={tab === 'notifications' ? 'active' : ''} onClick={() => setTab('notifications')}>
          🔔 Notifications {data.unreadCount > 0 && <span className="notif-badge">{data.unreadCount}</span>}
        </button>
      </div>

      {tab === 'notifications' && (
        <div className="notif-section">
          {data.unreadCount > 0 && <button className="btn-mark-read" onClick={markRead}>Mark all as read</button>}
          {data.notifications.length === 0 ? (
            <div className="empty-state-box">🔔 No notifications yet</div>
          ) : (
            <div className="notif-list">
              {data.notifications.map(n => (
                <div key={n._id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
                  <div className="notif-dot"></div>
                  <div>
                    <div className="notif-msg">{n.message}</div>
                    <div className="notif-time">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab !== 'notifications' && (
        <div className="record-alerts">
          {(tab === 'urgent' ? critical : tab === 'soon' ? soon : upcoming).length === 0 ? (
            <div className="empty-state-box">
              {tab === 'urgent' ? '✅ No critical records!' : tab === 'soon' ? '👍 Nothing expiring soon!' : '📅 No upcoming expirations in 60 days'}
            </div>
          ) : (
            <div className="alert-records-grid">
              {(tab === 'urgent' ? critical : tab === 'soon' ? soon : upcoming).map(r => {
                const sc = getStatusColor(r.status);
                return (
                  <Link to={`/records/${r._id}`} key={r._id} className={`alert-record-card ${tab === 'urgent' ? 'urgent' : ''}`}>
                    <div className="arc-top">
                      <span className="arc-name">{r.name}</span>
                      <span className="status-badge" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                        {getDaysLabel(r.daysUntilExpiry)}
                      </span>
                    </div>
                    <div className="arc-cat">{r.category}</div>
                    <div className="arc-date">📅 {formatDate(r.expiryDate)}</div>
                    {r.owner && <div className="arc-owner">👤 {r.owner}</div>}
                    <div className="arc-action">View & Renew →</div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
