const Joi = require('joi');

const createTicketSchema = Joi.object({
  title: Joi.string().min(5).max(200).required().messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 5 characters',
    'string.max': 'Title cannot exceed 200 characters',
  }),
  description: Joi.string().min(10).max(2000).required().messages({
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 10 characters',
    'string.max': 'Description cannot exceed 2000 characters',
  }),
  category: Joi.string()
    .valid(
      'technical',
      'billing',
      'account',
      'feature_request',
      'bug_report',
      'general',
      'other'
    )
    .required()
    .messages({
      'any.only': 'Invalid category',
    }),
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .optional()
    .default('medium'),
  attachments: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri(),
        publicId: Joi.string(),
        filename: Joi.string(),
      })
    )
    .optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});

const updateTicketSchema = Joi.object({
  title: Joi.string().min(5).max(200).optional(),
  description: Joi.string().min(10).max(2000).optional(),
  category: Joi.string()
    .valid(
      'technical',
      'billing',
      'account',
      'feature_request',
      'bug_report',
      'general',
      'other'
    )
    .optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  status: Joi.string()
    .valid('open', 'in_progress', 'resolved', 'closed', 'reopened')
    .optional(),
  assignedAgent: Joi.string().optional().allow(null),
  resolution: Joi.string().max(1000).optional().allow(''),
  tags: Joi.array().items(Joi.string()).optional(),
});

const assignTicketSchema = Joi.object({
  agentId: Joi.string().required().messages({
    'string.empty': 'Agent ID is required',
  }),
});

module.exports = {
  createTicketSchema,
  updateTicketSchema,
  assignTicketSchema,
};
