const asyncHandler = require('express-async-handler');
const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');

/**
 * @desc    Get file from ticket attachment
 * @route   GET /api/files/ticket/:ticketId/:attachmentId
 * @access  Private
 */
const getTicketFile = asyncHandler(async (req, res) => {
  const { ticketId, attachmentId } = req.params;

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  // Check access permissions
  const isOwner = ticket.userId.toString() === req.user._id.toString();
  const isAdminOrAgent = ['admin', 'agent'].includes(req.user.role);

  if (!isOwner && !isAdminOrAgent) {
    res.status(403);
    throw new Error('Not authorized to access this file');
  }

  const attachment = ticket.attachments.id(attachmentId);

  if (!attachment) {
    res.status(404);
    throw new Error('File not found');
  }

  // Convert base64 to buffer
  const fileBuffer = Buffer.from(attachment.data, 'base64');

  // Set headers
  res.setHeader('Content-Type', attachment.mimetype);
  res.setHeader('Content-Length', fileBuffer.length);
  res.setHeader('Content-Disposition', `inline; filename="${attachment.filename}"`);

  // Send file
  res.send(fileBuffer);
});

/**
 * @desc    Get file from comment attachment
 * @route   GET /api/files/comment/:commentId/:attachmentId
 * @access  Private
 */
const getCommentFile = asyncHandler(async (req, res) => {
  const { commentId, attachmentId } = req.params;

  const comment = await Comment.findById(commentId).populate('ticketId');

  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const ticket = comment.ticketId;

  // Check access permissions
  const isOwner = ticket.userId.toString() === req.user._id.toString();
  const isAdminOrAgent = ['admin', 'agent'].includes(req.user.role);

  if (!isOwner && !isAdminOrAgent) {
    res.status(403);
    throw new Error('Not authorized to access this file');
  }

  const attachment = comment.attachments.id(attachmentId);

  if (!attachment) {
    res.status(404);
    throw new Error('File not found');
  }

  // Convert base64 to buffer
  const fileBuffer = Buffer.from(attachment.data, 'base64');

  // Set headers
  res.setHeader('Content-Type', attachment.mimetype);
  res.setHeader('Content-Length', fileBuffer.length);
  res.setHeader('Content-Disposition', `inline; filename="${attachment.filename}"`);

  // Send file
  res.send(fileBuffer);
});

module.exports = {
  getTicketFile,
  getCommentFile,
};
