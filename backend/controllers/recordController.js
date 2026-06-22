const Record = require('../models/Record');
const Notification = require('../models/Notification');

exports.getRecords = async (req, res) => {
  try {
    const { status, category, search, sort, page = 1, limit = 20, priority, archived } = req.query;
    
    const query = { user: req.user.id };
    if (!archived || archived === 'false') query.isArchived = false;
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { issuedBy: { $regex: search, $options: 'i' } },
        { documentNumber: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Recalculate status for all records dynamically
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sortMap = {
      'expiry_asc': { expiryDate: 1 },
      'expiry_desc': { expiryDate: -1 },
      'name_asc': { name: 1 },
      'name_desc': { name: -1 },
      'created_desc': { createdAt: -1 },
      'priority': { priority: -1 }
    };
    const sortObj = sortMap[sort] || { expiryDate: 1 };

    const total = await Record.countDocuments(query);
    const records = await Record.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: records.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      records
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRecord = async (req, res) => {
  try {
    const record = await Record.findOne({ _id: req.params.id, user: req.user.id });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createRecord = async (req, res) => {
  try {
    req.body.user = req.user.id;
    const record = await Record.create(req.body);
    
    // Create notification
    await Notification.create({
      user: req.user.id,
      record: record._id,
      type: 'added',
      message: `New record added: "${record.name}" (expires ${new Date(record.expiryDate).toLocaleDateString()})`
    });

    res.status(201).json({ success: true, record });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateRecord = async (req, res) => {
  try {
    let record = await Record.findOne({ _id: req.params.id, user: req.user.id });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    // Add to history
    req.body.history = [...(record.history || []), {
      action: 'updated',
      by: req.user.name || req.user.email,
      note: req.body.updateNote || 'Record updated'
    }];
    delete req.body.updateNote;

    record = await Record.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, record });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const record = await Record.findOne({ _id: req.params.id, user: req.user.id });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    await record.deleteOne();
    res.json({ success: true, message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.archiveRecord = async (req, res) => {
  try {
    const record = await Record.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isArchived: true },
      { new: true }
    );
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in30Days = new Date(today);
    in30Days.setDate(in30Days.getDate() + 30);
    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);

    const [total, expired, expiringSoon, expiringIn7, active, byCategory, byPriority] = await Promise.all([
      Record.countDocuments({ user: userId, isArchived: false }),
      Record.countDocuments({ user: userId, isArchived: false, expiryDate: { $lt: today } }),
      Record.countDocuments({ user: userId, isArchived: false, expiryDate: { $gte: today, $lte: in30Days } }),
      Record.countDocuments({ user: userId, isArchived: false, expiryDate: { $gte: today, $lte: in7Days } }),
      Record.countDocuments({ user: userId, isArchived: false, expiryDate: { $gt: in30Days } }),
      Record.aggregate([
        { $match: { user: require('mongoose').Types.ObjectId.createFromHexString(userId.toString()), isArchived: false } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Record.aggregate([
        { $match: { user: require('mongoose').Types.ObjectId.createFromHexString(userId.toString()), isArchived: false } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      stats: { total, expired, expiringSoon, expiringIn7, active, byCategory, byPriority }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getExpiryTimeline = async (req, res) => {
  try {
    const records = await Record.find({ user: req.user.id, isArchived: false })
      .select('name category expiryDate status priority')
      .sort({ expiryDate: 1 })
      .limit(50);
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
