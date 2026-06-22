const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  record: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Record'
  },
  type: {
    type: String,
    enum: ['expiry_warning', 'expired', 'renewed', 'added'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
