import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../services';
import { Card } from '../../components/common/Card';
import { Input, Textarea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';
import { FiPaperclip, FiX } from 'react-icons/fi';

const CreateTicket = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
  });
  const [attachments, setAttachments] = useState([]);
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing' },
    { value: 'account', label: 'Account' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'feature_request', label: 'Feature Request' },
    { value: 'bug_report', label: 'Bug Report' },
    { value: 'other', label: 'Other' },
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
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
    setAttachments((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('priority', formData.priority);
      
      // Append files
      attachments.forEach((file) => {
        formDataToSend.append('attachments', file);
      });
      
      const response = await ticketService.create(formDataToSend);
      toast.success('Ticket created successfully!');
      navigate(`/tickets/${response.data.data._id || response.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Ticket</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill out the form below to submit a new support ticket
        </p>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            placeholder="Brief description of your issue"
            required
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              error={errors.category}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </Select>

            <Select
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
            >
              {priorities.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </Select>
          </div>

          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            placeholder="Provide detailed information about your issue..."
            rows={6}
            required
          />

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments <span className="text-gray-400 text-xs">(Optional - Max 5 files)</span>
            </label>
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FiPaperclip className="mr-2 h-5 w-5" />
                Choose Files
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf"
                />
              </label>
              <span className="text-xs text-gray-500">
                PNG, JPG, GIF or PDF (max 5MB each)
              </span>
            </div>

            {/* File List */}
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FiPaperclip className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/tickets')}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Create Ticket
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateTicket;
