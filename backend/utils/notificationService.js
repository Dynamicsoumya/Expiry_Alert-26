const nodemailer = require('nodemailer');
const Record = require('../models/Record');
const Notification = require('../models/Notification');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
    return true;
  } catch (err) {
    console.error('Email error:', err);
    return false;
  }
};

const checkAndNotify = async () => {
  const today = new Date();
  const thresholds = [1, 7, 14, 30];
  
  for (const days of thresholds) {
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + days);
    targetDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);
    
    const records = await Record.find({
      expiryDate: { $gte: targetDate, $lte: endDate },
      isArchived: false
    }).populate('owner');
    
    for (const record of records) {
      const alreadyNotified = record.notificationSentDays && record.notificationSentDays.includes(days);
      if (alreadyNotified) continue;
      
      const message = `"${record.name}" (${record.category}) expires in ${days} day${days > 1 ? 's' : ''} on ${new Date(record.expiryDate).toLocaleDateString()}`;
      
      await Notification.create({
        user: record.owner._id,
        record: record._id,
        type: 'expiry_warning',
        message,
        daysUntilExpiry: days
      });
      
      if (record.owner.notificationPreferences?.email) {
        const emailSent = await sendEmail(
          record.owner.email,
          `⚠️ Expiry Alert: ${record.name} expires in ${days} day${days > 1 ? 's' : ''}`,
          `<div style="font-family:sans-serif;max-width:600px;margin:auto">
            <h2 style="color:#ef4444">🔔 Document Expiry Alert</h2>
            <p>Hello ${record.owner.name},</p>
            <p>This is a reminder that the following document is expiring soon:</p>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px;background:#f3f4f6"><strong>Document</strong></td><td style="padding:8px">${record.name}</td></tr>
              <tr><td style="padding:8px;background:#f3f4f6"><strong>Category</strong></td><td style="padding:8px">${record.category}</td></tr>
              <tr><td style="padding:8px;background:#f3f4f6"><strong>Expiry Date</strong></td><td style="padding:8px">${new Date(record.expiryDate).toLocaleDateString()}</td></tr>
              <tr><td style="padding:8px;background:#f3f4f6"><strong>Days Remaining</strong></td><td style="padding:8px;color:#ef4444"><strong>${days} day${days > 1 ? 's' : ''}</strong></td></tr>
              ${record.renewalContact ? `<tr><td style="padding:8px;background:#f3f4f6"><strong>Renewal Contact</strong></td><td style="padding:8px">${record.renewalContact}</td></tr>` : ''}
            </table>
            <p style="margin-top:20px">Please take immediate action to renew this document.</p>
            <p>Best regards,<br>Expiry Alert System</p>
          </div>`
        );
        
        if (emailSent) {
          await Record.findByIdAndUpdate(record._id, {
            $addToSet: { notificationSentDays: days },
            lastNotifiedAt: new Date()
          });
        }
      }
    }
  }
};

module.exports = { checkAndNotify, sendEmail };
