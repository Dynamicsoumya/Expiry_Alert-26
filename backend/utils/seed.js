const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Record = require('../models/Record');

const seedData = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expiry-alert');
  
  // Create demo user
  const user = await User.create({
    name: 'Demo Manager',
    email: 'demo@expiryalert.com',
    password: 'demo1234',
    company: 'Acme Corp'
  });

  const today = new Date();
  const records = [
    { name: 'Vendor Contract - TechSupplies Ltd', category: 'Vendor Contract', expiryDate: new Date(today.getTime() + 5 * 86400000), priority: 'critical' },
    { name: 'ISO 9001 Compliance Certificate', category: 'Compliance Certificate', expiryDate: new Date(today.getTime() + 15 * 86400000), priority: 'high' },
    { name: 'Annual Safety Training - Team A', category: 'Safety Training', expiryDate: new Date(today.getTime() + 45 * 86400000), priority: 'medium' },
    { name: 'Commercial Insurance Policy', category: 'Insurance Policy', expiryDate: new Date(today.getTime() - 5 * 86400000), priority: 'critical' },
    { name: 'CNC Machine Inspection Report', category: 'Machine Inspection', expiryDate: new Date(today.getTime() + 90 * 86400000), priority: 'medium' },
    { name: 'Business Operating License', category: 'Government License', expiryDate: new Date(today.getTime() + 180 * 86400000), priority: 'high' },
    { name: 'Q2 Audit Document', category: 'Audit Document', expiryDate: new Date(today.getTime() - 2 * 86400000), priority: 'high' },
    { name: 'Liability Insurance', category: 'Insurance Policy', expiryDate: new Date(today.getTime() + 25 * 86400000), priority: 'high' }
  ].map(r => ({ ...r, user: user._id, issuedBy: 'Demo Issuer', documentNumber: `DOC-${Math.random().toString(36).substr(2, 9).toUpperCase()}` }));

  await Record.insertMany(records);
  console.log('✅ Seed data created! Login: demo@expiryalert.com / demo1234');
  process.exit(0);
};

seedData().catch(err => { console.error(err); process.exit(1); });
