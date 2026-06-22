import React from 'react';

export default function StatCard({ icon, value, label, sub, color = 'blue', onClick }) {
  return (
    <div className={`stat-card ${color}`} onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
