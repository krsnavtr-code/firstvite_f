import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLMS } from '../../contexts/LMSContext';
import { Card, Button, Progress, message, Empty, Skeleton } from 'antd';
import { BookOutlined, ArrowRightOutlined, TrophyOutlined } from '@ant-design/icons';

const { Meta } = Card;

const Dashboard = () => {
  const { 
    enrollments, 
    loading, 
    error, 
    loadEnrollments,
    isEnrolled
  } = useLMS();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Dashboard mounted, loading enrollments...');
    loadEnrollments();
  }, []);

  // Log when enrollments change
  useEffect(() => {
    console.log('Enrollments updated:', {
      loading,
      error,
      count: enrollments?.length || 0,
      enrollments
    });
  }, [enrollments, loading, error]);

  const handleCourseClick = (courseId) => {
    navigate(`/lms/courses/${courseId}`);
  };

  if (loading && enrollments.length === 0) {
    return (
      <div className="lms-dashboard">
        <h1>My Learning</h1>
        <div className="enrolled-courses">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="course-card" hoverable>
              <Skeleton active />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lms-dashboard">
        <h1>My Learning</h1>
        <div className="error-message">
          <p>Error loading your courses. Please try again later.</p>
          <Button type="primary" onClick={loadEnrollments}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="lms-dashboard">
      <h1>My Learning</h1>
      
      {enrollments.length === 0 ? (
        <div className="empty-state">
          <Empty 
            description={
              <span>You haven't enrolled in any courses yet</span>
            }
          >
            <Button 
              type="primary" 
              onClick={() => navigate('/courses')}
              icon={<BookOutlined />}
            >
              Browse Courses
            </Button>
          </Empty>
        </div>
      ) : (
        <div className="enrolled-courses">
          {enrollments.map((enrollment) => {
            const course = enrollment.course;
            const progress = enrollment.progress || 0;
            const isCompleted = enrollment.completionStatus === 'completed';
            
            return (
              <Card 
                key={enrollment._id}
                className="course-card"
                hoverable
                onClick={() => handleCourseClick(course._id)}
                cover={
                  <div className="course-image-container">
                    {course.image ? (
                      <img 
                        alt={course.title}
                        src={course.image.startsWith('http') ? course.image : `${import.meta.env.VITE_API_BASE_URL}${course.image}`}
                        className="course-image"
                      />
                    ) : (
                      <div className="course-image-placeholder">
                        <BookOutlined style={{ fontSize: '48px', color: '#888' }} />
                      </div>
                    )}
                    {isCompleted && (
                      <div className="course-completed-badge">
                        <TrophyOutlined /> Completed
                      </div>
                    )}
                  </div>
                }
              >
                <Meta
                  title={course.title}
                  description={
                    <div className="course-meta">
                      <div className="progress-container">
                        <div className="progress-header">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress 
                          percent={progress} 
                          showInfo={false} 
                          strokeColor="#1890ff"
                        />
                      </div>
                      <div className="course-actions">
                        <Button 
                          type="primary" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCourseClick(course._id);
                          }}
                        >
                          {isCompleted ? 'View Course' : 'Continue'}
                          <ArrowRightOutlined />
                        </Button>
                      </div>
                    </div>
                  }
                />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
