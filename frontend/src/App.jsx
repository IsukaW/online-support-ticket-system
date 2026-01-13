import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Common Pages
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import MyTickets from './pages/user/MyTickets';
import CreateTicket from './pages/user/CreateTicket';
import TicketDetail from './pages/user/TicketDetail';

// Agent Pages
import AgentDashboard from './pages/agent/Dashboard';
import AgentTickets from './pages/agent/Tickets';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminTickets from './pages/admin/Tickets';
import UserManagement from './pages/admin/UserManagement';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';

// Shared Pages
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Redirect root to role-specific dashboard */}
            <Route index element={<RoleBasedRedirect />} />

            {/* Common Protected Routes */}
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />

            {/* User Routes */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute roles={['user', 'agent', 'admin']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="tickets"
              element={
                <ProtectedRoute roles={['user', 'agent', 'admin']}>
                  <MyTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="tickets/create"
              element={
                <ProtectedRoute roles={['user', 'agent', 'admin']}>
                  <CreateTicket />
                </ProtectedRoute>
              }
            />
            <Route
              path="tickets/:id"
              element={
                <ProtectedRoute roles={['user', 'agent', 'admin']}>
                  <TicketDetail />
                </ProtectedRoute>
              }
            />

            {/* Agent Routes */}
            <Route
              path="agent/dashboard"
              element={
                <ProtectedRoute roles={['agent', 'admin']}>
                  <AgentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="agent/tickets"
              element={
                <ProtectedRoute roles={['agent', 'admin']}>
                  <AgentTickets />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="admin/dashboard"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/tickets"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/users"
              element={
                <ProtectedRoute roles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/analytics"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/settings"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
