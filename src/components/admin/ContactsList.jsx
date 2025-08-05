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
    limit: 15,
    total: 0,
    totalPages: 1
  });
  const [filters, setFilters] = useState({
    status: "",
    date: ""
  });

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
        ...(filters.date && { date: filters.date }),
      };
      
      console.log('Fetching contacts with filters:', {
        status: filters.status,
        date: filters.date,
        page: pagination.page,
        limit: pagination.limit
      });

      const response = await getContacts(params);

      if (response.success) {
        setContacts(response.data || []);
        
        // Calculate pagination values
        const totalItems = response.meta?.total || response.meta?.totalItems || response.data?.length || 0;
        const itemsPerPage = response.meta?.limit || pagination.limit;
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
        const currentPage = response.meta?.currentPage || response.meta?.page || pagination.page;
        
        console.log('Updating pagination state:', {
          total: totalItems,
          totalPages,
          currentPage,
          limit: itemsPerPage
        });
        
        // Update pagination state with calculated values
        setPagination(prev => ({
          ...prev,
          total: totalItems,
          totalPages: totalPages,
          page: currentPage,
          limit: itemsPerPage
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

        {/* Filter By Date */}
        <div className="w-full sm:w-auto flex gap-2">
          <input
            type="date"
            value={filters.date || ""}
            onChange={(e) => {
              setFilters({ ...filters, date: e.target.value });
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="block w-full sm:w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
          />
          {filters.date && (
            <button
              onClick={() => setFilters({ ...filters, date: "" })}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              title="Clear date filter"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                S.No
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Contact Info
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Courses
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Submitted
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {contacts.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No contact submissions found
                </td>
              </tr>
            ) : (
              contacts.map((contact, index) => (
                <tr
                  key={contact._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {/* Incress number with pagination */}
                    {index + 1 + (pagination.page - 1) * pagination.limit}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    <div>
                      <span className="text-blue-600">Name:</span>{" "}
                      {contact.name}
                    </div>
                    <div>
                      <span className="text-blue-600">Email:</span>{" "}
                      {contact.email}
                    </div>
                    {contact.phone && (
                      <div>
                        <span className="text-blue-600">Number:</span>{" "}
                        {contact.phone}
                      </div>
                    )}
                    {contact.message && (
                      <div className="mt-2 line-clamp-2">
                        <span className="text-blue-600">Message:</span>{" "}
                        {contact.message}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-black dark:text-white">
                    <span className="text-blue-600">Course Name:</span>{" "}
                    {contact.courseTitle}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-400">
                    <div>
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
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-400">
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Debug Info - Commented out for production
      <div className="bg-yellow-50 p-2 mb-4 rounded text-xs text-gray-700">
        <p>Debug Info:</p>
        <p>Total Items: {pagination.total}</p>
        <p>Items per Page: {pagination.limit}</p>
        <p>Total Pages: {pagination.totalPages}</p>
        <p>Current Page: {pagination.page}</p>
        <p>Show Pagination: {pagination.total > pagination.limit ? 'Yes' : 'No'}</p>
      </div>
      */}

      {/* Pagination */}
      <div className="bg-white dark:bg-gray-800 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
      {pagination.total > 0 && (
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

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Showing{" "}
              <span className="font-medium">
                {pagination.total === 0
                  ? 0
                  : (pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-medium">{pagination.total}</span>{" "}
              {pagination.total === 1 ? "entry" : "entries"}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const newPage = Math.max(1, pagination.page - 1);
                    setPagination((prev) => ({ ...prev, page: newPage }));
                  }}
                  disabled={pagination.page === 1}
                  className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Previous
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: pageNum,
                            }))
                          }
                          className={`min-w-[32px] h-8 flex items-center justify-center rounded-md ${
                            pagination.page === pageNum
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                          } text-sm font-medium`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}

                  {pagination.totalPages > 5 &&
                    pagination.page < pagination.totalPages - 2 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}

                  {pagination.totalPages > 5 &&
                    pagination.page < pagination.totalPages - 2 && (
                      <button
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            page: pagination.totalPages,
                          }))
                        }
                        className="min-w-[32px] h-8 flex items-center justify-center rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
                      >
                        {pagination.totalPages}
                      </button>
                    )}
                </div>

                <button
                  onClick={() => {
                    const newPage = Math.min(
                      pagination.page + 1,
                      pagination.totalPages
                    );
                    setPagination((prev) => ({ ...prev, page: newPage }));
                  }}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ContactsList;
