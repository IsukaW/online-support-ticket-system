const asyncHandler = require('express-async-handler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');

/**
 * @desc    Create payment intent
 * @route   POST /api/payments/create-intent
 * @access  Private
 */
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { ticketId, amount, currency = 'usd' } = req.body;

  // Verify ticket exists and belongs to user
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  if (ticket.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Create Stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: currency.toLowerCase(),
    metadata: {
      ticketId: ticketId.toString(),
      userId: req.user._id.toString(),
    },
  });

  // Create payment record
  const payment = await Payment.create({
    userId: req.user._id,
    ticketId,
    amount,
    currency: currency.toUpperCase(),
    gateway: 'stripe',
    paymentIntentId: paymentIntent.id,
    status: 'pending',
  });

  res.status(201).json({
    success: true,
    data: {
      payment,
      clientSecret: paymentIntent.client_secret,
    },
    message: 'Payment intent created successfully',
  });
});

/**
 * @desc    Get user payments
 * @route   GET /api/payments
 * @access  Private
 */
const getPayments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { userId: req.user._id };
  
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const payments = await Payment.find(query)
    .populate('ticketId', 'title')
    .sort('-createdAt')
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Payment.countDocuments(query);

  res.json({
    success: true,
    data: payments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get payment by ID
 * @route   GET /api/payments/:id
 * @access  Private
 */
const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('userId', 'name email')
    .populate('ticketId', 'title status');

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  // Check access permissions
  const isOwner = payment.userId._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to view this payment');
  }

  res.json({
    success: true,
    data: payment,
  });
});

/**
 * @desc    Stripe webhook handler
 * @route   POST /api/payments/webhook
 * @access  Public (Stripe)
 */
const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      // Update payment status
      const payment = await Payment.findOne({
        paymentIntentId: paymentIntent.id,
      });

      if (payment) {
        payment.status = 'completed';
        payment.transactionId = paymentIntent.id;
        await payment.save();

        // Update ticket payment status
        const ticket = await Ticket.findById(payment.ticketId);
        if (ticket) {
          ticket.isPaid = true;
          await ticket.save();
        }

        // Create notification
        await Notification.create({
          userId: payment.userId,
          type: 'payment_received',
          message: `Payment of ${payment.amount} ${payment.currency} received`,
          ticketId: payment.ticketId,
        });
      }
      break;

    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object;
      
      const failedPayment = await Payment.findOne({
        paymentIntentId: failedIntent.id,
      });

      if (failedPayment) {
        failedPayment.status = 'failed';
        await failedPayment.save();
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * @desc    Get all payments (Admin)
 * @route   GET /api/payments/admin/all
 * @access  Private (Admin)
 */
const getAllPayments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const payments = await Payment.find(query)
    .populate('userId', 'name email')
    .populate('ticketId', 'title')
    .sort('-createdAt')
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Payment.countDocuments(query);

  res.json({
    success: true,
    data: payments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

module.exports = {
  createPaymentIntent,
  getPayments,
  getPaymentById,
  stripeWebhook,
  getAllPayments,
};
