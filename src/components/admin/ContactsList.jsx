import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getContacts, updateContactStatus } from "../../api/contactApi";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

const statusColors = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  contacted:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  in_progress:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  spam: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  admission_done:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

const statusOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "in_progress", label: "In Progress" },
  { value: "spam", label: "Spam" },
  { value: "admission_done", label: "Admission Done" },
];

const ContactsList = () => {
  const {
    currentUser,
    isAuthenticated,
    loading: authLoading,
    logout,
  } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
    course: "",
  });
  const [courses, setCourses] = useState([]);

  // Fetch available courses for the filter
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (response.ok) {
          const data = await response.json();
          setCourses(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  const fetchContacts = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.course && { courseId: filters.course }),
      };

      const response = await getContacts(params);

      if (response.success) {
        setContacts(response.data || []);
        setPagination((prev) => ({
          ...prev,
          total: (response.meta?.totalPages || 1) * pagination.limit,
          currentPage: response.meta?.currentPage || 1,
        }));
      } else {
        // Handle API error response
        console.error(
          "Error fetching contacts:",
          response.error || response.message
        );
        toast.error(response.message || "Failed to load contacts");

        if (response.shouldLogout) {
          // Handle logout if token is invalid/expired
          logout();
          navigate("/login", { state: { from: "/admin/contacts" } });
        }
      }
    } catch (error) {
      console.error("Error in fetchContacts:", error);
      toast.error(error.message || "An error occurred while fetching contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Get the token from localStorage since we need it for the API call
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      await updateContactStatus(id, newStatus, token);
      await fetchContacts();
      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Failed to update status");

      // If the error is due to authentication, log the user out
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchContacts();
    }
  }, [pagination.page, filters, isAuthenticated, authLoading]);

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Authentication Required
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          You need to be logged in to view contacts.
        </p>
        <button
          onClick={() =>
            navigate("/login", { state: { from: "/admin/contacts" } })
          }
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (authLoading || (loading && !contacts.length)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading contacts...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Contact Submissions
        </h2>

        {/* Filter By Status */}
        <div className="w-full sm:w-auto flex gap-2">
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value });
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="block w-full sm:w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
          >
            <option value="">All Status</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filter By Course */}
        <div className="w-full sm:w-auto flex gap-2">
          <select
            value={filters.course}
            onChange={(e) => {
              setFilters({ ...filters, course: e.target.value });
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
          >
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
        

      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <div className="bg-gray-50 dark:bg-gray-700">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              <div className="col-span-12 sm:col-span-4">Contact Info</div>
              <div className="col-span-12 sm:col-span-4">Courses</div>
              <div className="col-span-6 sm:col-span-2">Submitted</div>
              <div className="col-span-6 sm:col-span-2">Status</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {contacts.length === 0 ? (
              <div className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                No contact submissions found
              </div>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="grid grid-cols-12 gap-4 px-6 py-4">
                    <div className="col-span-12 sm:col-span-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        <span className="text-blue-600">Name:</span> {contact.name}
                      </div>
                      <div className="text-sm text-gray-900 dark:text-gray-400">
                        <span className="text-blue-600">Email:</span> {contact.email}
                      </div>
                      {contact.phone && (
                        <div className="text-sm text-gray-900 dark:text-gray-400">
                          <span className="text-blue-600">Number:</span> {contact.phone}
                        </div>
                      )}
                      {contact.message && (
                        <div className="mt-2 text-sm text-gray-900 dark:text-gray-300 line-clamp-2">
                          <span className="text-blue-600">Message:</span> {contact.message}
                        </div>
                      )}
                    </div>

                    <div className="col-span-12 text-black sm:col-span-4">
                      <span className="text-blue-600">Course Name:</span> {contact.courseTitle}
                    </div>

                    <div className="col-span-6 sm:col-span-2">
                      <div className="text-sm text-gray-900 dark:text-gray-400">
                        {format(
                          new Date(contact.submittedAt || contact.createdAt),
                          "MMM d, yyyy"
                        )}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {format(
                          new Date(contact.submittedAt || contact.createdAt),
                          "h:mm a"
                        )}
                      </div>
                    </div>

                    <div className="col-span-6 sm:col-span-2">
                      <div className="flex flex-col gap-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            statusColors[contact.status]
                          }`}
                        >
                          {contact.status.replace("_", " ")}
                        </span>
                        <select
                          value={contact.status}
                          onChange={(e) =>
                            handleStatusChange(contact._id, e.target.value)
                          }
                          className={`block w-full sm:w-32 text-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                            statusColors[contact.status]
                          }`}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="bg-white dark:bg-gray-800 px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1),
                }))
              }
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page * pagination.limit >= pagination.total}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>

          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing{" "}
                <span className="font-medium">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}
                </span>{" "}
                of <span className="font-medium">{pagination.total}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={
                    pagination.page * pagination.limit >= pagination.total
                  }
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsList;
