import { useEffect, useState } from 'react';
import { adminService } from '../../services';
import { Card, StatCard } from '../../components/common/Card';
import { Loader } from '../../components/common/Loader';
import {
  FiInbox,
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertCircle,
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

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboard();
      const dashboardData = response.data.data || response.data;
      setStats(dashboardData);
      setChartsData(dashboardData); // Backend returns all data in one call
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          System overview and analytics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tickets"
          value={stats?.overview?.totalTickets || 0}
          icon={FiInbox}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Total Users"
          value={stats?.overview?.totalUsers || 0}
          icon={FiUsers}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatCard
          title="Active Agents"
          value={stats?.overview?.totalAgents || 0}
          icon={FiUsers}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        <StatCard
          title="Resolution Rate"
          value={`${stats?.overview?.resolutionRate || 0}%`}
          icon={FiTrendingUp}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-100"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Open Tickets"
          value={stats?.overview?.openTickets || 0}
          icon={FiClock}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-100"
        />
        <StatCard
          title="Resolved Tickets"
          value={stats?.overview?.resolvedTickets || 0}
          icon={FiCheckCircle}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatCard
          title="Closed Tickets"
          value={stats?.overview?.closedTickets || 0}
          icon={FiCheckCircle}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Unassigned"
          value={stats?.overview?.unassignedTickets || 0}
          icon={FiAlertCircle}
          iconColor="text-red-600"
          iconBg="bg-red-100"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tickets Over Time */}
        <Card title="Monthly Tickets Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.monthlyTickets?.map(item => ({
              month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
              total: item.total || item.count,
              resolved: item.resolved || 0
            })) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total" />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Tickets by Status */}
        <Card title="Tickets by Status">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats?.ticketsByStatus?.map(item => ({ name: item._id, value: item.count })) || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {(stats?.ticketsByStatus || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Tickets by Priority */}
        <Card title="Tickets by Priority">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.ticketsByPriority?.map(item => ({ priority: item._id, count: item.count })) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* User Roles Distribution */}
        <Card title="Users by Role">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.usersByRole?.map(item => ({ role: item._id, count: item.count })) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Agent Performance */}
      <Card title="Top Performing Agents">
        {stats?.agentPerformance?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Assigned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resolved
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resolution Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.agentPerformance.map((agent) => (
                  <tr key={agent._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{agent.agentName}</div>
                        <div className="text-sm text-gray-500">{agent.agentEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agent.totalAssigned}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agent.resolved}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{agent.resolutionRate}%</div>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(agent.resolutionRate, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No agent performance data available
          </div>
        )}
      </Card>

      {/* Categories Analysis */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Tickets by Category">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.ticketsByCategory?.map(item => ({ 
              category: item._id.replace('_', ' '), 
              count: item.count 
            })) || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top Categories">
          <div className="space-y-4">
            {stats?.topCategories?.map((category, index) => (
              <div key={category._id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                    {index + 1}
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900 capitalize">
                    {category._id.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{category.count} tickets</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card title="Recent Tickets">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats?.recentTickets?.map((ticket) => (
                <tr key={ticket._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{ticket._id.slice(-6)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{ticket.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{ticket.userId?.name}</td>
                  <td className="px-6 py-4 text-sm capitalize">{ticket.status}</td>
                  <td className="px-6 py-4 text-sm capitalize">{ticket.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
