const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Record name is required'],
    trim: true,
    maxlength: [200, 'Name too long']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Vendor Contract',
      'Compliance Certificate',
      'Safety Training',
      'Insurance Policy',
      'Machine Inspection',
      'Government License',
      'Audit Document',
      'Other'
    ]
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  issueDate: {
    type: Date
  },
  issuedBy: {
    type: String,
    default: ''
  },
  documentNumber: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes too long'],
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'expiring_soon', 'expired'],
    default: 'active'
  },
  fileUrl: {
    type: String,
    default: ''
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  renewalCost: {
    type: Number,
    default: 0
  },
  assignedTo: {
    type: String,
    default: ''
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  history: [{
    action: String,
    date: { type: Date, default: Date.now },
    by: String,
    note: String
  }]
}, { timestamps: true });

// Virtual for days until expiry
RecordSchema.virtual('daysUntilExpiry').get(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(this.expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
});

// Auto-compute status before save
RecordSchema.pre('save', function(next) {
  const days = this.daysUntilExpiry;
  if (days < 0) this.status = 'expired';
  else if (days <= 30) this.status = 'expiring_soon';
  else this.status = 'active';
  next();
});

RecordSchema.set('toJSON', { virtuals: true });
RecordSchema.set('toObject', { virtuals: true });

// Indexes
RecordSchema.index({ user: 1, status: 1 });
RecordSchema.index({ user: 1, expiryDate: 1 });
RecordSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Record', RecordSchema);
