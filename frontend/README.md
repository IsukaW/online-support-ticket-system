# Online Support Ticket System - Frontend

A comprehensive, modern frontend application for the Online Support Ticket System built with React, Vite, and Tailwind CSS.

## 🚀 Features

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Role-based access control (User, Agent, Admin)
- ✅ Protected routes
- ✅ Persistent authentication state
- ✅ Auto token refresh

### User Features
- ✅ Create and manage support tickets
- ✅ Add comments to tickets
- ✅ Upload attachments
- ✅ Track ticket status
- ✅ View notifications
- ✅ Personal dashboard with statistics

### Agent Features
- ✅ View assigned tickets
- ✅ Update ticket status
- ✅ Respond to customer tickets
- ✅ Agent-specific dashboard

### Admin Features
- ✅ Complete dashboard with analytics
- ✅ User management (create, update, delete)
- ✅ Ticket assignment
- ✅ View all tickets
- ✅ Advanced analytics with charts
- ✅ System settings configuration

### UI/UX
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Beautiful gradient backgrounds
- ✅ Real-time notifications (toast)
- ✅ Loading states and skeletons
- ✅ Empty states
- ✅ Status and priority badges
- ✅ Interactive charts (Recharts)
- ✅ Modern card-based layouts

## 🛠️ Tech Stack

- **React 18.2** - UI library
- **Vite 5.0** - Build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **React Router 6.21** - Client-side routing
- **Axios 1.6** - HTTP client
- **React Hot Toast** - Toast notifications
- **React Icons** - Icon library
- **Recharts 2.10** - Chart library
- **Headless UI 1.7** - Unstyled UI components

## 📁 Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.jsx          # Status/Priority badges
│   │   │   ├── Button.jsx         # Reusable button component
│   │   │   ├── Card.jsx           # Card layouts
│   │   │   ├── EmptyState.jsx     # Empty state component
│   │   │   ├── Input.jsx          # Form inputs
│   │   │   └── Loader.jsx         # Loading spinners
│   │   └── ProtectedRoute.jsx     # Route protection HOC
│   ├── context/
│   │   └── AuthContext.jsx        # Authentication state management
│   ├── layouts/
│   │   └── DashboardLayout.jsx    # Main dashboard layout
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Analytics.jsx      # Analytics dashboard
│   │   │   ├── Dashboard.jsx      # Admin dashboard
│   │   │   ├── Settings.jsx       # System settings
│   │   │   ├── Tickets.jsx        # All tickets management
│   │   │   └── UserManagement.jsx # User CRUD
│   │   ├── agent/
│   │   │   ├── Dashboard.jsx      # Agent dashboard
│   │   │   └── Tickets.jsx        # Assigned tickets
│   │   ├── auth/
│   │   │   ├── Login.jsx          # Login page
│   │   │   └── Register.jsx       # Registration page
│   │   ├── user/
│   │   │   ├── CreateTicket.jsx   # Create ticket form
│   │   │   ├── Dashboard.jsx      # User dashboard
│   │   │   ├── MyTickets.jsx      # User's tickets list
│   │   │   └── TicketDetail.jsx   # Ticket detail view
│   │   ├── NotFound.jsx           # 404 page
│   │   ├── Notifications.jsx      # Notifications page
│   │   ├── Profile.jsx            # User profile
│   │   └── Unauthorized.jsx       # 403 page
│   ├── services/
│   │   ├── api.js                 # Axios instance
│   │   └── index.js               # API service functions
│   ├── App.jsx                    # Main app component
│   ├── index.css                  # Global styles
│   └── main.jsx                   # App entry point
├── .env.example
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:5000`

### Installation

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
cp .env.example .env
```

4. **Update environment variables:**
```env
VITE_API_URL=http://localhost:5000/api
```

5. **Start development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Build
npm run build        # Build for production
npm run preview      # Preview production build locally

# Linting
npm run lint         # Run ESLint
```

## 🎨 Design System

### Colors

Primary color palette (customizable in `tailwind.config.js`):
- Primary 50-900: Main brand colors
- Gray scale for text and backgrounds
- Status colors: Blue (info), Green (success), Yellow (warning), Red (danger)

### Components

All reusable components are in `src/components/common/`:

- **Button**: Primary, secondary, danger, outline variants with loading states
- **Input**: Text, email, password, select, textarea with error handling
- **Card**: Container with optional title and actions
- **Badge**: Status and priority indicators
- **Loader**: Page, button, and inline loading states
- **EmptyState**: No data placeholders

### Layouts

- **DashboardLayout**: Sidebar navigation with role-based menu items
- Responsive: Collapses to mobile menu on small screens
- Auto-navigation based on user role

## 🔐 Authentication Flow

1. User logs in via `/login`
2. JWT tokens (access + refresh) stored in localStorage
3. Axios interceptor adds token to all requests
4. On 401 error, attempts token refresh
5. If refresh fails, redirects to login
6. AuthContext provides global auth state

## 🛣️ Routing Structure

```
Public Routes:
/login              - Login page
/register           - Registration page

Protected Routes (all roles):
/dashboard          - Role-specific dashboard
/tickets            - My tickets list
/tickets/create     - Create new ticket
/tickets/:id        - Ticket details
/notifications      - Notifications
/profile            - User profile

Agent Routes:
/agent/dashboard    - Agent dashboard
/agent/tickets      - Assigned tickets

Admin Routes:
/admin/dashboard    - Admin dashboard with charts
/admin/tickets      - All tickets management
/admin/users        - User management
/admin/analytics    - Advanced analytics
/admin/settings     - System settings
```

## 📦 API Integration

### Service Layer

All API calls are centralized in `src/services/index.js`:

```javascript
// Example usage
import { ticketService } from '../services';

// Get my tickets
const response = await ticketService.getMyTickets({ status: 'open' });

// Create ticket
const newTicket = await ticketService.createTicket(formData);

// Update ticket
const updated = await ticketService.updateTicket(id, { status: 'resolved' });
```

### Available Services

- `authService` - Authentication & profile
- `ticketService` - Ticket management
- `commentService` - Comments
- `notificationService` - Notifications
- `adminService` - Admin operations

## 🎯 Key Features Explained

### Auto Token Refresh

The axios interceptor automatically refreshes expired tokens:
```javascript
// In api.js
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      // Retry original request
    }
  }
);
```

### Role-Based UI

Components check user role and render accordingly:
```javascript
{user?.role === 'admin' && (
  <AdminOnlyComponent />
)}
```

### Real-time Updates

Toast notifications for all user actions:
```javascript
import toast from 'react-hot-toast';

toast.success('Ticket created!');
toast.error('Failed to update');
```

## 🎨 Customization

### Theming

Edit `tailwind.config.js` to customize colors:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        // ... your brand colors
      }
    }
  }
}
```

### API URL

Change backend URL in `.env`:
```env
VITE_API_URL=https://your-api-domain.com/api
```

## 🚀 Production Build

1. **Build the application:**
```bash
npm run build
```

2. **Test production build locally:**
```bash
npm run preview
```

3. **Deploy the `dist` folder** to your hosting service (Netlify, Vercel, etc.)

### Environment Variables for Production

Make sure to set these in your hosting platform:
```
VITE_API_URL=https://your-production-api.com/api
```

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

All layouts are fully responsive and mobile-first.

## 🧪 Demo Accounts

Use these credentials for testing:

**Admin:**
- Email: admin@ticketsystem.com
- Password: admin123

**Agent:**
- Email: agent@ticketsystem.com
- Password: agent123

**User:**
- Email: user@ticketsystem.com
- Password: user123

## 🐛 Troubleshooting

### Common Issues

**1. API Connection Error:**
- Verify backend is running on port 5000
- Check VITE_API_URL in .env
- Check CORS settings in backend

**2. Build Errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**3. Hot Reload Not Working:**
```bash
# Restart dev server
npm run dev
```

## 📚 Documentation

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com)
- [Recharts](https://recharts.org)

## 🤝 Contributing

1. Follow the existing code structure
2. Use functional components with hooks
3. Implement proper error handling
4. Add loading states for async operations
5. Keep components small and focused
6. Use Tailwind utilities over custom CSS

## 📄 License

This project is part of the Online Support Ticket System.

---

Built with ❤️ using React, Vite, and Tailwind CSS
