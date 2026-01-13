import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../services';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import toast from 'react-hot-toast';
import { FiBell, FiCheck, FiTrash2, FiInbox } from 'react-icons/fi';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { isRead: filter === 'read' } : {};
      const response = await notificationService.getNotifications(params);
      setNotifications(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]); // Ensure it's always an array on error
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      toast.success('Notification marked as read');
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      toast.success('Notification deleted');
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    return FiBell;
  };

  const getNotificationColor = (type) => {
    const colors = {
      ticket_created: 'text-blue-600 bg-blue-100',
      ticket_updated: 'text-yellow-600 bg-yellow-100',
      ticket_assigned: 'text-purple-600 bg-purple-100',
      comment_added: 'text-green-600 bg-green-100',
      ticket_resolved: 'text-green-600 bg-green-100',
      ticket_closed: 'text-gray-600 bg-gray-100',
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">Stay updated with your tickets</p>
        </div>
        {Array.isArray(notifications) && notifications.some((n) => !n.isRead) && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <FiCheck className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'unread'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'read'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Read
        </button>
      </div>

      {/* Notifications List */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader.Spinner />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={FiInbox}
            title="No notifications"
            description={
              filter === 'all'
                ? "You don't have any notifications yet"
                : `You don't have any ${filter} notifications`
            }
          />
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type);
              
              return (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colorClass} flex items-center justify-center`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.message}
                      </p>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                        {notification.ticket && (
                          <Link
                            to={`/tickets/${notification.ticket._id || notification.ticket}`}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                          >
                            View Ticket
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="text-primary-600 hover:text-primary-700"
                          title="Mark as read"
                        >
                          <FiCheck className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Notifications;
