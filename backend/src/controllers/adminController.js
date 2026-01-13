const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Payment = require('../models/Payment');

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, isActive, page = 1, limit = 20, search } = req.query;

  const query = {};
  
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const users = await User.find(query)
    .select('-password -refreshToken')
    .sort('-createdAt')
    .limit(parseInt(limit))
    .skip(skip);

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin)
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    '-password -refreshToken'
  );

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Get user statistics
  const ticketCount = await Ticket.countDocuments({ userId: user._id });
  const openTickets = await Ticket.countDocuments({
    userId: user._id,
    status: { $in: ['open', 'in_progress', 'reopened'] },
  });

  res.json({
    success: true,
    data: {
      ...user.toJSON(),
      stats: {
        totalTickets: ticketCount,
        openTickets,
      },
    },
  });
});

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private (Admin)
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.role = role;
  await user.save();

  res.json({
    success: true,
    data: user,
    message: 'User role updated successfully',
  });
});

/**
 * @desc    Toggle user active status
 * @route   PUT /api/admin/users/:id/toggle-status
 * @access  Private (Admin)
 */
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    data: user,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.deleteOne();

  res.json({
    success: true,
    message: 'User deleted successfully',
  });
});

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin)
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  // Get counts
  const totalUsers = await User.countDocuments();
  const totalAgents = await User.countDocuments({ role: 'agent' });
  const totalTickets = await Ticket.countDocuments();
  const openTickets = await Ticket.countDocuments({
    status: { $in: ['open', 'in_progress', 'reopened'] },
  });
  const closedTickets = await Ticket.countDocuments({ status: 'closed' });
  const resolvedTickets = await Ticket.countDocuments({ status: 'resolved' });
  const unassignedTickets = await Ticket.countDocuments({ assignedAgent: null });

  // Get recent tickets
  const recentTickets = await Ticket.find()
    .populate('userId', 'name email')
    .populate('assignedAgent', 'name email')
    .sort('-createdAt')
    .limit(10);

  // Get user role distribution
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);

  // Get ticket statistics by status
  const ticketsByStatus = await Ticket.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Get ticket statistics by priority
  const ticketsByPriority = await Ticket.aggregate([
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);

  // Get ticket statistics by category
  const ticketsByCategory = await Ticket.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  // Get agent performance stats
  const agentPerformance = await Ticket.aggregate([
    {
      $match: { assignedAgent: { $ne: null } }
    },
    {
      $group: {
        _id: '$assignedAgent',
        totalAssigned: { $sum: 1 },
        resolved: {
          $sum: {
            $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0]
          }
        },
        avgResponseTime: { $avg: '$responseTime' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'agent'
      }
    },
    {
      $unwind: '$agent'
    },
    {
      $project: {
        agentName: '$agent.name',
        agentEmail: '$agent.email',
        totalAssigned: 1,
        resolved: 1,
        resolutionRate: {
          $round: [{ $multiply: [{ $divide: ['$resolved', '$totalAssigned'] }, 100] }, 1]
        }
      }
    },
    { $sort: { totalAssigned: -1 } },
    { $limit: 10 }
  ]);

  // Get monthly ticket trends (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyTickets = await Ticket.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        total: { $sum: 1 },
        resolved: {
          $sum: {
            $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0]
          }
        }
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Get top categories
  const topCategories = await Ticket.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  res.json({
    success: true,
    data: {
      overview: {
        totalUsers,
        totalAgents,
        totalTickets,
        openTickets,
        closedTickets,
        resolvedTickets,
        unassignedTickets,
        resolutionRate: totalTickets > 0 ? Math.round(((resolvedTickets + closedTickets) / totalTickets) * 100) : 0
      },
      usersByRole,
      ticketsByStatus,
      ticketsByPriority,
      ticketsByCategory,
      agentPerformance,
      monthlyTickets,
      topCategories,
      recentTickets,
    },
  });
});

/**
 * @desc    Get all agents
 * @route   GET /api/admin/agents
 * @access  Private (Admin)
 */
const getAllAgents = asyncHandler(async (req, res) => {
  const agents = await User.find({ role: 'agent', isActive: true }).select(
    'name email'
  );

  res.json({
    success: true,
    data: agents,
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getDashboardStats,
  getAllAgents,
};
