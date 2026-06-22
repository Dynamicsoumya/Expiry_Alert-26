import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './Notifications.css';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAllRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setNotifications(n => n.map(x => ({ ...x, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch {
      toast.error('Failed');
    }
  };

  const markRead = async (id) => {
    await axios.put(`/api/notifications/${id}/read`);
    setNotifications(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  const getIcon = (days) => {
    if (days <= 0) return '🚨';
    if (days <= 7) return '⚠️';
    if (days <= 14) return '🔔';
    return '📢';
  };

  return (
    <div className="notifications-page fade-in">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>{unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline" onClick={markAllRead}>✓ Mark all read</button>
        )}
      </div>

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : notifications.length === 0 ? (
        <div className="card empty-state" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
          <h3>All caught up!</h3>
          <p style={{ color: 'var(--gray-400)', marginTop: 8 }}>No notifications yet. You'll be alerted when documents are about to expire.</p>
        </div>
      ) : (
        <div className="notif-list card">
          {notifications.map(n => (
            <div
              key={n._id}
              className={`notif-item ${!n.isRead ? 'notif-unread' : ''}`}
              onClick={() => !n.isRead && markRead(n._id)}
            >
              <div className="notif-icon">{getIcon(n.daysUntilExpiry)}</div>
              <div className="notif-body">
                <p className="notif-message">{n.message}</p>
                <div className="notif-meta">
                  <span className="notif-time">{format(new Date(n.createdAt), 'MMM d, yyyy • h:mm a')}</span>
                  {n.record && (
                    <Link to={`/records/${n.record._id}`} className="notif-link" onClick={e => e.stopPropagation()}>
                      View record →
                    </Link>
                  )}
                </div>
              </div>
              {!n.isRead && <div className="notif-dot" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
