import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatDate, getDaysLabel, getStatusColor, getPriorityColor, categoryIcons } from '../utils/helpers';
import './RecordDetail.css';

export default function RecordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/records/${id}`).then(res => setRecord(res.data)).catch(() => toast.error('Record not found')).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this record permanently?')) return;
    try { await api.delete(`/records/${id}`); toast.success('Deleted'); navigate('/records'); }
    catch { toast.error('Delete failed'); }
  };

  const handleArchive = async () => {
    try { await api.patch(`/records/${id}/archive`); toast.success('Archived'); navigate('/records'); }
    catch { toast.error('Archive failed'); }
  };

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!record) return <div className="page-error">Record not found. <Link to="/records">Go back</Link></div>;

  const sc = getStatusColor(record.status);
  const isExpiringSoon = record.daysUntilExpiry >= 0 && record.daysUntilExpiry <= 30;
  const isExpired = record.daysUntilExpiry < 0;

  return (
    <div className="detail-page">
      <div className="detail-header">
        <Link to="/records" className="back-link">← Back to Records</Link>
        <div className="detail-title-row">
          <div className="detail-icon">{categoryIcons[record.category]}</div>
          <div>
            <h1>{record.name}</h1>
            <div className="detail-meta">
              <span className="cat-tag">{record.category}</span>
              <span className="status-badge" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                {record.status}
              </span>
              <span style={{ color: getPriorityColor(record.priority), fontSize: 13, fontWeight: 600 }}>
                ● {record.priority} priority
              </span>
            </div>
          </div>
          <div className="detail-actions">
            <Link to={`/records/${id}/edit`} className="btn-edit">✏️ Edit</Link>
            <button className="btn-archive" onClick={handleArchive}>📦 Archive</button>
            <button className="btn-delete" onClick={handleDelete}>🗑️ Delete</button>
          </div>
        </div>
      </div>

      {(isExpired || isExpiringSoon) && (
        <div className={`detail-alert ${isExpired ? 'expired' : 'warning'}`}>
          {isExpired ? '❌' : '⚠️'}
          <strong>{isExpired ? 'This record has expired!' : `Expires in ${record.daysUntilExpiry} days!`}</strong>
          {' — '}{isExpired ? 'Immediate renewal required.' : 'Please take action soon.'}
        </div>
      )}

      <div className="detail-grid">
        <div className="detail-main">
          <div className="detail-card">
            <h3>Record Details</h3>
            <div className="detail-rows">
              <div className="detail-row">
                <span>Expiry Date</span>
                <strong style={{ color: isExpired ? '#dc2626' : isExpiringSoon ? '#d97706' : '#16a34a' }}>
                  {formatDate(record.expiryDate)} ({getDaysLabel(record.daysUntilExpiry)})
                </strong>
              </div>
              {record.issueDate && <div className="detail-row"><span>Issue Date</span><strong>{formatDate(record.issueDate)}</strong></div>}
              {record.owner && <div className="detail-row"><span>Owner</span><strong>{record.owner}</strong></div>}
              {record.documentNumber && <div className="detail-row"><span>Document No.</span><strong>#{record.documentNumber}</strong></div>}
              {record.renewalCost && <div className="detail-row"><span>Renewal Cost</span><strong>₹{record.renewalCost.toLocaleString()}</strong></div>}
              <div className="detail-row"><span>Added</span><strong>{formatDate(record.createdAt)}</strong></div>
            </div>
          </div>

          {record.description && (
            <div className="detail-card">
              <h3>Description</h3>
              <p style={{ color: '#475569', lineHeight: 1.7, fontSize: 14 }}>{record.description}</p>
            </div>
          )}

          {record.renewalNotes && (
            <div className="detail-card">
              <h3>Renewal Notes</h3>
              <p style={{ color: '#475569', lineHeight: 1.7, fontSize: 14 }}>{record.renewalNotes}</p>
            </div>
          )}

          {record.tags?.length > 0 && (
            <div className="detail-card">
              <h3>Tags</h3>
              <div className="tags-list">{record.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
            </div>
          )}
        </div>

        <div className="detail-side">
          <div className="detail-card">
            <h3>Status Overview</h3>
            <div className="status-big" style={{ color: sc.text, background: sc.bg }}>
              <div className="status-number">{Math.abs(record.daysUntilExpiry)}</div>
              <div className="status-unit">days {record.daysUntilExpiry < 0 ? 'overdue' : 'remaining'}</div>
            </div>
          </div>

          {record.history?.length > 0 && (
            <div className="detail-card">
              <h3>Activity History</h3>
              <div className="history-list">
                {record.history.slice(-5).reverse().map((h, i) => (
                  <div key={i} className="history-item">
                    <div className="history-dot"></div>
                    <div>
                      <div className="history-action">{h.action}</div>
                      <div className="history-meta">{h.by} · {formatDate(h.date)}</div>
                      {h.note && <div className="history-note">{h.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
