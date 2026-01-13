import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketService, commentService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import toast from 'react-hot-toast';
import {
  FiArrowLeft,
  FiUser,
  FiCalendar,
  FiTag,
  FiAlertCircle,
  FiPaperclip,
  FiSend,
  FiX,
} from 'react-icons/fi';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [commentAttachments, setCommentAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFileDownload = async (url, filename) => {
    try {
      const token = localStorage.getItem('accessToken');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
      
      const response = await fetch(fullUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast.error('Failed to download file');
      console.error('Download error:', error);
    }
  };

  useEffect(() => {
    fetchTicketData();
  }, [id]);

  const fetchTicketData = async () => {
    try {
      setLoading(true);
      const [ticketData, commentsData] = await Promise.all([
        ticketService.getTicketById(id),
        commentService.getComments(id),
      ]);
      setTicket(ticketData.data.data || ticketData.data);
      setComments(commentsData.data.data || commentsData.data || []);
    } catch (error) {
      toast.error('Failed to load ticket details');
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid file type`);
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Max size is 5MB`);
        return false;
      }
      return true;
    });
    setCommentAttachments((prev) => [...prev, ...validFiles]);
  };

  const removeCommentFile = (index) => {
    setCommentAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('ticketId', id);
      formData.append('message', commentText);
      
      // Append files
      commentAttachments.forEach((file) => {
        formData.append('attachments', file);
      });
      
      const response = await commentService.addComment(id, formData);
      setComments((prev) => [...prev, response.data.data || response.data]);
      setCommentText('');
      setCommentAttachments([]);
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await ticketService.updateTicket(id, { status: newStatus });
      setTicket(response.data.data || response.data);
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <Loader.PageLoader />;
  }

  if (!ticket) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/tickets')}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          Back to Tickets
        </button>
      </div>

      {/* Ticket Info */}
      <Card>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
                <span className="text-gray-500">#{ticket._id?.slice(-6)}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <FiUser className="mr-1 h-4 w-4" />
                  {ticket.userId?.name || 'N/A'}
                </div>
                <div className="flex items-center">
                  <FiCalendar className="mr-1 h-4 w-4" />
                  {new Date(ticket.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-gray-200">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Category</p>
              <div className="flex items-center text-sm font-medium text-gray-900">
                <FiTag className="mr-1 h-4 w-4" />
                <span className="capitalize">{ticket.category?.replace('_', ' ') || 'N/A'}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Priority</p>
              <div className="flex items-center text-sm font-medium text-gray-900">
                <FiAlertCircle className="mr-1 h-4 w-4" />
                <span className="capitalize">{ticket.priority || 'N/A'}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Assigned To</p>
              <p className="text-sm font-medium text-gray-900">
                {ticket.assignedAgent?.name || 'Unassigned'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Last Updated</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(ticket.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Attachments</h3>
              <div className="flex flex-wrap gap-2">
                {ticket.attachments.map((attachment, index) => (
                  <button
                    key={attachment._id || index}
                    onClick={() => handleFileDownload(attachment.url, attachment.filename)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FiPaperclip className="mr-2 h-4 w-4" />
                    {attachment.filename || 'Attachment'}
                    {attachment.size && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({(attachment.size / 1024).toFixed(1)} KB)
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status Actions */}
          {user?.role === 'user' && ticket.status === 'resolved' && (
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => handleStatusChange('open')}
              >
                Reopen Ticket
              </Button>
              <Button
                variant="primary"
                onClick={() => handleStatusChange('closed')}
              >
                Close Ticket
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Comments */}
      <Card title="Comments">
        <div className="space-y-6">
          {/* Comments List */}
          {comments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No comments yet</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment._id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <FiUser className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.userId?.name || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          ({comment.userId?.role || 'user'})
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.message}</p>
                    {comment.attachments && comment.attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {comment.attachments.map((attachment, index) => (
                          <button
                            key={attachment._id || index}
                            onClick={() => handleFileDownload(attachment.url, attachment.filename)}
                            className="inline-flex items-center text-xs text-primary-600 hover:text-primary-700"
                          >
                            <FiPaperclip className="mr-1 h-3 w-3" />
                            {attachment.filename || 'Attachment'}
                            {attachment.size && (
                              <span className="ml-1 text-gray-500">
                                ({(attachment.size / 1024).toFixed(1)} KB)
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment Form */}
          {ticket.status !== 'closed' && (
            <form onSubmit={handleAddComment} className="pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <FiUser className="h-5 w-5 text-primary-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                  
                  {/* Comment Attachments */}
                  {commentAttachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {commentAttachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                        >
                          <div className="flex items-center space-x-2">
                            <FiPaperclip className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-700">{file.name}</span>
                            <span className="text-gray-500">
                              ({(file.size / 1024).toFixed(2)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCommentFile(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FiX className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center justify-between">
                    <label className="cursor-pointer inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
                      <FiPaperclip className="mr-1 h-4 w-4" />
                      Attach files
                      <input
                        type="file"
                        multiple
                        onChange={handleCommentFileChange}
                        className="hidden"
                        accept="image/*,.pdf"
                      />
                    </label>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={submitting}
                      disabled={!commentText.trim() || submitting}
                    >
                      <FiSend className="mr-2 h-4 w-4" />
                      Add Comment
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TicketDetail;
