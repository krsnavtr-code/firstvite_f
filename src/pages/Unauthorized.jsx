import React from 'react';
import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8 max-w-md w-full">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          You don't have permission to access this page. Please contact the administrator if you believe this is a mistake.
        </p>
        <Link 
          to="/" 
          className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
