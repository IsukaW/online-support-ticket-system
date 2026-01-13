const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`animate-spin rounded-full border-4 border-gray-300 border-t-primary-600 ${sizes[size]} ${className}`} />
  );
};

const PageLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

const ButtonLoader = () => {
  return <Spinner size="sm" className="mr-2" />;
};

// Default export as an object with all loaders
export const Loader = {
  Spinner,
  PageLoader,
  ButtonLoader,
};

// Also export default for convenience
export default Loader;
