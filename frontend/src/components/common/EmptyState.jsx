import { Link } from 'react-router-dom';
import { FiInbox } from 'react-icons/fi';
import { Button } from './Button';

export const EmptyState = ({ 
  icon: Icon = FiInbox, 
  title = 'No data found', 
  description, 
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-16 w-16 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 mb-4 max-w-md">{description}</p>
      )}
      {action && (
        <div>
          {action.href ? (
            <Link to={action.href}>
              <Button variant="primary">{action.label}</Button>
            </Link>
          ) : (
            <Button variant="primary" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
