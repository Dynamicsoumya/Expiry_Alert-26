import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';

export default function Header({ title, actions }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnread(res.data.unreadCount);
    } catch {}
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setUnread(0);
    setNotifications(n => n.map(x => ({ ...x, isRead: true })));
  };

  const typeIcon = { expiry_warning: '⏰', expired: '🔴', renewed: '✅', added: '➕' };

  return (
    <header className="header">
      <h1 className="header-title">{title}</h1>
      <div className="header-actions">
        {actions}
        <div className="notif-dropdown" ref={panelRef}>
          <button className="btn-icon notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
            🔔
            {unread > 0 && <span className="notif-count">{unread > 9 ? '9+' : unread}</span>}
          </button>
          {notifOpen && (
            <div className="notif-panel">
              <div className="notif-header">
                <strong>Notifications</strong>
                {unread > 0 && <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>}
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No notifications</div>
                ) : notifications.map(n => (
                  <div key={n._id} className={`notif-item${n.isRead ? '' : ' unread'}`}
                    onClick={() => { navigate('/records'); setNotifOpen(false); }}>
                    <div className="notif-msg">{typeIcon[n.type]} {n.message}</div>
                    <div className="notif-time">{formatDate(n.createdAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
