const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/User');
const Record = require('../models/Record');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expiry-alert');
  await User.deleteMany({});
  await Record.deleteMany({});

  const user = new User({ name: 'Admin User', email: 'admin@expiry.com', password: 'password123', company: 'Demo Corp', role: 'admin' });
  await user.save();

  const now = new Date();
  const records = [
    { name: 'Deloitte Vendor Contract', category: 'Vendor Contract', expiryDate: new Date(now.getTime() + 5 * 86400000), priority: 'critical', owner: 'Procurement', description: 'Annual consulting agreement' },
    { name: 'Fire Safety Certificate', category: 'Safety Training', expiryDate: new Date(now.getTime() + 15 * 86400000), priority: 'high', owner: 'Safety Officer' },
    { name: 'ISO 9001 Compliance', category: 'Compliance Certificate', expiryDate: new Date(now.getTime() + 25 * 86400000), priority: 'high', owner: 'Quality Team' },
    { name: 'Property Insurance', category: 'Insurance Policy', expiryDate: new Date(now.getTime() + 45 * 86400000), priority: 'medium', owner: 'Finance' },
    { name: 'Boiler Inspection', category: 'Machine Inspection', expiryDate: new Date(now.getTime() + 60 * 86400000), priority: 'medium', owner: 'Engineering' },
    { name: 'Import-Export License', category: 'Government License', expiryDate: new Date(now.getTime() + 90 * 86400000), priority: 'high', owner: 'Legal' },
    { name: 'KPMG Audit Report', category: 'Audit Document', expiryDate: new Date(now.getTime() - 5 * 86400000), priority: 'critical', owner: 'Finance' },
    { name: 'PwC Tax Compliance', category: 'Compliance Certificate', expiryDate: new Date(now.getTime() - 10 * 86400000), priority: 'high', owner: 'Tax Team' },
    { name: 'EY Consulting Contract', category: 'Vendor Contract', expiryDate: new Date(now.getTime() + 120 * 86400000), priority: 'medium', owner: 'Procurement' },
    { name: 'Crane Safety Inspection', category: 'Machine Inspection', expiryDate: new Date(now.getTime() + 180 * 86400000), priority: 'low', owner: 'Operations' },
  ];
  for (const r of records) await Record.create({ ...r, user: user._id });
  console.log('Seeded! Login: admin@expiry.com / password123');
  process.exit(0);
};
seed().catch(err => { console.error(err); process.exit(1); });
