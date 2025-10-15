import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { Button } from '../components/ui/button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center px-4">
        {/* 404 Animation */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-red-600 animate-pulse">404</h1>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
          <Button
            onClick={() => navigate('/search?q=viral')}
            variant="outline"
            className="border-gray-700 hover:bg-gray-800 px-6 py-3"
          >
            <Search className="w-5 h-5 mr-2" />
            Search Posts
          </Button>
        </div>

        {/* Decorative Element */}
        <div className="mt-12 opacity-50">
          <p className="text-gray-600 text-sm">
            Lost in the feed? Let us help you find what you're looking for.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
