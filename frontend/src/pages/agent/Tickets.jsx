import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketService } from '../../services';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { 
  FiSearch, 
  FiFilter, 
  FiInbox, 
  FiCheck, 
  FiRotateCcw, 
  FiX, 
  FiMoreVertical,
  FiEye,
  FiPaperclip
} from 'react-icons/fi';

const AgentTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolution, setResolution] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(null);
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

  useEffect(() => {
    fetchTickets();
  }, [filters, pagination.page]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.dropdown-container')) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };
      const response = await ticketService.getAll(params);
      setTickets(response.data.data || response.data.tickets || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 1,
      }));
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await ticketService.updateTicket(ticketId, { status: newStatus });
      toast.success('Status updated successfully');
      fetchTickets();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleResolveTicket = async (ticketId) => {
    try {
      setActionLoading(ticketId);
      await ticketService.update(ticketId, { status: 'resolved' });
      toast.success('Ticket resolved successfully');
      fetchTickets();
    } catch (error) {
      toast.error('Failed to resolve ticket');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReopenTicket = async (ticketId) => {
    try {
      setActionLoading(ticketId);
      await ticketService.reopen(ticketId);
      toast.success('Ticket reopened successfully');
      fetchTickets();
    } catch (error) {
      toast.error('Failed to reopen ticket');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket || !resolution.trim()) {
      toast.error('Please provide a resolution note');
      return;
    }

    try {
      setActionLoading(selectedTicket._id);
      await ticketService.close(selectedTicket._id, resolution);
      toast.success('Ticket closed successfully');
      setShowCloseModal(false);
      setSelectedTicket(null);
      setResolution('');
      fetchTickets();
    } catch (error) {
      toast.error('Failed to close ticket');
    } finally {
      setActionLoading(null);
    }
  };

  const openCloseModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowCloseModal(true);
    setResolution('');
    setDropdownOpen(null); // Close dropdown when opening modal
  };

  const toggleDropdown = (ticketId) => {
    setDropdownOpen(dropdownOpen === ticketId ? null : ticketId);
  };

  const getTicketActions = (ticket) => {
    const actions = [];
    
    if (ticket.status === 'open' || ticket.status === 'in_progress' || ticket.status === 'reopened') {
      actions.push(
        <button
          key="resolve"
          onClick={() => handleResolveTicket(ticket._id)}
          disabled={actionLoading === ticket._id}
          className="w-full flex items-center px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
        >
          <FiCheck className="mr-2 h-4 w-4" />
          {actionLoading === ticket._id ? 'Resolving...' : 'Resolve'}
        </button>
      );
      
      actions.push(
        <button
          key="close"
          onClick={() => openCloseModal(ticket)}
          disabled={actionLoading === ticket._id}
          className="w-full flex items-center px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
        >
          <FiX className="mr-2 h-4 w-4" />
          Close
        </button>
      );
    }

    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      actions.push(
        <button
          key="reopen"
          onClick={() => handleReopenTicket(ticket._id)}
          disabled={actionLoading === ticket._id}
          className="w-full flex items-center px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
        >
          <FiRotateCcw className="mr-2 h-4 w-4" />
          {actionLoading === ticket._id ? 'Reopening...' : 'Reopen'}
        </button>
      );
    }

    return actions;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assigned Tickets</h1>
        <p className="mt-1 text-sm text-gray-500">Manage tickets assigned to you</p>
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
            title="No tickets assigned"
            description="You don't have any tickets assigned to you yet"
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
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/tickets/${ticket._id}`}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 transition-colors"
                          >
                            <FiEye className="mr-1 h-4 w-4" />
                            View
                          </Link>
                          
                          {getTicketActions(ticket).length > 0 && (
                            <div className="relative dropdown-container">
                              <button 
                                onClick={() => toggleDropdown(ticket._id)}
                                className="inline-flex items-center px-2 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                              >
                                <FiMoreVertical className="h-4 w-4" />
                              </button>
                              {dropdownOpen === ticket._id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                                  <div className="py-1">
                                    {getTicketActions(ticket).map((action, index) => (
                                      <div key={index} onClick={() => setDropdownOpen(null)}>
                                        {action}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
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

      {/* Close Ticket Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Close Ticket</h3>
                <button
                  onClick={() => {
                    setShowCloseModal(false);
                    setSelectedTicket(null);
                    setResolution('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Ticket: <span className="font-medium">{selectedTicket?.title}</span>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Please provide a resolution summary:
                </p>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe how this ticket was resolved..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCloseModal(false);
                    setSelectedTicket(null);
                    setResolution('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseTicket}
                  disabled={!resolution.trim() || actionLoading === selectedTicket?._id}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {actionLoading === selectedTicket?._id ? 'Closing...' : 'Close Ticket'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentTickets;
