import React from 'react';
import { Link } from 'react-router-dom';

const InactiveAccount = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Account Inactive
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your account is currently inactive. Please contact support for assistance.
          </p>
          <div className="mt-6">
            <Link
              to="/contact"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InactiveAccount;
