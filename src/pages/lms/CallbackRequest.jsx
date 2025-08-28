import React from 'react';
import { useNavigate } from 'react-router-dom';

const CallbackRequest = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Callback request submitted</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Thanks! Weve received your request. Our team will reach out to you shortly.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/lms/dashboard')}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallbackRequest;
