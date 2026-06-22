import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './RecordForm.css';

const CATEGORIES = ['Vendor Contract','Compliance Certificate','Safety Training','Insurance Policy','Machine Inspection','Government License','Audit Document','Other'];

export default function AddRecord() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', category: '', expiryDate: '', issueDate: '', description: '',
    vendor: '', documentNumber: '', renewalCost: '', renewalContact: '', notes: '', tags: ''
  });
  const [file, setFile] = useState(null);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.expiryDate) {
      return toast.error('Please fill in all required fields');
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'tags') fd.append(k, JSON.stringify(v.split(',').map(t => t.trim()).filter(Boolean)));
        else if (v) fd.append(k, v);
      });
      if (file) fd.append('file', file);

      await axios.post('/api/records', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Record added successfully!');
      navigate('/records');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="record-form-page fade-in">
      <div className="page-header">
        <div>
          <Link to="/records" className="back-link">← Records</Link>
          <h1>Add New Record</h1>
          <p>Track a new document's expiry date</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="record-form card">
        <div className="form-section">
          <h3 className="form-section-title">📋 Document Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Document Name <span className="required">*</span></label>
              <input className="form-input" placeholder="e.g. Vendor Contract - Tata Steel" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category <span className="required">*</span></label>
              <select className="form-input" value={form.category} onChange={set('category')} required>
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Date <span className="required">*</span></label>
              <input type="date" className="form-input" value={form.expiryDate} onChange={set('expiryDate')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Issue Date</label>
              <input type="date" className="form-input" value={form.issueDate} onChange={set('issueDate')} />
            </div>
            <div className="form-group">
              <label className="form-label">Document Number</label>
              <input className="form-input" placeholder="e.g. DOC-2024-001" value={form.documentNumber} onChange={set('documentNumber')} />
            </div>
            <div className="form-group">
              <label className="form-label">Vendor / Issuer</label>
              <input className="form-input" placeholder="e.g. Deloitte India" value={form.vendor} onChange={set('vendor')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} placeholder="Brief description of this document..." value={form.description} onChange={set('description')} />
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">🔄 Renewal Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Renewal Cost (₹)</label>
              <input type="number" className="form-input" placeholder="0" value={form.renewalCost} onChange={set('renewalCost')} />
            </div>
            <div className="form-group">
              <label className="form-label">Renewal Contact</label>
              <input className="form-input" placeholder="Contact email or phone" value={form.renewalContact} onChange={set('renewalContact')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input className="form-input" placeholder="e.g. critical, Q1, finance" value={form.tags} onChange={set('tags')} />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={3} placeholder="Any additional notes..." value={form.notes} onChange={set('notes')} />
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">📎 Document Upload</h3>
          <div className="file-upload-area" onClick={() => document.getElementById('file-input').click()}>
            <input id="file-input" type="file" hidden onChange={e => setFile(e.target.files[0])} accept=".pdf,.doc,.docx,.jpg,.png" />
            {file ? (
              <div>
                <p className="file-name">📎 {file.name}</p>
                <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="upload-icon">☁️</p>
                <p className="upload-text">Click to upload document</p>
                <p className="upload-hint">PDF, DOC, DOCX, JPG, PNG (max 10MB)</p>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <Link to="/records" className="btn btn-outline">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : '✓ Save Record'}
          </button>
        </div>
      </form>
    </div>
  );
}
