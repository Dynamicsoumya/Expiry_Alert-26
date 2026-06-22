const nodemailer = require('nodemailer');
const Record = require('../models/Record');
const Notification = require('../models/Notification');
const User = require('../models/User');

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const getEmailTemplate = (user, records, daysLabel) => {
  const recordRows = records.map(r => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #eee;">${r.name}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;">${r.category}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;color:${r.daysUntilExpiry <= 0 ? '#dc2626' : r.daysUntilExpiry <= 7 ? '#d97706' : '#2563eb'}">
        ${r.daysUntilExpiry <= 0 ? 'EXPIRED' : `${r.daysUntilExpiry} days`}
      </td>
      <td style="padding:12px;border-bottom:1px solid #eee;">${new Date(r.expiryDate).toLocaleDateString('en-IN')}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:30px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="color:white;margin:0;font-size:24px;">⏰ Expiry Alert</h1>
        <p style="color:#bfdbfe;margin:8px 0 0;">Document Expiry Notification</p>
      </div>
      <div style="background:#f8fafc;padding:30px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
        <p style="color:#374151;">Hi <strong>${user.name}</strong>,</p>
        <p style="color:#374151;">The following documents require your immediate attention:</p>
        <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background:#1e40af;color:white;">
              <th style="padding:12px;text-align:left;">Document Name</th>
              <th style="padding:12px;text-align:left;">Category</th>
              <th style="padding:12px;text-align:left;">Status</th>
              <th style="padding:12px;text-align:left;">Expiry Date</th>
            </tr>
          </thead>
          <tbody>${recordRows}</tbody>
        </table>
        <div style="text-align:center;margin-top:24px;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" 
             style="background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
            View Dashboard →
          </a>
        </div>
        <p style="color:#6b7280;font-size:12px;margin-top:24px;text-align:center;">
          This is an automated notification from Expiry Alert '26. 
          You can manage your notification preferences in your account settings.
        </p>
      </div>
    </body>
    </html>
  `;
};

const sendExpiryNotifications = async () => {
  try {
    const transporter = createTransporter();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkDays = [1, 7, 14, 30];
    
    for (const days of checkDays) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + days);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const records = await Record.find({
        expiryDate: { $gte: targetDate, $lt: nextDay },
        isArchived: false,
        status: { $ne: 'renewed' }
      }).populate('user', 'name email notificationPreferences');
      
      for (const record of records) {
        const user = record.user;
        if (!user || !user.notificationPreferences?.email) continue;
        if (!user.notificationPreferences.daysBeforeExpiry?.includes(days)) continue;
        
        // Check if notification already sent for this period
        const alreadySent = record.notificationsSent?.some(n => n.daysBefore === days);
        if (alreadySent) continue;
        
        // Create in-app notification
        await Notification.create({
          user: user._id,
          record: record._id,
          type: 'expiry_warning',
          title: `Document expiring in ${days} day${days > 1 ? 's' : ''}`,
          message: `"${record.name}" (${record.category}) expires on ${new Date(record.expiryDate).toLocaleDateString('en-IN')}`,
          daysUntilExpiry: days
        });
        
        // Send email if configured
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
          try {
            await transporter.sendMail({
              from: `"Expiry Alert '26" <${process.env.EMAIL_USER}>`,
              to: user.email,
              subject: `⚠️ Document Expiry Alert: ${record.name} expires in ${days} day${days > 1 ? 's' : ''}`,
              html: getEmailTemplate(user, [record], `${days} day${days > 1 ? 's' : ''}`)
            });
            
            // Mark notification as sent
            record.notificationsSent.push({ daysBefore: days, sentAt: new Date() });
            await record.save();
          } catch (emailError) {
            console.error(`Failed to send email to ${user.email}:`, emailError.message);
          }
        }
      }
    }
    
    console.log('✅ Expiry notifications processed successfully');
  } catch (error) {
    console.error('❌ Error sending expiry notifications:', error);
  }
};

module.exports = { sendExpiryNotifications };
