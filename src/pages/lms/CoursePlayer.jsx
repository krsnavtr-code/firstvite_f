import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLMS } from '../../contexts/LMSContext';
import { Layout, Menu, Button, Typography, Divider, Skeleton, message } from 'antd';
import { 
  PlayCircleOutlined, 
  CheckCircleOutlined, 
  BookOutlined, 
  ArrowLeftOutlined,
  DownloadOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import './lms.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { 
    currentCourse, 
    loading, 
    loadCourseContent, 
    updateLessonProgress,
    generateCertificate,
    isEnrolled
  } = useLMS();
  
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [generatingCert, setGeneratingCert] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  
  // Load course content when component mounts or courseId changes
  useEffect(() => {
    const loadContent = async () => {
      try {
        await loadCourseContent(courseId);
      } catch (error) {
        message.error(error.message || 'Failed to load course content');
        navigate('/lms');
      }
    };
    
    if (courseId) {
      loadContent();
    }
    
    return () => {
      // Cleanup if needed
    };
  }, [courseId]);
  
  // Set the first lesson as selected when course loads
  useEffect(() => {
    if (currentCourse?.lessons?.length > 0 && !selectedLesson) {
      const firstUncompleted = currentCourse.lessons.find(
        lesson => !currentCourse.enrollment.completedLessons?.includes(lesson._id)
      ) || currentCourse.lessons[0];
      
      setSelectedLesson(firstUncompleted);
      
      // Set active section
      if (firstUncompleted?.section) {
        setActiveSection(firstUncompleted.section);
      }
    }
  }, [currentCourse]);
  
  const handleLessonSelect = async (lesson) => {
    setSelectedLesson(lesson);
    
    // Mark lesson as completed if not already
    if (!currentCourse.enrollment.completedLessons?.includes(lesson._id)) {
      try {
        setLoadingLesson(true);
        await updateLessonProgress(courseId, lesson._id);
        message.success('Progress saved!');
      } catch (error) {
        console.error('Error updating progress:', error);
        message.error('Failed to update progress');
      } finally {
        setLoadingLesson(false);
      }
    }
  };
  
  const handleGenerateCertificate = async () => {
    try {
      setGeneratingCert(true);
      const certData = await generateCertificate(courseId);
      message.success('Certificate generated successfully!');
      // In a real app, you would open the certificate PDF or redirect to it
      console.log('Certificate data:', certData);
    } catch (error) {
      console.error('Error generating certificate:', error);
      message.error(error.message || 'Failed to generate certificate');
    } finally {
      setGeneratingCert(false);
    }
  };
  
  if (loading || !currentCourse) {
    return (
      <div className="course-player">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }
  
  const { course, enrollment } = currentCourse;
  const isCourseCompleted = enrollment?.completionStatus === 'completed';
  
  // Group lessons by section
  const sections = {};
  course.lessons.forEach(lesson => {
    const section = lesson.section || 'Uncategorized';
    if (!sections[section]) {
      sections[section] = [];
    }
    sections[section].push(lesson);
  });
  
  return (
    <Layout className="course-player">
      <Sider width={300} className="course-sidebar">
        <div className="course-sidebar-header">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/lms')}
          >
            Back to Dashboard
          </Button>
          <Title level={4} className="course-title" ellipsis={{ rows: 2 }}>
            {course.title}
          </Title>
          <div className="course-progress">
            <Text>Course Progress</Text>
            <Progress 
              percent={enrollment.progress || 0} 
              status={isCourseCompleted ? 'success' : 'active'}
            />
            <Text type="secondary">
              {enrollment.completedLessons?.length || 0} of {course.lessons?.length} lessons completed
            </Text>
          </div>
          
          {isCourseCompleted && !enrollment.certificateIssued && (
            <Button 
              type="primary" 
              icon={<TrophyOutlined />}
              loading={generatingCert}
              onClick={handleGenerateCertificate}
              block
              className="certificate-btn"
            >
              Get Certificate
            </Button>
          )}
          
          {enrollment.certificateIssued && (
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              block
              className="certificate-btn"
              onClick={() => {
                // In a real app, this would download the certificate
                message.info('Downloading certificate...');
              }}
            >
              Download Certificate
            </Button>
          )}
        </div>
        
        <div className="lessons-list">
          {Object.entries(sections).map(([section, lessons]) => (
            <div key={section} className="section">
              <div 
                className={`section-header ${activeSection === section ? 'active' : ''}`}
                onClick={() => setActiveSection(activeSection === section ? '' : section)}
              >
                <Text strong>{section}</Text>
                <Text type="secondary">{lessons.length} lessons</Text>
              </div>
              
              {(activeSection === section || !activeSection) && (
                <Menu
                  mode="inline"
                  selectedKeys={selectedLesson ? [selectedLesson._id] : []}
                  className="lessons-menu"
                >
                  {lessons.map(lesson => {
                    const isCompleted = enrollment.completedLessons?.includes(lesson._id);
                    const isSelected = selectedLesson?._id === lesson._id;
                    
                    return (
                      <Menu.Item 
                        key={lesson._id}
                        icon={
                          isCompleted ? (
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                          ) : (
                            <PlayCircleOutlined />
                          )
                        }
                        className={`lesson-item ${isSelected ? 'active' : ''}`}
                        onClick={() => handleLessonSelect(lesson)}
                      >
                        <div className="lesson-title">
                          {lesson.title}
                          {lesson.duration && (
                            <span className="lesson-duration">{lesson.duration}</span>
                          )}
                        </div>
                        {isCompleted && !isSelected && (
                          <div className="lesson-completed">Completed</div>
                        )}
                      </Menu.Item>
                    );
                  })}
                </Menu>
              )}
            </div>
          ))}
        </div>
      </Sider>
      
      <Layout className="content-layout">
        <Content className="lesson-content">
          {loadingLesson ? (
            <Skeleton active />
          ) : selectedLesson ? (
            <>
              <div className="lesson-header">
                <Title level={3}>{selectedLesson.title}</Title>
                <div className="lesson-meta">
                  <Text type="secondary">
                    {selectedLesson.section} • {selectedLesson.duration || 'No duration specified'}
                  </Text>
                </div>
              </div>
              
              <Divider />
              
              <div className="lesson-player">
                {selectedLesson.videoUrl ? (
                  <div className="video-container">
                    <video 
                      src={selectedLesson.videoUrl} 
                      controls 
                      className="video-player"
                    />
                  </div>
                ) : (
                  <div className="no-video">
                    <BookOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                    <Title level={4}>No video content</Title>
                    <Text type="secondary">This lesson doesn't have any video content.</Text>
                  </div>
                )}
                
                <div className="lesson-description">
                  <Title level={4}>About This Lesson</Title>
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: selectedLesson.content || 'No additional content available.' 
                    }} 
                  />
                </div>
                
                {selectedLesson.resources?.length > 0 && (
                  <div className="lesson-resources">
                    <Title level={4}>Resources</Title>
                    <div className="resources-list">
                      {selectedLesson.resources.map((resource, index) => (
                        <a 
                          key={index} 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="resource-item"
                        >
                          <div className="resource-icon">
                            {resource.type === 'file' ? '📄' : '🔗'}
                          </div>
                          <div className="resource-details">
                            <div className="resource-title">{resource.title || `Resource ${index + 1}`}</div>
                            <div className="resource-type">{resource.type}</div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="lesson-navigation">
                <Button 
                  type="default"
                  onClick={() => {
                    const currentIndex = course.lessons.findIndex(l => l._id === selectedLesson._id);
                    if (currentIndex > 0) {
                      const prevLesson = course.lessons[currentIndex - 1];
                      setSelectedLesson(prevLesson);
                      // Auto-scroll to the lesson in the sidebar
                      const lessonElement = document.getElementById(`lesson-${prevLesson._id}`);
                      if (lessonElement) {
                        lessonElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }
                    }
                  }}
                  disabled={course.lessons.findIndex(l => l._id === selectedLesson._id) === 0}
                >
                  Previous Lesson
                </Button>
                
                <Button 
                  type="primary"
                  onClick={async () => {
                    const currentIndex = course.lessons.findIndex(l => l._id === selectedLesson._id);
                    if (currentIndex < course.lessons.length - 1) {
                      const nextLesson = course.lessons[currentIndex + 1];
                      await handleLessonSelect(nextLesson);
                      setSelectedLesson(nextLesson);
                      // Auto-scroll to the lesson in the sidebar
                      const lessonElement = document.getElementById(`lesson-${nextLesson._id}`);
                      if (lessonElement) {
                        lessonElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }
                    }
                  }}
                >
                  {enrollment.completedLessons?.includes(selectedLesson._id) 
                    ? 'Next Lesson' 
                    : 'Mark as Complete & Next'}
                </Button>
              </div>
            </>
          ) : (
            <div className="no-lesson-selected">
              <BookOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <Title level={4}>Select a lesson to begin</Title>
              <Text type="secondary">Choose a lesson from the sidebar to get started with the course.</Text>
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default CoursePlayer;
