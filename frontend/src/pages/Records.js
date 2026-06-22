import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import RecordCard from '../components/RecordCard';
import RecordModal from '../components/RecordModal';
import { useRecords } from '../hooks/useRecords';
import { CATEGORIES } from '../utils/helpers';

const SORT_OPTIONS = [
  { value: 'expiry_asc', label: 'Expiry (Soonest)' },
  { value: 'expiry_desc', label: 'Expiry (Latest)' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
  { value: 'created_desc', label: 'Recently Added' },
  { value: 'priority', label: 'Priority' }
];

export default function Records() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(params.get('status') || '');
  const [category, setCategory] = useState(params.get('category') || '');
  const [priority, setPriority] = useState(params.get('priority') || '');
  const [sort, setSort] = useState('expiry_asc');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(params.get('add') === 'true');
  const [editRecord, setEditRecord] = useState(null);

  const { records, loading, pagination, fetchRecords, createRecord, updateRecord, deleteRecord, archiveRecord } = useRecords();

  const load = useCallback(() => {
    fetchRecords({ search, status, category, priority, sort, page, limit: 20 });
  }, [search, status, category, priority, sort, page, fetchRecords]);

  useEffect(() => { load(); }, [load]);

  // Sync URL params
  useEffect(() => {
    setStatus(params.get('status') || '');
    setCategory(params.get('category') || '');
    setPriority(params.get('priority') || '');
    if (params.get('add') === 'true') setShowModal(true);
  }, [location.search]);

  const handleSave = async (data) => {
    if (editRecord) {
      await updateRecord(editRecord._id, data);
    } else {
      await createRecord(data);
    }
    setEditRecord(null);
    load();
  };

  const handleEdit = (record) => {
    setEditRecord(record);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    await deleteRecord(id);
    load();
  };

  const handleArchive = async (id) => {
    await archiveRecord(id);
    load();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditRecord(null);
    if (params.get('add')) navigate('/records', { replace: true });
  };

  const clearFilters = () => {
    setSearch(''); setStatus(''); setCategory(''); setPriority('');
    navigate('/records', { replace: true });
  };

  const hasFilters = search || status || category || priority;

  return (
    <div>
      <Header
        title="📋 All Records"
        actions={
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Record</button>
        }
      />

      <div className="page">
        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              className="form-input"
              placeholder="Search records..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="form-select" style={{ width: 'auto', minWidth: 140 }} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>
          <select className="form-select" style={{ width: 'auto', minWidth: 160 }} value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto', minWidth: 130 }} value={priority} onChange={e => { setPriority(e.target.value); setPage(1); }}>
            <option value="">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select className="form-select" style={{ width: 'auto', minWidth: 160 }} value={sort} onChange={e => setSort(e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>✕ Clear</button>
          )}
        </div>

        {/* Count */}
        {!loading && (
          <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>
            {pagination.total || 0} record{(pagination.total || 0) !== 1 ? 's' : ''}
            {hasFilters ? ' matching filters' : ' total'}
          </div>
        )}

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 12px', borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'var(--accent)' }} />
              <div className="text-muted">Loading records...</div>
            </div>
          ) : records.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{hasFilters ? '🔍' : '📋'}</div>
              <div className="empty-title">{hasFilters ? 'No matching records' : 'No records yet'}</div>
              <div className="empty-desc">{hasFilters ? 'Try adjusting your filters' : 'Add your first document to start tracking'}</div>
              {!hasFilters && <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Record</button>}
              {hasFilters && <button className="btn btn-secondary" onClick={clearFilters}>Clear Filters</button>}
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Record Name</th>
                    <th>Category</th>
                    <th>Expiry Date</th>
                    <th>Time Left</th>
                    <th>Priority</th>
                    <th>Assigned To</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(record => (
                    <RecordCard
                      key={record._id}
                      record={record}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onArchive={handleArchive}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="btn btn-secondary btn-sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {showModal && (
        <RecordModal
          record={editRecord}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
