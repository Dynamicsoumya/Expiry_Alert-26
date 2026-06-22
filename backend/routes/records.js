const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getRecords, getRecord, createRecord, updateRecord,
  deleteRecord, archiveRecord, getStats, getExpiryTimeline
} = require('../controllers/recordController');

router.use(protect);
router.get('/stats', getStats);
router.get('/timeline', getExpiryTimeline);
router.route('/').get(getRecords).post(createRecord);
router.route('/:id').get(getRecord).put(updateRecord).delete(deleteRecord);
router.put('/:id/archive', archiveRecord);

module.exports = router;
