import React, { useEffect } from 'react';
import { Card, Progress, Button, Empty, Skeleton, message, Tag } from 'antd';
import { BookOutlined, ArrowRightOutlined, TrophyOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useLMS } from '../../contexts/LMSContext';
import { useNavigate } from 'react-router-dom';

const { Meta } = Card;

const Dashboard = () => {
  const { enrollments, loading, loadEnrollments, error } = useLMS();
  const navigate = useNavigate();

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

  if (loading && enrollments.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-black">
        <h1 className="text-3xl font-bold mb-8">My Learning</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-80 shadow-sm hover:shadow-md transition-shadow">
              <Skeleton active avatar paragraph={{ rows: 3 }} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-black">
        <h1 className="text-3xl font-bold mb-8">My Learning</h1>
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <Empty 
            description={
              <div className="flex flex-col items-center">
                <p className="text-lg text-gray-700 mb-4">You haven't enrolled in any courses yet</p>
                <p className="text-gray-500 mb-6">Browse our course catalog to start learning!</p>
              </div>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                type="primary" 
                size="large"
                onClick={() => navigate('/courses')}
                icon={<BookOutlined />}
                className="mb-2 sm:mb-0"
              >
                Browse All Courses
              </Button>
              <Button 
                size="large"
                onClick={() => navigate('/courses?popular=true')}
                icon={<TrophyOutlined />}
              >
                Popular Courses
              </Button>
            </div>
          </Empty>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto text-black">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Learning</h1>
          <p className="text-gray-600 mt-1">
            {enrollments.length}{" "}
            {enrollments.length === 1 ? "course" : "courses"} in progress
          </p>
        </div>
        <Button
          icon={<BookOutlined />}
          onClick={() => navigate("/courses")}
          className="text-white bg-[#1677ff] hover:bg-[#1677ff]"
        >
          Browse More Courses
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map((enrollment) => {
          const course = enrollment.course;
          const progress = Math.round(enrollment.progress || 0);
          const isCompleted = enrollment.completionStatus === "completed";
          const lastAccessed = enrollment.updatedAt
            ? new Date(enrollment.updatedAt).toLocaleDateString()
            : "Never";

          return (
            <Card
              key={enrollment._id}
              className="h-full flex flex-col group hover:shadow-lg transition-all duration-200 border border-gray-900 bg-gray-200 dark:bg-[#001525] dark:text-white"
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
                    <div className="absolute top-3 right-3 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium flex items-center dark:bg-[#001525] dark:text-white">
                      <CheckCircleOutlined className="mr-1" /> Completed
                    </div>
                  )}
                </div>
              }
            >
              <Meta
                title={
                  <div className="flex justify-between items-start">
                    <span className="text-lg font-semibold text-black dark:text-white line-clamp-2">
                      {course?.title || "Untitled Course"}
                    </span>
                  </div>
                }
              />
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button
                  type={isCompleted ? "default" : "primary"}
                  className="text-white bg-[#1677ff] hover:bg-[#1677ff]"
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

export default Dashboard;
