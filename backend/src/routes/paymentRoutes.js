const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  getPayments,
  getPaymentById,
  stripeWebhook,
  getAllPayments,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const {
  createPaymentIntentSchema,
} = require('../validations/paymentValidation');

// Webhook route (must be before express.json() middleware)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

// Protected routes
router.use(protect);

router.post(
  '/create-intent',
  validateRequest(createPaymentIntentSchema),
  createPaymentIntent
);
router.get('/', getPayments);
router.get('/:id', getPaymentById);

// Admin routes
router.get('/admin/all', authorize('admin'), getAllPayments);

module.exports = router;
