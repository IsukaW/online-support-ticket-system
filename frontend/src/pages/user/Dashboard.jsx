import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services';
import { Card, StatCard } from '../../components/common/Card';
import { Badge, StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { FiPlus, FiInbox, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const ticketsData = await ticketService.getMyTickets({ sort: '-createdAt' });
      const tickets = ticketsData.data.data || ticketsData.data.tickets || [];
      
      // Calculate stats from tickets
      const calculatedStats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        in_progress: tickets.filter(t => t.status === 'in_progress').length,
        resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
        urgent: tickets.filter(t => t.priority === 'urgent').length,
      };
      
      setStats(calculatedStats);
      setRecentTickets(tickets.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader.PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your support tickets
          </p>
        </div>
        <Link
          to="/tickets/create"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <FiPlus className="mr-2 h-5 w-5" />
          New Ticket
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tickets"
          value={stats?.total || 0}
          icon={FiInbox}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Open"
          value={stats?.open || 0}
          icon={FiClock}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-100"
        />
        <StatCard
          title="Resolved"
          value={stats?.resolved || 0}
          icon={FiCheckCircle}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatCard
          title="Urgent"
          value={stats?.urgent || 0}
          icon={FiAlertCircle}
          iconColor="text-red-600"
          iconBg="bg-red-100"
        />
      </div>

      {/* Recent Tickets */}
      <Card title="Recent Tickets" action={<Link to="/tickets" className="text-sm text-primary-600 hover:text-primary-700">View all</Link>}>
        {recentTickets.length === 0 ? (
          <EmptyState
            icon={FiInbox}
            title="No tickets yet"
            description="Create your first support ticket to get started"
            action={{
              label: 'Create Ticket',
              onClick: () => {},
              href: '/tickets/create',
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket ID
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/tickets/${ticket._id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700"
                      >
                        #{ticket._id.slice(-6)}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{ticket.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserDashboard;
