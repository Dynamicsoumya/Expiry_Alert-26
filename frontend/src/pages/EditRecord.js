import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './RecordForm.css';

const CATEGORIES = ['Vendor Contract','Compliance Certificate','Safety Training','Insurance Policy','Machine Inspection','Government License','Audit Document','Other'];

export default function EditRecord() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);

  useEffect(() => {
    axios.get(`/api/records/${id}`)
      .then(res => {
        const r = res.data;
        setForm({
          name: r.name || '',
          category: r.category || '',
          expiryDate: r.expiryDate ? r.expiryDate.split('T')[0] : '',
          issueDate: r.issueDate ? r.issueDate.split('T')[0] : '',
          description: r.description || '',
          vendor: r.vendor || '',
          documentNumber: r.documentNumber || '',
          renewalCost: r.renewalCost || '',
          renewalContact: r.renewalContact || '',
          notes: r.notes || '',
          tags: r.tags?.join(', ') || ''
        });
      })
      .catch(() => toast.error('Failed to load record'))
      .finally(() => setFetching(false));
  }, [id]);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'tags') fd.append(k, JSON.stringify(v.split(',').map(t => t.trim()).filter(Boolean)));
        else if (v !== '') fd.append(k, v);
      });
      if (file) fd.append('file', file);
      await axios.put(`/api/records/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Record updated!');
      navigate(`/records/${id}`);
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="record-form-page fade-in">
      <div className="page-header">
        <Link to={`/records/${id}`} className="back-link">← Back to Record</Link>
        <h1>Edit Record</h1>
        <p>Update document details</p>
      </div>

      <form onSubmit={handleSubmit} className="record-form card">
        <div className="form-section">
          <h3 className="form-section-title">📋 Document Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Document Name <span className="required">*</span></label>
              <input className="form-input" value={form.name || ''} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category <span className="required">*</span></label>
              <select className="form-input" value={form.category || ''} onChange={set('category')} required>
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Date <span className="required">*</span></label>
              <input type="date" className="form-input" value={form.expiryDate || ''} onChange={set('expiryDate')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Issue Date</label>
              <input type="date" className="form-input" value={form.issueDate || ''} onChange={set('issueDate')} />
            </div>
            <div className="form-group">
              <label className="form-label">Document Number</label>
              <input className="form-input" value={form.documentNumber || ''} onChange={set('documentNumber')} />
            </div>
            <div className="form-group">
              <label className="form-label">Vendor / Issuer</label>
              <input className="form-input" value={form.vendor || ''} onChange={set('vendor')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} value={form.description || ''} onChange={set('description')} />
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">🔄 Renewal Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Renewal Cost (₹)</label>
              <input type="number" className="form-input" value={form.renewalCost || ''} onChange={set('renewalCost')} />
            </div>
            <div className="form-group">
              <label className="form-label">Renewal Contact</label>
              <input className="form-input" value={form.renewalContact || ''} onChange={set('renewalContact')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input className="form-input" value={form.tags || ''} onChange={set('tags')} />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={3} value={form.notes || ''} onChange={set('notes')} />
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">📎 Replace Document</h3>
          <div className="file-upload-area" onClick={() => document.getElementById('file-input-edit').click()}>
            <input id="file-input-edit" type="file" hidden onChange={e => setFile(e.target.files[0])} />
            {file ? <p className="file-name">📎 {file.name}</p> : <p className="upload-text">Click to upload a new file (optional)</p>}
          </div>
        </div>

        <div className="form-actions">
          <Link to={`/records/${id}`} className="btn btn-outline">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : '✓ Update Record'}
          </button>
        </div>
      </form>
    </div>
  );
}
