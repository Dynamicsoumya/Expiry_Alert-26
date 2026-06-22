const nodemailer = require('nodemailer');
const Record = require('../models/Record');
const Notification = require('../models/Notification');
const User = require('../models/User');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.checkAndNotify = async () => {
  try {
    const users = await User.find({ emailNotifications: true });
    
    for (const user of users) {
      const daysThreshold = user.notifyDaysBefore || 30;
      const threshold = new Date(Date.now() + daysThreshold * 24 * 60 * 60 * 1000);
      const now = new Date();

      const expiring = await Record.find({
        user: user._id,
        isArchived: false,
        expiryDate: { $gte: now, $lte: threshold },
        notificationSent: false
      });

      for (const record of expiring) {
        // Create in-app notification
        await Notification.create({
          user: user._id,
          record: record._id,
          type: 'expiry_warning',
          message: `"${record.name}" expires in ${record.daysUntilExpiry} days (${new Date(record.expiryDate).toLocaleDateString()})`
        });

        // Send email if configured
        if (process.env.EMAIL_USER) {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: `⚠️ Expiry Alert: ${record.name}`,
            html: `
              <h2>Expiry Alert</h2>
              <p>Hi ${user.name},</p>
              <p>The following record will expire soon:</p>
              <table>
                <tr><td><strong>Name:</strong></td><td>${record.name}</td></tr>
                <tr><td><strong>Category:</strong></td><td>${record.category}</td></tr>
                <tr><td><strong>Expiry Date:</strong></td><td>${new Date(record.expiryDate).toLocaleDateString()}</td></tr>
                <tr><td><strong>Days Remaining:</strong></td><td>${record.daysUntilExpiry} days</td></tr>
              </table>
              <p>Please take action to renew this record.</p>
            `
          });
        }

        await Record.findByIdAndUpdate(record._id, {
          notificationSent: true,
          notificationSentAt: new Date()
        });
      }
    }
    console.log('Notification check complete');
  } catch (err) {
    console.error('Notification error:', err);
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate('record', 'name category expiryDate')
      .sort({ createdAt: -1 })
      .limit(50);
    
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
