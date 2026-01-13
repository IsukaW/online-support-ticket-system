const express = require('express');
const router = express.Router();
const { getTicketFile, getCommentFile } = require('../controllers/fileController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/ticket/:ticketId/:attachmentId', getTicketFile);
router.get('/comment/:commentId/:attachmentId', getCommentFile);

module.exports = router;
