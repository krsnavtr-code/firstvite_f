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
  const [sprintProgress, setSprintProgress] = useState({});

  // Calculate completion percentage for a sprint
  const calculateSprintProgress = (sprint) => {
    if (!sprint.tasks || sprint.tasks.length === 0) return 0;
    
    const completedTasks = sprint.tasks.filter(task => {
      return task.submissions?.some(sub => 
        (sub.user?._id === currentUser?._id || sub.user === currentUser?._id) &&
        sub.status === 'completed'
      );
    });
    
    return Math.round((completedTasks.length / sprint.tasks.length) * 100);
  };

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
        
        // Fetch sprints for this course with tasks
        const response = await getSprintsByCourse(courseId, { populate: 'tasks' });
        console.log('Sprints API Response:', response);
        
        let sprintsData = [];
        if (response && response.data && Array.isArray(response.data.sprints)) {
          sprintsData = response.data.sprints;
        } else if (Array.isArray(response)) {
          sprintsData = response;
        } else {
          console.warn('Unexpected sprints data format:', response);
        }
        
        // Calculate progress for each sprint
        const progressData = {};
        sprintsData.forEach(sprint => {
          progressData[sprint._id] = calculateSprintProgress(sprint);
        });
        
        setSprintProgress(progressData);
        setSprints(sprintsData);
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

  const handleSprintClick = (sprint, e) => {
    // Prevent the card click from interfering with button click
    if (e && e.stopPropagation) e.stopPropagation();
    navigate(`/lms/courses/${courseId}/sprints/${sprint._id}`);
  };

  const getSprintStatus = (sprint) => {
    const progress = sprintProgress[sprint._id] || 0;
    if (progress === 0) return 'Not Started';
    if (progress === 100) return 'Completed';
    return 'In Progress';
  };
  
  const getStatusColor = (sprint) => {
    const progress = sprintProgress[sprint._id] || 0;
    if (progress === 0) return 'default';
    if (progress === 100) return 'success';
    return 'processing';
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
                className="hover:shadow-md transition-shadow"
                onClick={(e) => handleSprintClick(sprint, e)}
              >
                <div className="flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        {sprint.name}
                        <Tag 
                          color={getStatusColor(sprint)}
                          className="ml-2 text-xs"
                        >
                          {getSprintStatus(sprint)}
                        </Tag>
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {sprint.description || 'No description available'}
                      </p>
                      {sprint.duration && (
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <span>Duration: {sprint.duration} days</span>
                          <span className="mx-2">•</span>
                          <span>{sprint.tasks?.length || 0} tasks</span>
                        </div>
                      )}
                    </div>
                    <Button 
                      type="text" 
                      icon={sprintProgress[sprint._id] === 100 ? 
                        <CheckCircleOutlined className="text-green-500" /> : 
                        <PlayCircleOutlined className="text-blue-500" />}
                      className="text-gray-700"
                      onClick={(e) => handleSprintClick(sprint, e)}
                    >
                      {sprintProgress[sprint._id] === 100 ? 'Review' : 'Continue'}
                    </Button>
                  </div>
                  
                  {sprintProgress[sprint._id] > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span className="font-medium">{sprintProgress[sprint._id] || 0}%</span>
                      </div>
                      <Progress 
                        percent={sprintProgress[sprint._id] || 0} 
                        status={sprintProgress[sprint._id] === 100 ? 'success' : 'active'}
                        showInfo={false}
                        strokeWidth={6}
                        className="mb-0"
                      />
                    </div>
                  )}
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
