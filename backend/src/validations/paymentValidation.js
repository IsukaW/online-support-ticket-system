const Joi = require('joi');

const createPaymentIntentSchema = Joi.object({
  ticketId: Joi.string().required().messages({
    'string.empty': 'Ticket ID is required',
  }),
  amount: Joi.number().min(0.5).required().messages({
    'number.base': 'Amount must be a number',
    'number.min': 'Amount must be at least 0.5',
    'any.required': 'Amount is required',
  }),
  currency: Joi.string().length(3).optional().default('usd').messages({
    'string.length': 'Currency must be a 3-letter code',
  }),
});

module.exports = {
  createPaymentIntentSchema,
};
