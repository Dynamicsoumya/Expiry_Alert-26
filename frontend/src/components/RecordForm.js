import React, { useState } from 'react';
import { formatDateInput, CATEGORIES, PRIORITIES } from '../utils/helpers';

const RecordForm = ({ initialData = {}, onSubmit, loading, submitLabel = 'Save Record' }) => {
  const [form, setForm] = useState({
    name: initialData.name || '',
    category: initialData.category || '',
    expiryDate: initialData.expiryDate ? formatDateInput(initialData.expiryDate) : '',
    issueDate: initialData.issueDate ? formatDateInput(initialData.issueDate) : '',
    issuedBy: initialData.issuedBy || '',
    documentNumber: initialData.documentNumber || '',
    description: initialData.description || '',
    priority: initialData.priority || 'medium',
    tags: initialData.tags ? initialData.tags.join(', ') : '',
    renewalCost: initialData.renewalCost || '',
    renewalNotes: initialData.renewalNotes || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      tags: form.tags ? form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [],
      renewalCost: form.renewalCost ? parseFloat(form.renewalCost) : null
    };
    onSubmit(data);
  };

  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";
  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📋</span> Basic Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Document Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., Annual Vendor Contract - TechSupplies Ltd"
              className={inputClass}
              required
              maxLength={200}
            />
          </div>

          <div>
            <label className={labelClass}>Category <span className="text-red-500">*</span></label>
            <select name="category" value={form.category} onChange={handleChange} className={inputClass} required>
              <option value="">Select category...</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange} className={inputClass}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Expiry Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Issue Date</label>
            <input
              type="date"
              name="issueDate"
              value={form.issueDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Issued By</label>
            <input
              type="text"
              name="issuedBy"
              value={form.issuedBy}
              onChange={handleChange}
              placeholder="e.g., HDFC Ergo, Bureau Veritas"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Document Number</label>
            <input
              type="text"
              name="documentNumber"
              value={form.documentNumber}
              onChange={handleChange}
              placeholder="e.g., VEN-2024-001"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📝</span> Additional Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description of this document..."
              rows={3}
              className={`${inputClass} resize-none`}
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1">{form.description.length}/500</p>
          </div>

          <div>
            <label className={labelClass}>Tags</label>
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="vendor, contract, annual (comma-separated)"
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1">Separate with commas for easy search</p>
          </div>

          <div>
            <label className={labelClass}>Renewal Cost (₹)</label>
            <input
              type="number"
              name="renewalCost"
              value={form.renewalCost}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Renewal Notes</label>
            <textarea
              name="renewalNotes"
              value={form.renewalNotes}
              onChange={handleChange}
              placeholder="Steps to renew, contact person, special instructions..."
              rows={2}
              className={`${inputClass} resize-none`}
              maxLength={500}
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Saving...
          </>
        ) : (
          <>💾 {submitLabel}</>
        )}
      </button>
    </form>
  );
};

export default RecordForm;
