const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide amount'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'usd',
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    gateway: {
      type: String,
      enum: ['stripe', 'paypal', 'manual'],
      required: true,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    paymentIntentId: {
      type: String,
    },
    metadata: {
      type: Map,
      of: String,
    },
    refundReason: String,
    refundedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for queries
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ ticketId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
