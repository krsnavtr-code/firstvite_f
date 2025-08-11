import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;

  // Track Google Ads conversion
  useEffect(() => {
    if (window.gtag) {
      window.gtag("event", "conversion", {
        send_to: "AW-16986190204/pOYXCKjcwfwaEPzi0qM_",
        transaction_id: "",
        value: 1.0,
        currency: "INR",
        event_callback: function () {
          console.log("Conversion tracked on thank you page");
        },
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
          <FaCheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Thank You!
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          {state?.message || 'Your message has been sent successfully!'}
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          We'll get back to you soon.
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
