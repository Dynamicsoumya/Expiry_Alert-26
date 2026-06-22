import React, { useState, useEffect } from 'react';
import { CATEGORIES, formatDate } from '../utils/helpers';

const PRIORITIES = ['low', 'medium', 'high', 'critical'];

const defaultForm = {
  name: '', category: '', expiryDate: '', issueDate: '', issuedBy: '',
  documentNumber: '', notes: '', priority: 'medium', tags: '',
  renewalCost: '', assignedTo: ''
};

export default function RecordModal({ record, onClose, onSave }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (record) {
      setForm({
        name: record.name || '',
        category: record.category || '',
        expiryDate: record.expiryDate ? new Date(record.expiryDate).toISOString().split('T')[0] : '',
        issueDate: record.issueDate ? new Date(record.issueDate).toISOString().split('T')[0] : '',
        issuedBy: record.issuedBy || '',
        documentNumber: record.documentNumber || '',
        notes: record.notes || '',
        priority: record.priority || 'medium',
        tags: record.tags ? record.tags.join(', ') : '',
        renewalCost: record.renewalCost || '',
        assignedTo: record.assignedTo || ''
      });
    }
  }, [record]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.category) e.category = 'Category is required';
    if (!form.expiryDate) e.expiryDate = 'Expiry date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        renewalCost: form.renewalCost ? Number(form.renewalCost) : 0
      };
      await onSave(data);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{record ? '✏️ Edit Record' : '➕ Add New Record'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Record Name *</label>
              <input className="form-input" placeholder="e.g. Vendor Contract - Supplier XYZ" value={form.name} onChange={set('name')} />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={form.category} onChange={set('category')}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <div className="form-error">{errors.category}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={form.priority} onChange={set('priority')}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Expiry Date *</label>
                <input className="form-input" type="date" value={form.expiryDate} onChange={set('expiryDate')} />
                {errors.expiryDate && <div className="form-error">{errors.expiryDate}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Issue Date</label>
                <input className="form-input" type="date" value={form.issueDate} onChange={set('issueDate')} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Issued By</label>
                <input className="form-input" placeholder="Issuing authority or person" value={form.issuedBy} onChange={set('issuedBy')} />
              </div>
              <div className="form-group">
                <label className="form-label">Document Number</label>
                <input className="form-input" placeholder="DOC-001234" value={form.documentNumber} onChange={set('documentNumber')} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Assigned To</label>
                <input className="form-input" placeholder="Person responsible" value={form.assignedTo} onChange={set('assignedTo')} />
              </div>
              <div className="form-group">
                <label className="form-label">Renewal Cost (₹)</label>
                <input className="form-input" type="number" placeholder="0" value={form.renewalCost} onChange={set('renewalCost')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input className="form-input" placeholder="compliance, annual, important" value={form.tags} onChange={set('tags')} />
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" placeholder="Additional notes..." value={form.notes} onChange={set('notes')} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving...</> : (record ? 'Update Record' : 'Add Record')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
