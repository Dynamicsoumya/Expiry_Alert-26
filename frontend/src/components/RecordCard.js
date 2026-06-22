import React from 'react';
import { getDaysUntilExpiry, getDaysPillClass, formatDays, formatDate, CATEGORY_ICONS, CATEGORY_COLORS } from '../utils/helpers';

export default function RecordCard({ record, onEdit, onDelete, onArchive }) {
  const days = getDaysUntilExpiry(record.expiryDate);
  const pillClass = getDaysPillClass(days);
  const barPercent = days < 0 ? 100 : days > 365 ? 5 : Math.max(5, 100 - (days / 365 * 100));
  const barColor = days < 0 ? '#EF4444' : days <= 7 ? '#FF3D3D' : days <= 30 ? '#F59E0B' : '#22C55E';

  return (
    <tr className="fade-in">
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>{CATEGORY_ICONS[record.category] || '📁'}</span>
          <div>
            <div className="font-semibold truncate" style={{ maxWidth: 200 }}>{record.name}</div>
            {record.documentNumber && <div className="text-xs text-muted">{record.documentNumber}</div>}
          </div>
        </div>
      </td>
      <td>
        <span className="badge" style={{
          background: CATEGORY_COLORS[record.category] + '20',
          color: CATEGORY_COLORS[record.category],
          border: `1px solid ${CATEGORY_COLORS[record.category]}40`
        }}>
          {record.category}
        </span>
      </td>
      <td>
        <div className="text-sm">{formatDate(record.expiryDate)}</div>
        <div style={{ marginTop: 4 }}>
          <div className="expiry-bar" style={{ width: 80 }}>
            <div className="expiry-fill" style={{ width: `${barPercent}%`, background: barColor }} />
          </div>
        </div>
      </td>
      <td>
        <span className={`days-pill ${pillClass}`}>{formatDays(days)}</span>
      </td>
      <td>
        <span className={`badge badge-${record.priority}`}>{record.priority}</span>
      </td>
      <td>
        {record.assignedTo ? <span className="text-sm">{record.assignedTo}</span> : <span className="text-dim">—</span>}
      </td>
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn-icon" title="Edit" onClick={() => onEdit(record)}>✏️</button>
          <button className="btn-icon" title="Archive" onClick={() => onArchive(record._id)}>📦</button>
          <button className="btn-icon" title="Delete" onClick={() => {
            if (window.confirm('Delete this record?')) onDelete(record._id);
          }} style={{ color: 'var(--danger)' }}>🗑️</button>
        </div>
      </td>
    </tr>
  );
}
