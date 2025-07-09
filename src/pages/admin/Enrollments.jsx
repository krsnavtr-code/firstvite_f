import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { getPendingEnrollments, updateEnrollmentStatus } from '../../api/adminApi';

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchPendingEnrollments = async () => {
    try {
      setLoading(true);
      const { data } = await getPendingEnrollments();
      setEnrollments(data.enrollments || []);
    } catch (error) {
      console.error('Error fetching pending enrollments:', error);
      toast.error(error.response?.data?.message || 'Error fetching enrollments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingEnrollments();
  }, []);

  const handleStatusUpdate = async (enrollmentId, status) => {
    try {
      setUpdating(enrollmentId);
      await updateEnrollmentStatus(enrollmentId, status);
      toast.success(`Enrollment ${status} successfully`);
      await fetchPendingEnrollments(); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Error updating status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Pending Enrollments</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-md">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pending Enrollments</h1>
      
      {enrollments.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600">No pending enrollments found.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {enrollments.map((enrollment) => (
                <tr key={enrollment._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {enrollment.user?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {enrollment.user?.email || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {enrollment.course?.title || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {enrollment.course?.instructor?.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(enrollment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(enrollment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="space-x-2">
                      <button
                        onClick={() => handleStatusUpdate(enrollment._id, 'active')}
                        disabled={updating === enrollment._id}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        {updating === enrollment._id ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(enrollment._id, 'rejected')}
                        disabled={updating === enrollment._id}
                        className="text-red-600 hover:text-red-900 ml-4 disabled:opacity-50"
                      >
                        {updating === enrollment._id ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminEnrollments;
