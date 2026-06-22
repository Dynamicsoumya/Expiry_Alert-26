import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { CATEGORIES, PRIORITIES } from '../utils/helpers';
import './RecordForm.css';

export default function RecordForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '', category: CATEGORIES[0], expiryDate: '', issueDate: '',
    description: '', owner: '', documentNumber: '', priority: 'medium',
    tags: '', renewalCost: '', renewalNotes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/records/${id}`).then(res => {
        const r = res.data;
        setForm({
          name: r.name || '', category: r.category || CATEGORIES[0],
          expiryDate: r.expiryDate ? r.expiryDate.split('T')[0] : '',
          issueDate: r.issueDate ? r.issueDate.split('T')[0] : '',
          description: r.description || '', owner: r.owner || '',
          documentNumber: r.documentNumber || '', priority: r.priority || 'medium',
          tags: (r.tags || []).join(', '), renewalCost: r.renewalCost || '',
          renewalNotes: r.renewalNotes || ''
        });
      }).catch(() => toast.error('Failed to load record'));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.expiryDate) return toast.error('Name and expiry date are required');
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        renewalCost: form.renewalCost ? Number(form.renewalCost) : undefined
      };
      if (isEdit) {
        await api.put(`/records/${id}`, payload);
        toast.success('Record updated!');
      } else {
        await api.post('/records', payload);
        toast.success('Record added!');
      }
      navigate('/records');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="form-page">
      <div className="form-header">
        <Link to="/records" className="back-link">← Back to Records</Link>
        <h1>{isEdit ? 'Edit Record' : 'Add New Record'}</h1>
        <p>{isEdit ? 'Update the record details below' : 'Fill in the details to track a new document'}</p>
      </div>

      <form onSubmit={handleSubmit} className="record-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Record Name *</label>
              <input type="text" placeholder="e.g. Deloitte Vendor Contract 2026" value={form.name}
                onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Expiry Date *</label>
              <input type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Issue Date</label>
              <input type="date" value={form.issueDate} onChange={e => set('issueDate', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Owner / Responsible Person</label>
              <input type="text" placeholder="e.g. Procurement Team" value={form.owner}
                onChange={e => set('owner', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Document Number</label>
              <input type="text" placeholder="e.g. VND-2026-001" value={form.documentNumber}
                onChange={e => set('documentNumber', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows={3} placeholder="Brief description of this record..." value={form.description}
              onChange={e => set('description', e.target.value)} />
          </div>
        </div>

        <div className="form-section">
          <h3>Priority & Tags</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Priority Level</label>
              <div className="priority-selector">
                {PRIORITIES.map(p => (
                  <button type="button" key={p} className={`priority-opt ${form.priority === p ? 'active' : ''} priority-${p}`}
                    onClick={() => set('priority', p)}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input type="text" placeholder="e.g. legal, annual, important" value={form.tags}
                onChange={e => set('tags', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Renewal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Estimated Renewal Cost (₹)</label>
              <input type="number" placeholder="0" value={form.renewalCost}
                onChange={e => set('renewalCost', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Renewal Notes</label>
              <input type="text" placeholder="e.g. Contact vendor 2 weeks before" value={form.renewalNotes}
                onChange={e => set('renewalNotes', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <Link to="/records" className="btn-cancel">Cancel</Link>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Saving...' : (isEdit ? 'Update Record' : 'Add Record')}
          </button>
        </div>
      </form>
    </div>
  );
}
