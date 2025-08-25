import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import userApi from '../../api/userApi';
import { useNavigate } from 'react-router-dom';
import { Card, Progress, Button, message } from 'antd';
import { BookOutlined, ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useLMS } from '../../contexts/LMSContext';

const { Meta } = Card;

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

const Profile = () => {
  const { currentUser: authUser, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (authUser) {
      setFormData({
        fullname: authUser.fullname || '',
        email: authUser.email || '',
        phone: authUser.phone || '',
        address: authUser.address || ''
      });
    }
  }, [authUser]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Check if user is authenticated
      if (!authUser) {
        throw new Error('User not authenticated');
      }
      
      // Only send phone and address to the profile update endpoint
      const { phone, address } = formData;
      
      // Validate at least one field is being updated
      if (!phone && !address) {
        throw new Error('Please provide at least one field to update');
      }
      
      const response = await userApi.updateProfile({ phone, address });
      
      if (response && response.success) {
        // Update the local auth user with the new data
        updateUser({
          ...authUser,
          ...(phone && { phone }),
          ...(address && { address })
        });
        
        // Update the form data with the latest values
        setFormData(prev => ({
          ...prev,
          phone: phone || prev.phone,
          address: address || prev.address
        }));
        
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        throw new Error(response?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 401) {
        // Clear invalid auth data and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('Users');
        navigate('/login', { state: { from: '/profile' } });
      }
      toast.error(error.response?.data?.message || error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  const { enrollments, loading, loadEnrollments, error } = useLMS();
    ;
  
    useEffect(() => {
      const fetchEnrollments = async () => {
        try {
          console.log('Fetching enrollments...');
          await loadEnrollments();
          console.log('Enrollments loaded successfully');
        } catch (err) {
          console.error('Error loading enrollments:', err);
          message.error(error || 'Failed to load your courses');
        }
      };
      
      fetchEnrollments();
    }, [loadEnrollments, error]);
  
    const handleCourseClick = (courseId) => {
      navigate(`/lms/courses/${courseId}`);
    };
  
  if (!authUser) {
    navigate('/login', { state: { from: '/profile' } });
    return null;
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          {isEditing && (
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* My Learning */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          My Learning
        </h2>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => {
                const course = enrollment.course;
                const progress = Math.round(enrollment.progress || 0);
                const isCompleted = enrollment.completionStatus === 'completed';
                const lastAccessed = enrollment.updatedAt 
                  ? new Date(enrollment.updatedAt).toLocaleDateString() 
                  : 'Never';
                
                return (
                  <Card
                    key={enrollment._id}
                    className="h-full flex flex-col group hover:shadow-lg transition-all duration-200 border border-gray-900"
                    hoverable
                    onClick={() => handleCourseClick(course._id)}
                    cover={
                      <div className="h-48 bg-gray-50 flex items-center border border-gray-900 border-b-0 justify-center overflow-hidden relative">
                        {course.thumbnail ? (
                          <img
                            alt={course.title}
                            src={course.thumbnail}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/300x200?text=Course";
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <BookOutlined className="text-5xl mb-2" />
                            <span>No Preview Available</span>
                          </div>
                        )}
                        {isCompleted && (
                          <div className="absolute top-3 right-3 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                            <CheckCircleOutlined className="mr-1" /> Completed
                          </div>
                        )}
                      </div>
                    }
                  >
                    <Meta
                      title={
                        <div className="flex justify-between items-start">
                          <span className="text-lg font-semibold text-gray-900 line-clamp-2">
                            {course?.title || "Untitled Course"}
                          </span>
                        </div>
                      }
                    />
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Button
                        type={isCompleted ? "default" : "primary"}
                        className="bg-gray-900 hover:bg-gray-800"
                        block
                        icon={
                          isCompleted ? (
                            <CheckCircleOutlined />
                          ) : (
                            <ArrowRightOutlined />
                          )
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCourseClick(course._id);
                        }}
                      >
                        {isCompleted ? "View Course" : "Continue Learning"}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
      
      
    </div>
  );
};

export default Profile;
