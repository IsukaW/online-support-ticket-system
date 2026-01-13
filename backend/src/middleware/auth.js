const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { verifyAccessToken } = require('../utils/jwt');

/**
 * Protect routes - Verify JWT token
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    // Verify token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }

    if (!req.user.isActive) {
      res.status(403);
      throw new Error('User account is deactivated');
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

/**
 * Role-based access control
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `User role '${req.user.role}' is not authorized to access this route`
      );
    }

    next();
  };
};

/**
 * Check if user owns the resource or is admin/agent
 */
const checkOwnership = (model) => {
  return asyncHandler(async (req, res, next) => {
    const resourceId = req.params.id;
    const resource = await model.findById(resourceId);

    if (!resource) {
      res.status(404);
      throw new Error('Resource not found');
    }

    // Admin and agents can access all resources
    if (req.user.role === 'admin' || req.user.role === 'agent') {
      req.resource = resource;
      return next();
    }

    // Check if user owns the resource
    if (
      resource.userId &&
      resource.userId.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error('Not authorized to access this resource');
    }

    req.resource = resource;
    next();
  });
};

module.exports = { protect, authorize, checkOwnership };
