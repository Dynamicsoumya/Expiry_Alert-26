const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const CATEGORIES = [
  { name: 'Vendor Contract', icon: '📄', color: '#3B82F6' },
  { name: 'Compliance Certificate', icon: '✅', color: '#10B981' },
  { name: 'Safety Training', icon: '🦺', color: '#F59E0B' },
  { name: 'Insurance Policy', icon: '🛡️', color: '#8B5CF6' },
  { name: 'Machine Inspection', icon: '⚙️', color: '#EF4444' },
  { name: 'Government License', icon: '🏛️', color: '#0EA5E9' },
  { name: 'Audit Document', icon: '📊', color: '#EC4899' },
  { name: 'Other', icon: '📁', color: '#6B7280' }
];

router.get('/', protect, (req, res) => {
  res.json({ success: true, categories: CATEGORIES });
});

module.exports = router;
