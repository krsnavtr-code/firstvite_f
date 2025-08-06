import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast';
import userApi from '../../api/userApi';
import { useAuth } from '../../contexts/AuthContext';

// Modal components
const UserModal = ({ user, onClose, onSave, isOpen }) => {
  const [formData, setFormData] = useState({
    fullname: user?.fullname || '',
    email: user?.email || '',
    role: user?.role || 'user',
    ...(user ? {} : { password: '' }) // Only show password field for new users
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {user ? 'Edit User' : 'Add New User'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                disabled={!!user}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                disabled={user?.role === 'superChildAdmin'}
              >
                <option value="user">User</option>
                <option value="childAdmin">Child Admin</option>
                <option value="admin">Admin</option>
                {user?.role === 'superChildAdmin' && (
                  <option value="superChildAdmin">Super Child Admin</option>
                )}
              </select>
            </div>
            {!user && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required={!user}
                  minLength={6}
                />
              </div>
            )}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {user ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ChangePasswordModal = ({ userId, onClose, onSave, isOpen }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        await onSave(userId, formData.currentPassword, formData.newPassword);
        onClose();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to change password');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                required
                minLength={6}
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                required
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Users = () => {
  const { currentUser: authUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  
  // Check if current user can edit a specific role
  const canEditRole = (targetRole) => {
    if (!authUser) return false;
    
    const userRole = authUser.role?.toLowerCase();
    const targetRoleLower = targetRole?.toLowerCase();
    
    // Super Child Admin can edit all roles
    if (userRole === 'superchildadmin') return true;
    
    // Admin can edit childAdmin and user roles
    if (userRole === 'admin') {
      return ['childadmin', 'user'].includes(targetRoleLower);
    }
    
    // Child Admin can only edit user roles
    if (userRole === 'childadmin') {
      return targetRoleLower === 'user';
    }
    
    return false;
  };
  
  // Check if current user can delete a user based on their role
  const canDeleteUser = (targetRole) => {
    return canEditRole(targetRole);
  };
  // Check if current user is an admin of any level
  const isAdminUser = authUser && ['superchildadmin', 'admin', 'childadmin'].includes(authUser.role?.toLowerCase());
  
  // Fetch users on component mount or when authUser changes
  useEffect(() => {
    if (authUser) {
      fetchUsers();
    }
  }, [authUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      let errorMessage = 'Failed to load users';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to view users.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData) => {
    // Check if current user has permission to create this role
    if (!canEditRole(userData.role)) {
      toast.error('You do not have permission to create a user with this role');
      return;
    }
    
    try {
      await userApi.create(userData);
      toast.success('User created successfully');
      await fetchUsers();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (userData) => {
    if (!editingUserId) return;
    
    // Find the user being edited
    const targetUser = users.find(u => u._id === editingUserId);
    if (!targetUser) return;
    
    // Check if current user has permission to update this user's role
    if (userData.role !== targetUser.role && !canEditRole(userData.role)) {
      toast.error('You do not have permission to assign this role');
      return;
    }
    
    try {
      await userApi.update(editingUserId, userData);
      toast.success('User updated successfully');
      await fetchUsers();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!user) return;
    
    // Check if current user has permission to delete this user
    if (!canDeleteUser(user.role)) {
      toast.error('You do not have permission to delete this user');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${user.fullname || 'this user'}?`)) {
      try {
        await userApi.delete(user._id);
        toast.success('User deleted successfully');
        await fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleChangePassword = async (userId, currentPassword, newPassword) => {
    try {
      await userApi.changePassword(userId, currentPassword, newPassword);
      toast.success('Password changed successfully');
      setIsPasswordModalOpen(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleToggleStatus = async (user, currentStatus) => {
    if (!user) return;
    
    // Check if current user has permission to modify this user
    if (!canEditRole(user.role)) {
      toast.error('You do not have permission to modify this user');
      return;
    }
    
    try {
      await userApi.updateStatus(user._id, !currentStatus);
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      await fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleEditClick = (user) => {
    // Check if current user has permission to edit this user
    if (!canEditRole(user.role)) {
      toast.error('You do not have permission to edit this user');
      return;
    }
    
    setCurrentUser(user);
    setEditingUserId(user._id);
    setIsModalOpen(true);
  };

  const handleAddUser = () => {
    // Check if current user has permission to add users
    if (!authUser) {
      toast.error('You must be logged in to add users');
      return;
    }
    
    setCurrentUser(null);
    setEditingUserId(null);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="text-gray-600">Loading users...</p>
      </div>
    );
  }

  // Render unauthorized state for non-admin users
  if (!isAdminUser) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 w-full">
          <p className="font-bold">Access Denied</p>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Users Management</h2>
        {canEditRole('user') && (
          <button 
            onClick={handleAddUser}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New User
          </button>
        )}
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-800 font-medium">
                            {user.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.fullname || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="font-medium">{user.email}</div>
                      <div className="text-xs text-gray-400">
                        Last login: {new Date(user.lastLogin).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'superChildAdmin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : user.role === 'admin' 
                            ? 'bg-blue-100 text-blue-800' 
                            : user.role === 'childAdmin' 
                              ? 'bg-cyan-100 text-cyan-800' 
                              : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.role === 'student' && (
                        <div>
                          <div>ID: {user.studentId}</div>
                          <div>{user.course} (Sem {user.semester})</div>
                        </div>
                      )}
                      {user.role === 'teacher' && (
                        <div>
                          <div>ID: {user.employeeId}</div>
                          <div>{user.department}</div>
                          <div className="text-xs text-gray-400">
                            {user.subjects?.join(', ')}
                          </div>
                        </div>
                      )}
                      {user.role === 'admin' && 'System Administrator'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {canEditRole(user.role) && (
                          <button
                            onClick={() => handleToggleStatus(user, user.isActive)}
                            className="ml-2 text-xs text-gray-500 hover:text-indigo-600"
                            title={user.isActive ? 'Deactivate user' : 'Activate user'}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={user.isActive ? "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2 4h.01M9 16h6" : "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2 4h.01M9 16h6"} />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {canEditRole(user.role) && (
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit user"
                      >
                        Edit
                      </button>
                    )}
                    {canDeleteUser(user.role) && (
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete user"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* User Modal */}
      <UserModal
        user={currentUser}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentUser(null);
          setEditingUserId(null);
        }}
        onSave={editingUserId ? handleUpdateUser : handleCreateUser}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        userId={currentUser?._id}
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setCurrentUser(null);
        }}
        onSave={handleChangePassword}
      />
    </div>
  );
};

export default Users;
