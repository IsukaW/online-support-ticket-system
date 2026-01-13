export const Badge = ({ children, variant = 'gray', className = '' }) => {
  const variants = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    gray: 'badge-gray',
    primary: 'bg-primary-100 text-primary-800',
  };

  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const statusConfig = {
    open: { variant: 'info', label: 'Open' },
    in_progress: { variant: 'warning', label: 'In Progress' },
    resolved: { variant: 'success', label: 'Resolved' },
    closed: { variant: 'gray', label: 'Closed' },
    reopened: { variant: 'danger', label: 'Reopened' },
  };

  const config = statusConfig[status] || { variant: 'gray', label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const PriorityBadge = ({ priority }) => {
  const priorityConfig = {
    low: { variant: 'gray', label: 'Low' },
    medium: { variant: 'info', label: 'Medium' },
    high: { variant: 'warning', label: 'High' },
    urgent: { variant: 'danger', label: 'Urgent' },
  };

  const config = priorityConfig[priority] || { variant: 'gray', label: priority };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};
