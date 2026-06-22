/**
 * Seed Script - Creates a demo user with sample records
 * Run: node scripts/seed.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Record = require('../models/Record');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/expiry-alert';

const sampleRecords = [
  { name: 'Tata Steel Vendor Contract', category: 'Vendor Contract', expiryDate: new Date(Date.now() + 5 * 24*60*60*1000), vendor: 'Tata Steel', documentNumber: 'VC-2024-001' },
  { name: 'ISO 9001 Compliance Certificate', category: 'Compliance Certificate', expiryDate: new Date(Date.now() + 15 * 24*60*60*1000), vendor: 'BSI Group', documentNumber: 'ISO-9001-2024' },
  { name: 'Fire Safety Training Record', category: 'Safety Training', expiryDate: new Date(Date.now() + 45 * 24*60*60*1000), vendor: 'Safety First India' },
  { name: 'Property Insurance Policy', category: 'Insurance Policy', expiryDate: new Date(Date.now() - 3 * 24*60*60*1000), vendor: 'HDFC Ergo', documentNumber: 'INS-2024-789' },
  { name: 'Factory License - Maharashtra', category: 'Government License', expiryDate: new Date(Date.now() + 90 * 24*60*60*1000), vendor: 'Maharashtra Govt', documentNumber: 'FL-MH-2024' },
  { name: 'Annual Machine Inspection Report', category: 'Machine Inspection', expiryDate: new Date(Date.now() + 2 * 24*60*60*1000), vendor: 'TechCare Services' },
  { name: 'GST Audit Document FY2024', category: 'Audit Document', expiryDate: new Date(Date.now() + 120 * 24*60*60*1000), vendor: 'Deloitte India' },
  { name: 'EHS Compliance Certificate', category: 'Compliance Certificate', expiryDate: new Date(Date.now() - 10 * 24*60*60*1000), vendor: 'EHS Consultants' },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({ email: 'demo@company.com' });
  
  const user = await User.create({
    name: 'Demo Manager',
    email: 'demo@company.com',
    password: 'demo123',
    company: 'Acme Corporation',
    role: 'manager'
  });
  
  console.log('Created demo user: demo@company.com / demo123');
  
  await Record.deleteMany({ owner: user._id });
  
  for (const r of sampleRecords) {
    await Record.create({ ...r, owner: user._id, organization: user.company });
  }
  
  console.log(`Created ${sampleRecords.length} sample records`);
  console.log('\n✅ Seed complete! Login with: demo@company.com / demo123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
