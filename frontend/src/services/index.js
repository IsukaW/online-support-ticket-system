import api from './api';

// Authentication
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
};

// Tickets
export const ticketService = {
  getAll: (params) => api.get('/tickets', { params }),
  getMyTickets: (params) => api.get('/tickets', { params: { ...params, myTickets: 'true' } }), // Force filter by creator
  getTicketById: (id) => api.get(`/tickets/${id}`),
  getById: (id) => api.get(`/tickets/${id}`),
  createTicket: (data) => api.post('/tickets', data),
  create: (data) => api.post('/tickets', data),
  updateTicket: (id, data) => api.put(`/tickets/${id}`, data),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  delete: (id) => api.delete(`/tickets/${id}`),
  assign: (id, agentId) => api.put(`/tickets/${id}/assign`, { agentId }),
  close: (id, resolution) => api.put(`/tickets/${id}/close`, { resolution }),
  reopen: (id) => api.put(`/tickets/${id}/reopen`),
  getStats: () => api.get('/tickets/stats/overview'),
  getMyStats: () => api.get('/tickets/stats/overview'), // Use same endpoint, backend filters by role
  getAgentDashboard: () => api.get('/tickets/agent/dashboard'), // New agent dashboard API
};

// Comments
export const commentService = {
  getComments: (ticketId) => api.get(`/comments/ticket/${ticketId}`),
  getByTicket: (ticketId) => api.get(`/comments/ticket/${ticketId}`),
  addComment: (ticketId, data) => {
    // If data is FormData, it already has ticketId appended
    if (data instanceof FormData) {
      return api.post(`/comments`, data);
    }
    return api.post(`/comments`, { ...data, ticketId });
  },
  create: (data) => api.post('/comments', data),
  update: (id, data) => api.put(`/comments/${id}`, data),
  delete: (id) => api.delete(`/comments/${id}`),
};

// Notifications
export const notificationService = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  delete: (id) => api.delete(`/notifications/${id}`),
  deleteRead: () => api.delete('/notifications/read'),
};

// Admin
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getDashboardStats: () => api.get('/admin/dashboard'), // Same as getDashboard
  getChartsData: () => api.get('/admin/dashboard'), // Backend returns all data in one endpoint
  getUsers: (params) => api.get('/admin/users', { params }),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAgents: () => api.get('/admin/agents'),
};

// Payments
export const paymentService = {
  createIntent: (data) => api.post('/payments/create-intent', data),
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  getAllPayments: (params) => api.get('/payments/admin/all', { params }),
};
