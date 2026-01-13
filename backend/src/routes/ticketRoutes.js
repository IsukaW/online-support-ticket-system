const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  assignTicket,
  closeTicket,
  reopenTicket,
  getTicketStats,
  getAgentDashboard,
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { upload, uploadToCloudinary } = require('../middleware/upload');
const {
  createTicketSchema,
  updateTicketSchema,
  assignTicketSchema,
} = require('../validations/ticketValidation');

// All routes require authentication
router.use(protect);

// Ticket statistics (Admin/Agent only)
router.get('/stats/overview', authorize('admin', 'agent'), getTicketStats);
router.get('/agent/dashboard', authorize('agent'), getAgentDashboard);

// Main ticket routes
router
  .route('/')
  .get(getTickets)
  .post(
    upload.array('attachments', 5),
    uploadToCloudinary,
    validateRequest(createTicketSchema),
    createTicket
  );

router
  .route('/:id')
  .get(getTicketById)
  .put(validateRequest(updateTicketSchema), updateTicket)
  .delete(authorize('admin'), deleteTicket);

// Ticket actions
router.put(
  '/:id/assign',
  authorize('admin', 'agent'),
  validateRequest(assignTicketSchema),
  assignTicket
);
router.put('/:id/close', closeTicket);
router.put('/:id/reopen', reopenTicket);

module.exports = router;
