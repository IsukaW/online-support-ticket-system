const Joi = require('joi');

const addCommentSchema = Joi.object({
  ticketId: Joi.string().required().messages({
    'string.empty': 'Ticket ID is required',
  }),
  message: Joi.string().min(1).max(1000).required().messages({
    'string.empty': 'Comment message is required',
    'string.max': 'Comment cannot exceed 1000 characters',
  }),
  attachments: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri(),
        publicId: Joi.string(),
        filename: Joi.string(),
      })
    )
    .optional(),
  isInternal: Joi.boolean().optional().default(false),
});

const updateCommentSchema = Joi.object({
  message: Joi.string().min(1).max(1000).required().messages({
    'string.empty': 'Comment message is required',
    'string.max': 'Comment cannot exceed 1000 characters',
  }),
});

module.exports = {
  addCommentSchema,
  updateCommentSchema,
};
