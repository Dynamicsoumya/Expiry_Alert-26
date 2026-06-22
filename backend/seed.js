const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Record = require('./models/Record');

const CATEGORIES = ['Vendor Contract', 'Compliance Certificate', 'Safety Training', 'Insurance Policy', 'Machine Inspection', 'Government License', 'Audit Document'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const VENDORS = ['Tata Consultancy', 'Infosys Ltd', 'Wipro Technologies', 'HCL Systems', 'Tech Mahindra', 'L&T Infrastructure', 'Reliance Vendors'];

const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Record.deleteMany({});

  const user = await User.create({
    name: 'Admin User',
    email: 'admin@expiryalert.com',
    password: 'password123',
    company: 'Deloitte India',
    role: 'admin'
  });

  const now = new Date();
  const records = [];
  for (let i = 0; i < 30; i++) {
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const daysOffset = Math.floor(Math.random() * 200) - 30;
    const expiryDate = new Date(now);
    expiryDate.setDate(expiryDate.getDate() + daysOffset);
    
    records.push({
      name: `${category} - ${VENDORS[Math.floor(Math.random() * VENDORS.length)]} ${i+1}`,
      category,
      expiryDate,
      issueDate: randomDate(new Date(2023, 0, 1), now),
      vendor: VENDORS[Math.floor(Math.random() * VENDORS.length)],
      priority: PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)],
      documentNumber: `DOC-2024-${String(i+1).padStart(4, '0')}`,
      amount: Math.floor(Math.random() * 500000) + 10000,
      responsiblePerson: ['Rahul Sharma', 'Priya Singh', 'Amit Kumar', 'Sneha Patel'][Math.floor(Math.random() * 4)],
      notes: 'Auto-generated seed record',
      createdBy: user._id,
      organization: user.company,
      tags: [category.toLowerCase().replace(/ /g, '-')]
    });
  }

  for (const r of records) {
    await new Record(r).save();
  }

  console.log(`✅ Seeded: 1 user, ${records.length} records`);
  console.log('   Email: admin@expiryalert.com');
  console.log('   Password: password123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
