const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Comment message is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    attachments: [
      {
        filename: String,
        mimetype: String,
        size: Number,
        data: String, // Base64 encoded file data
      },
    ],
    isInternal: {
      type: Boolean,
      default: false,
      comment: 'Internal notes visible only to agents and admins',
    },
    editedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
commentSchema.index({ ticketId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
