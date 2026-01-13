const asyncHandler = require('express-async-handler');
const Comment = require('../models/Comment');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const { transformComment } = require('../utils/fileHelper');

/**
 * @desc    Add comment to ticket
 * @route   POST /api/comments
 * @access  Private
 */
const addComment = asyncHandler(async (req, res) => {
  const { ticketId, message, isInternal } = req.body;

  // Check if ticket exists
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
    throw new Error('Not authorized to comment on this ticket');
  }

  // Only agents and admins can add internal notes
  const internal = isAdminOrAgent && isInternal ? true : false;

  // Get uploaded files from middleware
  const attachments = req.uploadedFiles || [];

  const comment = await Comment.create({
    ticketId,
    userId: req.user._id,
    message,
    attachments,
    isInternal: internal,
  });

  await comment.populate('userId', 'name email role');

  // Update ticket's last activity
  ticket.lastActivityAt = Date.now();
  await ticket.save();

  // Create notification for ticket owner (if commenter is not the owner)
  if (req.user._id.toString() !== ticket.userId.toString() && !internal) {
    await Notification.create({
      userId: ticket.userId,
      type: 'comment_added',
      message: `New comment on ticket "${ticket.title}"`,
      ticketId: ticket._id,
    });
  }

  res.status(201).json({
    success: true,
    data: transformComment(comment),
    message: 'Comment added successfully',
  });
});

/**
 * @desc    Get comments for a ticket
 * @route   GET /api/comments/ticket/:ticketId
 * @access  Private
 */
const getCommentsByTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;

  // Check if ticket exists
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
    throw new Error('Not authorized to view these comments');
  }

  // Build query - users can't see internal notes
  const query = { ticketId };
  if (req.user.role === 'user') {
    query.isInternal = false;
  }

  const comments = await Comment.find(query)
    .populate('userId', 'name email role avatar')
    .sort('createdAt');

  res.json({
    success: true,
    data: comments.map(transformComment),
    count: comments.length,
  });
});

/**
 * @desc    Update comment
 * @route   PUT /api/comments/:id
 * @access  Private
 */
const updateComment = asyncHandler(async (req, res) => {
  let comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  // Check if user owns the comment
  if (comment.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this comment');
  }

  const { message } = req.body;

  comment.message = message || comment.message;
  comment.editedAt = Date.now();
  await comment.save();

  res.json({
    success: true,
    data: comment,
    message: 'Comment updated successfully',
  });
});

/**
 * @desc    Delete comment
 * @route   DELETE /api/comments/:id
 * @access  Private
 */
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  // Check permissions (owner or admin)
  const isOwner = comment.userId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to delete this comment');
  }

  await comment.deleteOne();

  res.json({
    success: true,
    message: 'Comment deleted successfully',
  });
});

module.exports = {
  addComment,
  getCommentsByTicket,
  updateComment,
  deleteComment,
};
