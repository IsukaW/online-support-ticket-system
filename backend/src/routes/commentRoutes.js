const express = require('express');
const router = express.Router();
const {
  addComment,
  getCommentsByTicket,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { upload, uploadToCloudinary } = require('../middleware/upload');
const {
  addCommentSchema,
  updateCommentSchema,
} = require('../validations/commentValidation');

// All routes require authentication
router.use(protect);

router.post(
  '/',
  upload.array('attachments', 3),
  uploadToCloudinary,
  validateRequest(addCommentSchema),
  addComment
);
router.get('/ticket/:ticketId', getCommentsByTicket);
router.put('/:id', validateRequest(updateCommentSchema), updateComment);
router.delete('/:id', deleteComment);

module.exports = router;
