const Joi = require('joi');

const updateUserRoleSchema = Joi.object({
  role: Joi.string().valid('user', 'agent', 'admin').required().messages({
    'any.only': 'Role must be user, agent, or admin',
    'string.empty': 'Role is required',
  }),
});

module.exports = {
  updateUserRoleSchema,
};
