const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Online Ticket System API',
      version: '1.0.0',
      description:
        'Complete REST API for Online Support Ticket System with Authentication, Role-based Access Control, and Payment Integration',
      contact: {
        name: 'API Support',
        email: 'support@ticketsystem.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://api.ticketsystem.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['user', 'agent', 'admin'] },
            isVerified: { type: 'boolean' },
            phone: { type: 'string' },
            avatar: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Ticket: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            category: {
              type: 'string',
              enum: [
                'technical',
                'billing',
                'account',
                'feature_request',
                'bug_report',
                'general',
                'other',
              ],
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
            },
            status: {
              type: 'string',
              enum: ['open', 'in_progress', 'resolved', 'closed', 'reopened'],
            },
            userId: { type: 'string' },
            assignedAgent: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            ticketId: { type: 'string' },
            userId: { type: 'string' },
            message: { type: 'string' },
            isInternal: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            type: { type: 'string' },
            message: { type: 'string' },
            isRead: { type: 'boolean' },
            ticketId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            ticketId: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string' },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'failed', 'refunded'],
            },
            gateway: { type: 'string', enum: ['stripe', 'paypal', 'manual'] },
            transactionId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Authentication', description: 'User authentication endpoints' },
      { name: 'Tickets', description: 'Ticket management endpoints' },
      { name: 'Comments', description: 'Ticket comments endpoints' },
      { name: 'Notifications', description: 'User notifications endpoints' },
      { name: 'Admin', description: 'Admin panel endpoints' },
      { name: 'Payments', description: 'Payment processing endpoints' },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
