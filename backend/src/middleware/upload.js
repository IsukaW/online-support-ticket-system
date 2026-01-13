const multer = require('multer');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const asyncHandler = require('express-async-handler');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES
    ? process.env.ALLOWED_FILE_TYPES.split(',')
    : ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      ),
      false
    );
  }
};

// Multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
});

/**
 * Convert files to base64 for MongoDB storage
 */
const uploadToCloudinary = asyncHandler(async (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  try {
    const files = req.files || [req.file];
    
    // Convert files to base64
    const processedFiles = files.map((file) => {
      return {
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        data: file.buffer.toString('base64'),
      };
    });

    // Attach to request
    if (req.files) {
      req.uploadedFiles = processedFiles;
    } else {
      req.uploadedFile = processedFiles[0];
    }

    next();
  } catch (error) {
    res.status(500);
    throw new Error(`File processing failed: ${error.message}`);
  }
});

module.exports = {
  upload,
  uploadToCloudinary,
};
