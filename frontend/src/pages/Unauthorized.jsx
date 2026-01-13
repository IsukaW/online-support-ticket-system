import { Link } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
          <FiAlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Unauthorized</h1>
        <p className="text-lg text-gray-600 mb-8">
          You don't have permission to access this page.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
