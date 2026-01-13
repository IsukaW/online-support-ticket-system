import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiMenu,
  FiX,
  FiHome,
  FiInbox,
  FiBell,
  FiUser,
  FiLogOut,
  FiSettings,
  FiUsers,
  FiBarChart2,
  FiList,
} from 'react-icons/fi';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavigation = () => {
    if (user?.role === 'admin') {
      return [
        { name: 'Dashboard', href: '/admin/dashboard', icon: FiHome },
        { name: 'All Tickets', href: '/admin/tickets', icon: FiList },
        { name: 'Users', href: '/admin/users', icon: FiUsers },
        { name: 'Analytics', href: '/admin/analytics', icon: FiBarChart2 },
        { name: 'Notifications', href: '/notifications', icon: FiBell, badge: notificationCount },
        { name: 'Settings', href: '/admin/settings', icon: FiSettings },
      ];
    }

    if (user?.role === 'agent') {
      return [
        { name: 'Dashboard', href: '/agent/dashboard', icon: FiHome },
        { name: 'Assigned Tickets', href: '/agent/tickets', icon: FiList },
        { name: 'Notifications', href: '/notifications', icon: FiBell, badge: notificationCount },
      ];
    }

    // Default user navigation
    return [
      { name: 'Dashboard', href: '/dashboard', icon: FiHome },
      { name: 'My Tickets', href: '/tickets', icon: FiInbox },
      { name: 'Notifications', href: '/notifications', icon: FiBell, badge: notificationCount },
    ];
  };

  const navigation = getNavigation();
  
  // Get dashboard route for logo link
  const dashboardRoute = user?.role === 'admin' ? '/admin/dashboard' : 
                        user?.role === 'agent' ? '/agent/dashboard' : '/dashboard';

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link to={dashboardRoute} className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">TS</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">TicketSupport</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* User info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <FiUser className="h-5 w-5 text-primary-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon
                    className={`${
                      isActive(item.href) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                    } mr-3 h-5 w-5`}
                  />
                  {item.name}
                  {item.badge > 0 && (
                    <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FiLogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <FiMenu className="h-6 w-6" />
              </button>
              <div className="flex-1" />
              <div className="flex items-center space-x-4">
                <Link
                  to="/notifications"
                  className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiBell className="h-6 w-6" />
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <FiUser className="h-4 w-4 text-primary-600" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
