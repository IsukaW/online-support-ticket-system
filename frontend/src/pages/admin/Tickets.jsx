import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketService, adminService } from '../../services';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { FiSearch, FiInbox, FiUserPlus, FiPaperclip } from 'react-icons/fi';

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [assignModal, setAssignModal] = useState({ open: false, ticketId: null });

  useEffect(() => {
    fetchData();
  }, [filters, pagination.page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketsResponse, agentsResponse] = await Promise.all([
        ticketService.getAll({
          page: pagination.page,
          limit: pagination.limit,
          ...filters,
        }),
        adminService.getAgents(),
      ]);
      
      const ticketsData = ticketsResponse.data.data || ticketsResponse.data.tickets || [];
      const agentsData = agentsResponse.data.data || agentsResponse.data || [];
      
      setTickets(ticketsData);
      setAgents(agentsData);
      setPagination((prev) => ({
        ...prev,
        total: ticketsResponse.data.pagination?.total || ticketsData.length,
        pages: ticketsResponse.data.pagination?.pages || 1,
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleAssignTicket = async (ticketId, agentId) => {
    try {
      await ticketService.assign(ticketId, agentId);
      toast.success('Ticket assigned successfully');
      setAssignModal({ open: false, ticketId: null });
      fetchData();
    } catch (error) {
      toast.error('Failed to assign ticket');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Tickets</h1>
        <p className="mt-1 text-sm text-gray-500">Manage all support tickets in the system</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </Card>

      {/* Tickets Table */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader.Spinner />
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={FiInbox}
            title="No tickets found"
            description="No tickets match your current filters"
          />
        ) : (
          <>
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
                      Customer
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket) => (
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
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium text-gray-900 max-w-md truncate">
                            {ticket.title}
                          </div>
                          {ticket.attachments && ticket.attachments.length > 0 && (
                            <span className="inline-flex items-center text-xs text-gray-500" title={`${ticket.attachments.length} attachment(s)`}>
                              <FiPaperclip className="h-3 w-3 mr-1" />
                              {ticket.attachments.length}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{ticket.userId?.name || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {ticket.assignedAgent?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setAssignModal({ open: true, ticketId: ticket._id })}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {ticket.assignedAgent ? 'Reassign' : 'Assign'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Assign Modal */}
      {assignModal.open && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setAssignModal({ open: false, ticketId: null })} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Ticket to Agent</h3>
              <div className="space-y-2">
                {agents.map((agent) => (
                  <button
                    key={agent._id}
                    onClick={() => handleAssignTicket(assignModal.ticketId, agent._id)}
                    className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <div className="font-medium text-gray-900">{agent.name}</div>
                    <div className="text-sm text-gray-500">{agent.email}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setAssignModal({ open: false, ticketId: null })}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTickets;
