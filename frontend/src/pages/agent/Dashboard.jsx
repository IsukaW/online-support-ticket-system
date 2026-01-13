import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services';
import { Card, StatCard } from '../../components/common/Card';
import { Loader } from '../../components/common/Loader';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { 
  FiInbox, 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiTrendingUp,
  FiUser,
  FiCalendar 
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getAgentDashboard();
      const data = response.data.data;
      
      console.log('Agent dashboard data:', data); // Debug log
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // If API fails, show zero stats instead of breaking
      setDashboardData({
        overview: {
          totalAssigned: 0,
          open: 0,
          inProgress: 0,
          resolved: 0,
          urgent: 0,
          resolutionRate: 0
        },
        ticketsByStatus: [],
        ticketsByPriority: [],
        ticketsByCategory: [],
        recentTickets: [],
        performanceStats: { totalHandled: 0, resolved: 0 },
        weeklyTrend: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader.PageLoader />;
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.name}! Here's your performance overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Assigned"
          value={dashboardData?.overview?.totalAssigned || 0}
          icon={FiInbox}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Open & In Progress"
          value={(dashboardData?.overview?.open || 0) + (dashboardData?.overview?.inProgress || 0)}
          icon={FiClock}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-100"
        />
        <StatCard
          title="Resolved"
          value={dashboardData?.overview?.resolved || 0}
          icon={FiCheckCircle}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatCard
          title="Urgent Priority"
          value={dashboardData?.overview?.urgent || 0}
          icon={FiAlertCircle}
          iconColor="text-red-600"
          iconBg="bg-red-100"
        />
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <StatCard
          title="Resolution Rate"
          value={`${dashboardData?.overview?.resolutionRate || 0}%`}
          icon={FiTrendingUp}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
          description="Tickets resolved successfully"
        />
        <StatCard
          title="Handled (30 days)"
          value={dashboardData?.performanceStats?.totalHandled || 0}
          icon={FiCalendar}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-100"
          description="Tickets handled in last 30 days"
        />
        <StatCard
          title="Resolved (30 days)"
          value={dashboardData?.performanceStats?.resolved || 0}
          icon={FiCheckCircle}
          iconColor="text-green-600"
          iconBg="bg-green-100"
          description="Tickets resolved in last 30 days"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tickets by Status */}
        <Card title="My Tickets by Status">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData?.ticketsByStatus?.map(item => ({
                  name: item._id,
                  value: item.count,
                  label: `${item._id} (${item.count})`
                })) || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.label}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dashboardData?.ticketsByStatus?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Tickets by Priority */}
        <Card title="My Tickets by Priority">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData?.ticketsByPriority?.map(item => ({
              priority: item._id,
              count: item.count
            })) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Weekly Trend */}
      <Card title="Weekly Ticket Assignment Trend">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dashboardData?.weeklyTrend || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Tickets Assigned"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Tickets */}
      <Card title="Recent Tickets Assigned to Me">
        {dashboardData?.recentTickets?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentTickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ticket.category?.replace('_', ' ')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiUser className="mr-2 h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{ticket.userId?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent tickets assigned to you
          </div>
        )}
      </Card>
    </div>
  );
};

export default AgentDashboard;
