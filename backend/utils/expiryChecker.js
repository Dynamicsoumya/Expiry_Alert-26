const Record = require('../models/Record');
const Notification = require('../models/Notification');

exports.checkAndNotifyExpiries = async () => {
  console.log('🔍 Running expiry check...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkDays = [7, 14, 30];
  
  for (const days of checkDays) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + days);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const records = await Record.find({
      expiryDate: { $gte: targetDate, $lt: nextDay },
      isArchived: false
    });

    for (const record of records) {
      await Notification.create({
        user: record.user,
        record: record._id,
        type: 'expiry_warning',
        message: `"${record.name}" expires in ${days} days (${new Date(record.expiryDate).toLocaleDateString()})`
      });
    }
  }

  // Mark as expired
  await Record.updateMany(
    { expiryDate: { $lt: today }, status: { $ne: 'expired' }, isArchived: false },
    { status: 'expired' }
  );

  console.log('✅ Expiry check complete');
};
