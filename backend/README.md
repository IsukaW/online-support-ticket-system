# Online Ticket System - Backend API

A complete, production-ready RESTful API for an online support ticket system built with Node.js, Express, MongoDB, and JWT authentication.

## 🚀 Features

### Core Functionality
- ✅ **User Authentication & Authorization**
  - JWT access & refresh tokens
  - Role-based access control (User, Agent, Admin)
  - Password hashing with bcrypt
  - Secure token management

- ✅ **Ticket Management**
  - Create, read, update, delete tickets
  - Ticket categories and priorities
  - Status workflow (Open → In Progress → Resolved → Closed)
  - Ticket assignment to agents
  - File attachments support (Cloudinary)
  - Full-text search

- ✅ **Comments & Communication**
  - Add comments to tickets
  - Internal notes (Agent/Admin only)
  - File attachments on comments
  - Real-time-ready structure

- ✅ **Notifications**
  - Real-time notification system
  - Email notifications (Nodemailer)
  - Notification types: ticket updates, assignments, comments
  - Mark as read/unread

- ✅ **Admin Dashboard**
  - User management
  - Role assignment
  - Ticket statistics
  - Dashboard analytics

- ✅ **Payment Integration**
  - Stripe payment processing
  - Payment intent creation
  - Webhook handling
  - Payment history

### Security Features
- Helmet.js for security headers
- MongoDB sanitization
- Rate limiting
- CORS configuration
- Input validation (Joi)
- Environment variable protection

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- npm >= 9.0.0

## 🛠️ Installation

1. **Clone the repository**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**

Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

Required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `CLOUDINARY_*` - Cloudinary credentials (for file uploads)
- `EMAIL_*` - Email service credentials
- `STRIPE_SECRET_KEY` - Stripe API key

4. **Start the server**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js
│   │   ├── cloudinary.js
│   │   └── swagger.js
│   ├── controllers/      # Request handlers
│   │   ├── authController.js
│   │   ├── ticketController.js
│   │   ├── commentController.js
│   │   ├── notificationController.js
│   │   ├── adminController.js
│   │   └── paymentController.js
│   ├── middleware/       # Custom middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── validation.js
│   │   └── upload.js
│   ├── models/          # Mongoose schemas
│   │   ├── User.js
│   │   ├── Ticket.js
│   │   ├── Comment.js
│   │   ├── Notification.js
│   │   └── Payment.js
│   ├── routes/          # API routes
│   │   ├── authRoutes.js
│   │   ├── ticketRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── adminRoutes.js
│   │   └── paymentRoutes.js
│   ├── utils/           # Utility functions
│   │   ├── jwt.js
│   │   └── emailService.js
│   ├── validations/     # Joi validation schemas
│   │   ├── authValidation.js
│   │   ├── ticketValidation.js
│   │   ├── commentValidation.js
│   │   ├── adminValidation.js
│   │   └── paymentValidation.js
│   └── server.js        # App entry point
├── .env.example
├── .gitignore
├── package.json
├── Dockerfile
└── docker-compose.yml
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Tickets
- `GET /api/tickets` - Get all tickets (filtered by role)
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/:id` - Get single ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket (Admin)
- `PUT /api/tickets/:id/assign` - Assign ticket to agent
- `PUT /api/tickets/:id/close` - Close ticket
- `PUT /api/tickets/:id/reopen` - Reopen ticket
- `GET /api/tickets/stats/overview` - Get ticket statistics

### Comments
- `POST /api/comments` - Add comment to ticket
- `GET /api/comments/ticket/:ticketId` - Get ticket comments
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `DELETE /api/notifications/read` - Delete all read notifications

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id/role` - Update user role
- `PUT /api/admin/users/:id/toggle-status` - Toggle user status
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/agents` - Get all agents

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `GET /api/payments` - Get user payments
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments/webhook` - Stripe webhook handler
- `GET /api/payments/admin/all` - Get all payments (Admin)

## 📖 API Documentation

Once the server is running, access the Swagger documentation at:
```
http://localhost:5000/api-docs
```

## 🔐 Authentication

API uses JWT Bearer token authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

### Token Flow
1. Login/Register to receive `accessToken` and `refreshToken`
2. Use `accessToken` for API requests (expires in 7 days)
3. Use `refreshToken` to get new `accessToken` when expired (expires in 30 days)

## 👥 User Roles

### User (Customer)
- Create and manage own tickets
- Add comments to own tickets
- View own notifications and payments

### Agent
- View assigned tickets
- Update ticket status
- Add comments (including internal notes)
- View all tickets

### Admin
- Full access to all features
- User management
- Dashboard statistics
- Assign tickets to agents
- Payment management

## 📧 Email Notifications

The system sends email notifications for:
- New user registration
- Ticket created
- Ticket updated
- Ticket assigned
- Ticket closed
- New comments
- Password reset

Configure email service in `.env` file.

## 💳 Payment Integration

Stripe integration for ticket payments:

1. Create payment intent
2. Client completes payment
3. Webhook updates payment status
4. Ticket marked as paid

## 🐳 Docker Deployment

### Build and run with Docker Compose:

```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Backend API on port 5000

### Build Docker image only:

```bash
docker build -t ticket-system-backend .
docker run -p 5000:5000 --env-file .env ticket-system-backend
```

## 🚀 Deployment Guides

### Deploy to Render

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy

### Deploy to Railway

1. Create new project
2. Add MongoDB database
3. Deploy from GitHub
4. Add environment variables
5. Deploy

### Deploy to Heroku

```bash
heroku create ticket-system-api
heroku addons:create mongolab
git push heroku main
```

## 📊 Database Models

### User Schema
- name, email, password (hashed)
- role (user/agent/admin)
- isVerified, isActive
- phone, avatar
- timestamps

### Ticket Schema
- title, description
- category, priority, status
- userId (creator)
- assignedAgent
- attachments, tags
- timestamps

### Comment Schema
- ticketId, userId
- message
- attachments
- isInternal (for agent notes)
- timestamps

### Notification Schema
- userId, type, message
- ticketId (reference)
- isRead, priority
- expiresAt (auto-delete)

### Payment Schema
- userId, ticketId
- amount, currency
- status, gateway
- transactionId
- timestamps

## 🧪 Testing

Create a test file and run:

```bash
npm test
```

## 📝 Sample API Requests

### Register User
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

### Create Ticket
```json
POST /api/tickets
Authorization: Bearer <token>
{
  "title": "Cannot login to my account",
  "description": "I'm getting an error when trying to login",
  "category": "technical",
  "priority": "high"
}
```

### Add Comment
```json
POST /api/comments
Authorization: Bearer <token>
{
  "ticketId": "64abc123...",
  "message": "I've tried resetting my password but still can't login"
}
```

## 🔧 Configuration

### Rate Limiting
Default: 100 requests per 15 minutes per IP

### File Upload
- Max file size: 5MB
- Allowed types: JPEG, PNG, GIF, PDF
- Storage: Cloudinary

### Database Indexes
Optimized indexes for:
- User email (unique)
- Ticket status and userId
- Ticket search (text index)
- Comments by ticketId
- Notifications by userId

## 🐛 Error Handling

All errors return consistent JSON format:
```json
{
  "success": false,
  "error": "Error message here",
  "stack": "Stack trace (dev only)"
}
```

## 📈 Performance

- Response compression enabled
- Database query optimization with indexes
- Pagination on all list endpoints
- Lazy loading for relationships
- Rate limiting for security

## 🔒 Security Best Practices

1. Never commit `.env` file
2. Use strong JWT secrets (min 32 chars)
3. Enable CORS only for trusted domains
4. Keep dependencies updated
5. Use HTTPS in production
6. Implement rate limiting
7. Sanitize user inputs
8. Hash passwords with bcrypt

## 📞 Support

For issues or questions, create an issue in the repository or contact isuka1minjaya@gmail.com

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

Built with ❤️ using Node.js, Express, MongoDB, and modern best practices.
