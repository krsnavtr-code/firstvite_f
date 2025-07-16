import React from 'react';
import { Link } from 'react-router-dom';

const PendingApproval = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Pending Approval
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your account is pending approval from an administrator. You'll receive an email once your account has been approved.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
