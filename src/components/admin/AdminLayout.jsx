import React, { useEffect, useMemo } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const AdminLayout = () => {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("AdminLayout - Logging out");
    // The logout function should be provided by the AuthContext
    navigate("/login");
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Check if user has any admin role
  const hasAdminAccess = useMemo(() => {
    return currentUser && ['superChildAdmin', 'admin', 'childAdmin'].includes(currentUser.role);
  }, [currentUser]);

  const location = useLocation();

  // Redirect to unauthorized if user doesn't have admin access
  useEffect(() => {
    if (!loading && (!currentUser || !hasAdminAccess)) {
      console.log('AdminLayout - Redirecting to unauthorized');
      navigate('/unauthorized');
    }
  }, [currentUser, hasAdminAccess, loading, navigate]);

  if (!currentUser || !isAuthenticated || !hasAdminAccess) {
    console.log("AdminLayout - No user or not authenticated");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h2>
          <p className="mb-4">You must be logged in to access this page.</p>
          <Link
            to="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="pb-8 bg-indigo-800 text-white w-64 flex-shrink-0 flex flex-col h-screen">
          <div className="p-4 flex-shrink-0">
            <h1 className="text-2xl font-bold text-indigo-100">
            {currentUser.role === 'superChildAdmin' ? 'Super Child Admin' : 
             currentUser.role === 'admin' ? 'Admin' : 'Child Admin'} Panel
          </h1>
            <p className="text-indigo-200 text-sm">
              Welcome, {currentUser?.fullname || "Admin"} 
              <span className="ml-2 px-2 py-0.5 bg-indigo-600 rounded text-xs">
                {currentUser.role}
              </span>
            </p>
          </div>

          <nav className="flex-1 overflow-y-auto">
            <div>
              {/* Dashboard - Accessible to all admin roles */}
              <Link
                to="/admin/dashboard"
                className="flex items-center px-6 py-3 text-indigo-100 hover:bg-indigo-700"
              >
                <svg
                  className="h-5 w-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Dashboard
              </Link>

              {/* Courses - Accessible to all admin roles */}
              <Link
                to="/admin/courses"
                className="flex items-center px-6 py-3 text-indigo-100 hover:bg-indigo-700"
              >
                <svg
                  className="h-5 w-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Courses
              </Link>

              {/* User Management - Only for superChildAdmin and admin */}
              {(currentUser.role === 'superChildAdmin' || currentUser.role === 'admin') && (
                <Link
                  to="/admin/users"
                  className="flex items-center px-6 py-3 text-indigo-100 hover:bg-indigo-700"
                >
                  <svg
                    className="h-5 w-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  User Management
                </Link>
              )}

              {/* System Settings - Only for superChildAdmin */}
              {currentUser.role === 'superChildAdmin' && (
                <Link
                  to="/admin/settings"
                  className="flex items-center px-6 py-3 text-indigo-100 hover:bg-indigo-700"
                >
                  <svg
                    className="h-5 w-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  System Settings
                </Link>
              )}
              
              
              <Link
                to="/admin/send-brochure"
                className="flex items-center px-6 py-3 text-indigo-100 hover:bg-indigo-700"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                  />
                </svg>
                Send Brochure
              </Link>

              <Link
                to="/admin/categories"
                className="flex items-center px-6 py-3 text-indigo-100 hover:bg-indigo-700"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                Categories
              </Link>

              <Link
                to="/admin/users"
                className="flex items-center px-6 py-3 text-indigo-100 hover:bg-indigo-700"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Users
              </Link>

              <Link
                to="/admin/blog"
                className="flex items-center px-6 py-3 text-indigo-100 hover:bg-indigo-700"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                Blog
              </Link>

              <Link
                to="/admin/contacts"
                className="flex items-center px-6 py-3 text-indigo-100 hover:bg-indigo-700"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                Contacts
              </Link>

              <Link
                to="/admin/payments"
                className="flex items-center px-6 py-3 text-indigo-100 hover:bg-indigo-700"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Payments
              </Link>

              <Link
                to="/admin/enrollments"
                className="flex items-center px-6 py-3 text-indigo-100 hover:bg-indigo-700"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Enrollments
              </Link>

              <Link
                to="/admin/faqs"
                className="flex items-center px-6 py-3 text-indigo-100 hover:bg-indigo-700"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                FAQs
              </Link>

              <Link
                to="/admin/image-gallery"
                className="flex items-center px-6 py-3 text-indigo-100 hover:bg-indigo-700"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Media Gallery
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center px-6 py-3 text-indigo-100 hover:bg-indigo-700"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
