const asyncHandler = require('express-async-handler');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendTicketCreatedEmail, sendTicketUpdatedEmail } = require('../utils/emailService');
const { transformTicket } = require('../utils/fileHelper');

/**
 * @desc    Create a new ticket
 * @route   POST /api/tickets
 * @access  Private
 */
const createTicket = asyncHandler(async (req, res) => {
  const { title, description, category, priority, tags } = req.body;

  // Get uploaded files from middleware
  const attachments = req.uploadedFiles || [];

  const ticket = await Ticket.create({
    title,
    description,
    category,
    priority: priority || 'medium',
    userId: req.user._id,
    attachments,
    tags: tags || [],
  });

  // Populate user info
  await ticket.populate('userId', 'name email');

  // Create notification for ticket creator
  await Notification.create({
    userId: req.user._id,
    type: 'ticket_created',
    message: `Your ticket "${title}" has been created`,
    ticketId: ticket._id,
  });

  // Create notifications for all admins about new ticket
  const admins = await User.find({ role: 'admin', isActive: true });
  for (const admin of admins) {
    if (admin._id.toString() !== req.user._id.toString()) { // Don't notify if admin created the ticket
      await Notification.create({
        userId: admin._id,
        type: 'ticket_created',
        message: `New ticket "${title}" created by ${req.user.name}`,
        ticketId: ticket._id,
      });
    }
  }

  // Send email notification (non-blocking)
  sendTicketCreatedEmail(req.user, ticket).catch((err) =>
    console.error('Failed to send email:', err)
  );

  res.status(201).json({
    success: true,
    data: transformTicket(ticket),
    message: 'Ticket created successfully',
  });
});

/**
 * @desc    Get all tickets (with filters and pagination)
 * @route   GET /api/tickets
 * @access  Private
 */
const getTickets = asyncHandler(async (req, res) => {
  const {
    status,
    priority,
    category,
    search,
    page = 1,
    limit = 10,
    sortBy = '-createdAt',
    myTickets, // New parameter to force filtering by creator
  } = req.query;

  // Build query
  const query = {};

  // Role-based filtering
  if (myTickets === 'true' || req.user.role === 'user') {
    // If myTickets=true, always filter by creator (userId)
    query.userId = req.user._id;
  } else if (req.user.role === 'agent') {
    query.assignedAgent = req.user._id;
  }
  // Admin sees all tickets (unless myTickets=true)

  // Apply filters
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;

  // Execute query
  const tickets = await Ticket.find(query)
    .populate('userId', 'name email')
    .populate('assignedAgent', 'name email')
    .sort(sortBy)
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Ticket.countDocuments(query);

  res.json({
    success: true,
    data: tickets.map(transformTicket),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get single ticket by ID
 * @route   GET /api/tickets/:id
 * @access  Private
 */
const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate('userId', 'name email phone')
    .populate('assignedAgent', 'name email')
    .populate({
      path: 'comments',
      populate: { path: 'userId', select: 'name email role' },
    });

  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  // Check access permissions
  if (
    req.user.role === 'user' &&
    ticket.userId._id.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to access this ticket');
  }

  res.json({
    success: true,
    data: transformTicket(ticket),
  });
});

/**
 * @desc    Update ticket
 * @route   PUT /api/tickets/:id
 * @access  Private
 */
const updateTicket = asyncHandler(async (req, res) => {
  let ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  // Check permissions
  const isOwner = ticket.userId.toString() === req.user._id.toString();
  const isAdminOrAgent = ['admin', 'agent'].includes(req.user.role);

  if (!isOwner && !isAdminOrAgent) {
    res.status(403);
    throw new Error('Not authorized to update this ticket');
  }

  // Users can only update certain fields
  const allowedUserUpdates = ['title', 'description', 'category', 'priority'];
  const allowedAdminUpdates = [
    ...allowedUserUpdates,
    'status',
    'assignedAgent',
    'resolution',
    'tags',
  ];

  const allowedFields =
    req.user.role === 'user' ? allowedUserUpdates : allowedAdminUpdates;

  // Filter update fields
  const updates = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  ticket = await Ticket.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).populate('userId', 'name email');

  // Create notification
  await Notification.create({
    userId: ticket.userId,
    type: 'ticket_updated',
    message: `Ticket "${ticket.title}" has been updated`,
    ticketId: ticket._id,
  });

  res.json({
    success: true,
    data: ticket,
    message: 'Ticket updated successfully',
  });
});

/**
 * @desc    Delete ticket
 * @route   DELETE /api/tickets/:id
 * @access  Private (Admin only)
 */
const deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  await ticket.deleteOne();

  res.json({
    success: true,
    message: 'Ticket deleted successfully',
  });
});

/**
 * @desc    Assign ticket to agent
 * @route   PUT /api/tickets/:id/assign
 * @access  Private (Admin/Agent)
 */
const assignTicket = asyncHandler(async (req, res) => {
  const { agentId } = req.body;

  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  ticket.assignedAgent = agentId;
  ticket.status = 'in_progress';
  await ticket.save();

  await ticket.populate('assignedAgent', 'name email');

  // Create notification for ticket owner
  await Notification.create({
    userId: ticket.userId,
    type: 'ticket_assigned',
    message: `Ticket "${ticket.title}" has been assigned to ${ticket.assignedAgent.name}`,
    ticketId: ticket._id,
  });

  // Create notification for assigned agent
  await Notification.create({
    userId: agentId,
    type: 'ticket_assigned',
    message: `You have been assigned to ticket "${ticket.title}"`,
    ticketId: ticket._id,
  });

  res.json({
    success: true,
    data: ticket,
    message: 'Ticket assigned successfully',
  });
});

/**
 * @desc    Close ticket
 * @route   PUT /api/tickets/:id/close
 * @access  Private (Owner/Admin/Agent)
 */
const closeTicket = asyncHandler(async (req, res) => {
  const { resolution } = req.body;

  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  ticket.status = 'closed';
  ticket.closedAt = Date.now();
  if (resolution) ticket.resolution = resolution;

  await ticket.save();

  // Create notification
  await Notification.create({
    userId: ticket.userId,
    type: 'ticket_closed',
    message: `Ticket "${ticket.title}" has been closed`,
    ticketId: ticket._id,
  });

  res.json({
    success: true,
    data: ticket,
    message: 'Ticket closed successfully',
  });
});

/**
 * @desc    Reopen ticket
 * @route   PUT /api/tickets/:id/reopen
 * @access  Private
 */
const reopenTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  if (ticket.status !== 'closed' && ticket.status !== 'resolved') {
    res.status(400);
    throw new Error('Only closed or resolved tickets can be reopened');
  }

  ticket.status = 'reopened';
  ticket.closedAt = null;
  await ticket.save();

  res.json({
    success: true,
    data: ticket,
    message: 'Ticket reopened successfully',
  });
});

/**
 * @desc    Get ticket statistics
 * @route   GET /api/tickets/stats/overview
 * @access  Private (Admin/Agent)
 */
const getTicketStats = asyncHandler(async (req, res) => {
  let matchStage = {};
  
  // For agents, only show tickets assigned to them
  if (req.user.role === 'agent') {
    matchStage.assignedAgent = req.user._id;
  }
  
  const stats = await Ticket.aggregate([
    { $match: matchStage },
    {
      $facet: {
        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
        byCategory: [{ $group: { _id: '$category', count: { $sum: 1 } } }],
        total: [{ $count: 'count' }],
      },
    },
  ]);

  res.json({
    success: true,
    data: stats[0],
  });
});

/**
 * @desc    Get agent dashboard statistics
 * @route   GET /api/tickets/agent/dashboard
 * @access  Private (Agent)
 */
const getAgentDashboard = asyncHandler(async (req, res) => {
  const agentId = req.user._id;

  // Get agent's ticket counts by status
  const ticketStats = await Ticket.aggregate([
    { $match: { assignedAgent: agentId } },
    {
      $facet: {
        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
        byCategory: [{ $group: { _id: '$category', count: { $sum: 1 } } }],
        total: [{ $count: 'count' }],
      },
    },
  ]);

  // Get recent tickets assigned to agent
  const recentTickets = await Ticket.find({ assignedAgent: agentId })
    .populate('userId', 'name email')
    .sort('-updatedAt')
    .limit(10);

  // Get agent's performance metrics (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const performanceStats = await Ticket.aggregate([
    {
      $match: {
        assignedAgent: agentId,
        updatedAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: null,
        totalHandled: { $sum: 1 },
        resolved: {
          $sum: {
            $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0]
          }
        },
        avgResponseTime: { $avg: '$responseTime' }
      }
    }
  ]);

  // Get weekly ticket trend for agent
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const weeklyTrend = await Ticket.aggregate([
    {
      $match: {
        assignedAgent: agentId,
        createdAt: { $gte: sevenDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Calculate resolution rate
  const stats = ticketStats[0];
  const totalTickets = stats.total?.[0]?.count || 0;
  const resolvedCount = stats.byStatus?.find(s => s._id === 'resolved')?.count || 0;
  const closedCount = stats.byStatus?.find(s => s._id === 'closed')?.count || 0;
  const resolutionRate = totalTickets > 0 ? Math.round(((resolvedCount + closedCount) / totalTickets) * 100) : 0;

  res.json({
    success: true,
    data: {
      overview: {
        totalAssigned: totalTickets,
        open: stats.byStatus?.find(s => s._id === 'open')?.count || 0,
        inProgress: stats.byStatus?.find(s => s._id === 'in_progress')?.count || 0,
        resolved: resolvedCount + closedCount,
        urgent: stats.byPriority?.find(p => p._id === 'urgent')?.count || 0,
        resolutionRate
      },
      ticketsByStatus: stats.byStatus || [],
      ticketsByPriority: stats.byPriority || [],
      ticketsByCategory: stats.byCategory || [],
      recentTickets,
      performanceStats: performanceStats[0] || { totalHandled: 0, resolved: 0, avgResponseTime: 0 },
      weeklyTrend
    },
  });
});

module.exports = {
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
};
