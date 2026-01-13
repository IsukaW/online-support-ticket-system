import { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import toast from 'react-hot-toast';
import { FiSave } from 'react-icons/fi';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: 'TicketSupport',
    supportEmail: 'support@ticketsupport.com',
    autoAssign: true,
    emailNotifications: true,
    ticketPrefix: 'TS',
    maxAttachmentSize: 5,
    allowedFileTypes: 'jpg,png,pdf,gif',
  });

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // In a real app, this would call an API endpoint
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure system-wide settings and preferences
        </p>
      </div>

      {/* General Settings */}
      <Card title="General Settings">
        <div className="space-y-4">
          <Input
            label="Site Name"
            type="text"
            value={settings.siteName}
            onChange={(e) => handleChange('siteName', e.target.value)}
          />
          <Input
            label="Support Email"
            type="email"
            value={settings.supportEmail}
            onChange={(e) => handleChange('supportEmail', e.target.value)}
          />
          <Input
            label="Ticket Prefix"
            type="text"
            value={settings.ticketPrefix}
            onChange={(e) => handleChange('ticketPrefix', e.target.value)}
            placeholder="e.g., TS"
          />
        </div>
      </Card>

      {/* Ticket Settings */}
      <Card title="Ticket Settings">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">
                Auto-assign Tickets
              </label>
              <p className="text-sm text-gray-500">
                Automatically assign new tickets to available agents
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoAssign}
                onChange={(e) => handleChange('autoAssign', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              <label className="text-sm font-medium text-gray-900">
                Email Notifications
              </label>
              <p className="text-sm text-gray-500">
                Send email notifications for ticket updates
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* File Upload Settings */}
      <Card title="File Upload Settings">
        <div className="space-y-4">
          <Input
            label="Max Attachment Size (MB)"
            type="number"
            value={settings.maxAttachmentSize}
            onChange={(e) => handleChange('maxAttachmentSize', e.target.value)}
            min="1"
            max="25"
          />
          <Input
            label="Allowed File Types"
            type="text"
            value={settings.allowedFileTypes}
            onChange={(e) => handleChange('allowedFileTypes', e.target.value)}
            placeholder="Comma-separated list (e.g., jpg,png,pdf)"
          />
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSave}>
          <FiSave className="mr-2 h-5 w-5" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;
