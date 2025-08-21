import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Progress, Tag, message, Skeleton, Empty, Divider } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined, CheckCircleOutlined, BookOutlined } from '@ant-design/icons';
import { getSprintsByCourse } from '../../api/sprintApi';
import { useLMS } from '../../contexts/LMSContext';

const { Meta } = Card;

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { enrollments } = useLMS();
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);

  useEffect(() => {
    const fetchCourseAndSprints = async () => {
      try {
        setLoading(true);
        
        // Find the enrollment and course data
        const currentEnrollment = enrollments.find(e => e.course._id === courseId);
        if (!currentEnrollment) {
          message.error('Course not found in your enrollments');
          navigate('/lms/dashboard');
          return;
        }
        
        setEnrollment(currentEnrollment);
        setCourse(currentEnrollment.course);
        
        // Fetch sprints for this course
        const response = await getSprintsByCourse(courseId);
        console.log('Sprints API Response:', response); // Debug log
        // The API returns { status: 'success', data: { sprints: [...] } }
        if (response && response.data && Array.isArray(response.data.sprints)) {
          setSprints(response.data.sprints);
        } else if (response && Array.isArray(response)) {
          // Fallback in case the response is just the array
          setSprints(response);
        } else {
          console.warn('Unexpected sprints data format:', response);
          setSprints([]);
        }
      } catch (error) {
        console.error('Error loading course details:', error);
        message.error('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    if (enrollments.length > 0) {
      fetchCourseAndSprints();
    }
  }, [courseId, enrollments, navigate]);

  const handleSprintClick = (sprintId) => {
    navigate(`/lms/courses/${courseId}/sprints/${sprintId}`);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Empty description="Course not found" />
      </div>
    );
  }

  const progress = Math.round(enrollment?.progress || 0);
  const isCompleted = enrollment?.completionStatus === 'completed';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/lms/dashboard')}
        className="mb-4"
      >
        Back to Dashboard
      </Button>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <img 
              src={course.thumbnail || 'https://via.placeholder.com/300x200?text=Course'} 
              alt={course.title}
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x200?text=Course';
              }}
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
                <p className="text-gray-600 mb-4">{course.description || 'No description available'}</p>
                
                <div className="flex items-center gap-4 mb-4">
                  <Tag color={isCompleted ? 'success' : 'processing'} className="text-sm">
                    {isCompleted ? 'Completed' : 'In Progress'}
                  </Tag>
                  <span className="text-sm text-gray-500">
                    {sprints.length} {sprints.length === 1 ? 'Sprint' : 'Sprints'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Your Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress 
                percent={progress} 
                status={isCompleted ? 'success' : 'active'} 
                showInfo={false}
                className="mb-2"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BookOutlined className="mr-2" /> Course Sprints
        </h2>
        
        {sprints.length === 0 ? (
          <Empty 
            description="No sprints available for this course" 
            className="py-8"
          />
        ) : (
          <div className="space-y-4">
            {sprints.map((sprint) => (
              <Card 
                key={sprint._id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSprintClick(sprint._id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{sprint.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {sprint.description || 'No description available'}
                    </p>
                    {sprint.duration && (
                      <span className="text-xs text-gray-500 mt-2 block">
                        Duration: {sprint.duration} days
                      </span>
                    )}
                  </div>
                  <Button 
                    type="text" 
                    icon={sprint.completed ? <CheckCircleOutlined /> : <PlayCircleOutlined />}
                    className="text-gray-700"
                  >
                    {sprint.completed ? 'Completed' : 'Start'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;
