import React from 'react';
import { Card, Row, Col, Progress, Button, Tabs, Badge, Empty } from 'antd';
import { 
  PlayCircleOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  BookOutlined,
  TrophyOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;

const MyLearning = () => {
  const navigate = useNavigate();

  // Mock data - replace with actual API calls
  const enrolledCourses = [
    {
      id: 1,
      title: 'Advanced React Development',
      instructor: 'Jane Smith',
      progress: 65,
      thumbnail: 'https://via.placeholder.com/300x150',
      lastAccessed: '2 days ago',
      totalLessons: 24,
      completedLessons: 15
    },
    {
      id: 2,
      title: 'Node.js Fundamentals',
      instructor: 'John Doe',
      progress: 30,
      thumbnail: 'https://via.placeholder.com/300x150',
      lastAccessed: '5 days ago',
      totalLessons: 18,
      completedLessons: 5
    },
  ];

  const recommendedCourses = [
    {
      id: 3,
      title: 'Modern JavaScript',
      instructor: 'Alex Johnson',
      rating: 4.7,
      students: 1250,
      thumbnail: 'https://via.placeholder.com/300x150',
      price: 49.99
    },
    {
      id: 4,
      title: 'UI/UX Design Principles',
      instructor: 'Sarah Williams',
      rating: 4.8,
      students: 980,
      thumbnail: 'https://via.placeholder.com/300x150',
      price: 39.99
    },
  ];

  const learningStats = {
    totalCourses: enrolledCourses.length,
    inProgress: enrolledCourses.filter(course => course.progress > 0 && course.progress < 100).length,
    completed: enrolledCourses.filter(course => course.progress === 100).length,
    totalHours: 42,
    weeklyGoal: 10,
    currentWeekHours: 6
  };

  const renderCourseCard = (course, isEnrolled = true) => (
    <Card 
      key={course.id}
      hoverable
      style={{ width: '100%', marginBottom: 16 }}
      cover={
        <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
          <img 
            alt={course.title} 
            src={course.thumbnail} 
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover' 
            }} 
          />
          {isEnrolled && (
            <div style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              background: 'rgba(0,0,0,0.7)', 
              color: 'white',
              padding: '8px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span><ClockCircleOutlined /> {course.lastAccessed}</span>
              <span><CheckCircleOutlined /> {course.completedLessons}/{course.totalLessons} Lessons</span>
            </div>
          )}
        </div>
      }
    >
      <div style={{ marginBottom: 12 }}>
        <h3 style={{ marginBottom: 4 }}>{course.title}</h3>
        <p style={{ color: '#666', marginBottom: 8 }}>By {course.instructor}</p>
        
        {isEnrolled ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Progress</span>
              <span>{course.progress}%</span>
            </div>
            <Progress percent={course.progress} showInfo={false} />
            <Button 
              type="primary" 
              block 
              style={{ marginTop: 16 }}
              onClick={() => navigate(`/lms/courses/${course.id}`)}
            >
              {course.progress === 0 ? 'Start Learning' : 'Continue Learning'}
            </Button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <StarOutlined style={{ color: '#ffc107', marginRight: 4 }} />
              <span style={{ marginRight: 16 }}>{course.rating}</span>
              <span>{course.students.toLocaleString()} students</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>${course.price}</span>
              <Button type="primary">Enroll Now</Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: 24 }}>My Learning</h1>
      
      {/* Learning Stats */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <BookOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                <h3>Total Courses</h3>
                <p style={{ fontSize: 24, fontWeight: 'bold' }}>{learningStats.totalCourses}</p>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <PlayCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                <h3>In Progress</h3>
                <p style={{ fontSize: 24, fontWeight: 'bold' }}>{learningStats.inProgress}</p>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <CheckCircleOutlined style={{ fontSize: 24, color: '#722ed1' }} />
                <h3>Completed</h3>
                <p style={{ fontSize: 24, fontWeight: 'bold' }}>{learningStats.completed}</p>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <TrophyOutlined style={{ fontSize: 24, color: '#faad14' }} />
                <h3>Learning Hours</h3>
                <p style={{ fontSize: 24, fontWeight: 'bold' }}>{learningStats.totalHours}h</p>
              </div>
            </Card>
          </Col>
        </Row>
        
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>Weekly Learning Goal</span>
            <span>{learningStats.currentWeekHours}h / {learningStats.weeklyGoal}h</span>
          </div>
          <Progress 
            percent={(learningStats.currentWeekHours / learningStats.weeklyGoal) * 100} 
            showInfo={false}
            strokeColor={learningStats.currentWeekHours >= learningStats.weeklyGoal ? '#52c41a' : '#1890ff'}
          />
        </div>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultActiveKey="1">
        <TabPane 
          tab={
            <span>
              <BookOutlined />
              My Courses
              {enrolledCourses.length > 0 && (
                <Badge 
                  count={enrolledCourses.length} 
                  style={{ marginLeft: 8 }} 
                />
              )}
            </span>
          } 
          key="1"
        >
          {enrolledCourses.length > 0 ? (
            <Row gutter={[16, 16]}>
              {enrolledCourses.map(course => (
                <Col key={course.id} xs={24} sm={24} md={12} lg={8} xl={6}>
                  {renderCourseCard(course, true)}
                </Col>
              ))}
            </Row>
          ) : (
            <Empty 
              description={
                <span>You haven't enrolled in any courses yet</span>
              }
            >
              <Button type="primary" onClick={() => navigate('/lms/courses')}>
                Browse Courses
              </Button>
            </Empty>
          )}
        </TabPane>

        <TabPane 
          tab={
            <span>
              <PlayCircleOutlined />
              Continue Learning
            </span>
          } 
          key="2"
        >
          {enrolledCourses.filter(c => c.progress > 0 && c.progress < 100).length > 0 ? (
            <Row gutter={[16, 16]}>
              {enrolledCourses
                .filter(course => course.progress > 0 && course.progress < 100)
                .map(course => (
                  <Col key={course.id} xs={24} sm={24} md={12} lg={8} xl={6}>
                    {renderCourseCard(course, true)}
                  </Col>
                ))}
            </Row>
          ) : (
            <Empty 
              description={
                <span>You don't have any courses in progress</span>
              }
            >
              <Button type="primary" onClick={() => navigate('/lms/courses')}>
                Browse Courses
              </Button>
            </Empty>
          )}
        </TabPane>

        <TabPane 
          tab={
            <span>
              <CheckCircleOutlined />
              Completed
            </span>
          } 
          key="3"
        >
          {enrolledCourses.filter(c => c.progress === 100).length > 0 ? (
            <Row gutter={[16, 16]}>
              {enrolledCourses
                .filter(course => course.progress === 100)
                .map(course => (
                  <Col key={course.id} xs={24} sm={24} md={12} lg={8} xl={6}>
                    {renderCourseCard(course, true)}
                  </Col>
                ))}
            </Row>
          ) : (
            <Empty 
              description={
                <span>You haven't completed any courses yet</span>
              }
            />
          )}
        </TabPane>
      </Tabs>

      {/* Recommended Courses */}
      <div style={{ marginTop: 48 }}>
        <h2>Recommended For You</h2>
        <Row gutter={[16, 16]}>
          {recommendedCourses.map(course => (
            <Col key={course.id} xs={24} sm={12} md={8} lg={6}>
              {renderCourseCard(course, false)}
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default MyLearning;
