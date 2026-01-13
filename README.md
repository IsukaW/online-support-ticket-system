# 🎫 Online Support Ticket System

A complete, production-ready full-stack support ticket management system with advanced features including JWT authentication, role-based access control, real-time notifications, payment integration, and comprehensive admin dashboard.

## 🚀 Features

### Backend (Node.js + Express + MongoDB)
- ✅ **Complete REST API** with JWT authentication
- ✅ **Role-based Access Control** (User, Agent, Admin)
- ✅ **Advanced Ticket Management** with status workflow
- ✅ **Real-time Notifications** system
- ✅ **Payment Integration** (Stripe-ready)
- ✅ **File Upload** support with Cloudinary
- ✅ **Email Notifications** (Nodemailer)
- ✅ **Admin Dashboard** with statistics
- ✅ **Swagger API Documentation**
- ✅ **Security Best Practices** (Helmet, CORS, Rate Limiting)
- ✅ **Docker Support** for easy deployment

### Frontend (React + Vite + Tailwind CSS)
- ✅ **Modern React 18** with Vite build tool
- ✅ **Beautiful UI** with Tailwind CSS 3
- ✅ **Role-based Dashboards** (User/Agent/Admin)
- ✅ **Real-time Notifications** (Toast)
- ✅ **Interactive Charts** (Recharts)
- ✅ **Responsive Design** (Mobile-first)
- ✅ **Protected Routes** with JWT
- ✅ **File Upload** support
- ✅ **Advanced Filtering** and pagination

## 📁 Project Structure

```
online-support-ticket-system/
├── backend/              # Node.js Express API
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Custom middleware
│   │   ├── models/      # Mongoose schemas
│   │   ├── routes/      # API routes
│   │   ├── utils/       # Utility functions
│   │   ├── validations/ # Input validation schemas
│   │   └── server.js    # Entry point
│   ├── .env.example
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── package.json
│   └── README.md
└── frontend/            # React Vite frontend
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── context/     # React context (Auth)
    │   ├── layouts/     # Page layouts
    │   ├── pages/       # All pages
    │   ├── services/    # API integration
    │   ├── App.jsx      # Main app
    │   └── main.jsx     # Entry point
    ├── .env.example
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.js
    └── README.md
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (Access & Refresh Tokens)
- **Validation**: Joi
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer
- **Payments**: Stripe
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, express-rate-limit, mongo-sanitize

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Routing**: React Router 6
- **HTTP Client**: Axios
- **State Management**: Context API
- **UI Components**: Headless UI
- **Charts**: Recharts
- **Icons**: React Icons
- **Notifications**: React Hot Toast

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- npm >= 9.0.0

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` file with your credentials:
```env
MONGODB_URI=mongodb+srv:/ticket-system
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_REFRESH_SECRET=your_super_secret_refresh_token
NODE_ENV=development
PORT=5000
```

4. **Start the server:**
```bash
npm start
```

Backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Start the development server:**
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

### Access the Application

Open your browser and visit `http://localhost:3000`

4. **Start development server:**
```bash
npm run dev
```

5. **Access the API:**
- API: http://localhost:5000
- Swagger Docs: http://localhost:5000/api-docs
- Health Check: http://localhost:5000/health

## 📖 API Documentation

Full API documentation is available at `/api-docs` when the server is running.

### Quick API Overview

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user

#### Tickets
- `GET /api/tickets` - Get all tickets (role-filtered)
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/:id` - Update ticket
- `PUT /api/tickets/:id/assign` - Assign to agent (Admin/Agent)
- `PUT /api/tickets/:id/close` - Close ticket
- `GET /api/tickets/stats/overview` - Get statistics (Admin/Agent)

#### Comments
- `POST /api/comments` - Add comment to ticket
- `GET /api/comments/ticket/:ticketId` - Get ticket comments

#### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

#### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role

#### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `GET /api/payments` - Get user payments
- `POST /api/payments/webhook` - Stripe webhook handler

## 🔐 Authentication

The API uses JWT Bearer token authentication:

```bash
Authorization: Bearer <your_access_token>
```

**Token Flow:**
1. Register/Login → Receive `accessToken` and `refreshToken`
2. Use `accessToken` for API requests (expires in 7 days)
3. Use `refreshToken` to get new `accessToken` when expired

## 👥 User Roles

### User (Customer)
- Create and manage own tickets
- Add comments
- View own notifications

### Agent
- View assigned tickets
- Update ticket status
- Add comments (including internal notes)

### Admin
- Full system access
- User management
- Dashboard statistics
- Assign tickets to agents

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t ticket-system-backend .
docker run -p 5000:5000 --env-file .env ticket-system-backend
```

## 🚀 Deployment

See [DEPLOYMENT.md](backend/DEPLOYMENT.md) for detailed deployment guides:
- Render
- Railway
- Heroku
- AWS EC2
- Docker

## 📊 Database Models

- **User**: Authentication, roles, profile
- **Ticket**: Support tickets with workflow
- **Comment**: Ticket comments and internal notes
- **Notification**: User notifications system
- **Payment**: Payment processing records

## 🔒 Security Features

- Password hashing with bcrypt
- JWT access & refresh tokens
- Role-based authorization
- Rate limiting (100 req/15min)
- Input validation and sanitization
- MongoDB injection prevention
- Security headers (Helmet)
- CORS protection

## 📈 Performance Features

- Database indexing for optimized queries
- Pagination on all list endpoints
- Response compression
- File size limits
- Query optimization

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## 📝 Sample Requests

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Ticket
```bash
curl -X POST http://localhost:5000/api/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cannot login to account",
    "description": "Getting error when trying to login",
    "category": "technical",
    "priority": "high"
  }'
```

## 📦 Postman Collection

Import `backend/postman_collection.json` into Postman for a complete collection of API requests.

## 🛣️ Roadmap

- [x] Backend API with authentication
- [x] Ticket management system
- [x] Admin dashboard endpoints
- [x] Payment integration
- [x] Email notifications
- [x] File upload support
- [x] Real-time updates (Socket.io)
- [x] Advanced analytics

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Email: isuka1minjaya@gmail.com

## 👨‍💻 Author

Built with ❤️ by a IsukaW FullStack Engineer

---

**Note**: This is a complete, production-ready system. Make sure to change all default secrets and configure proper security measures before deploying to production.
