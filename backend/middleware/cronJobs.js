const cron = require('node-cron');
const Record = require('../models/Record');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Run every day at 8 AM
cron.schedule('0 8 * * *', async () => {
  console.log('🔔 Running expiry check cron job...');
  
  try {
    const records = await Record.find({ isArchived: false, status: { $ne: 'Renewed' } })
      .populate('createdBy');

    for (const record of records) {
      const days = record.daysUntilExpiry;
      
      // Update status
      let newStatus = 'Active';
      if (days < 0) newStatus = 'Expired';
      else if (days <= 30) newStatus = 'Expiring Soon';
      
      if (record.status !== newStatus && record.status !== 'Renewed') {
        record.status = newStatus;
        await record.save();
      }

      // Send notifications
      const user = record.createdBy;
      if (!user) continue;
      
      const alertDays = user.notificationPreferences?.daysBeforeExpiry || [30, 14, 7, 1];
      
      if (alertDays.includes(days)) {
        const alreadySent = record.notificationsSent.find(n => n.daysBeforeExpiry === days);
        if (!alreadySent) {
          await Notification.create({
            user: user._id,
            record: record._id,
            type: days < 0 ? 'expired' : 'expiry_warning',
            title: days < 0 ? `${record.name} has expired!` : `${record.name} expires in ${days} day(s)`,
            message: `Document "${record.name}" (${record.category}) ${days < 0 ? 'expired on' : 'expires on'} ${new Date(record.expiryDate).toLocaleDateString()}.`
          });
          
          record.notificationsSent.push({ sentAt: new Date(), daysBeforeExpiry: days });
          await record.save();
        }
      }
    }
    console.log('✅ Expiry check complete');
  } catch (err) {
    console.error('❌ Cron job error:', err);
  }
});
