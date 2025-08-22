import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, List, Typography, Skeleton, Empty, message, Tag, Collapse, Modal, Progress } from 'antd';
import { 
  ArrowLeftOutlined, 
  PlayCircleOutlined, 
  CheckCircleOutlined, 
  DownOutlined, 
  RightOutlined,
  FileTextOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { getSessionsBySprint } from '../../api/sessionApi';
import { getTasksBySession } from '../../api/taskApi';
import { getTask } from '../../api/taskApi';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const SprintDetails = () => {
  const { courseId, sprintId } = useParams();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState({});
  const [sessionTasks, setSessionTasks] = useState({});
  const [loadingTasks, setLoadingTasks] = useState({});
  const [resultsModalVisible, setResultsModalVisible] = useState(false);
  const [currentResults, setCurrentResults] = useState(null);
  const { currentUser, isAuthenticated } = useAuth();
  
  // Debug: Log auth state
  useEffect(() => {
    console.log('Auth State - isAuthenticated:', isAuthenticated);
    console.log('Auth State - Current User:', currentUser);
  }, [isAuthenticated, currentUser]);
  
  // Get user ID safely
  const getUserId = () => {
    const userId = currentUser?._id || localStorage.getItem('userId');
    console.log('Current User ID:', userId);
    return userId;
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await getSessionsBySprint(sprintId);
        if (response?.data?.sessions) {
          setSessions(response.data.sessions);
        }
      } catch (error) {
        message.error('Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [sprintId]);

  const toggleSession = async (sessionId) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));

    // Only fetch tasks if we haven't already
    if (!sessionTasks[sessionId] && !loadingTasks[sessionId]) {
      try {
        setLoadingTasks(prev => ({ ...prev, [sessionId]: true }));
        const response = await getTasksBySession(sessionId);
        if (response?.data?.tasks) {
          setSessionTasks(prev => ({
            ...prev,
            [sessionId]: response.data.tasks
          }));
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        message.error('Failed to load tasks');
      } finally {
        setLoadingTasks(prev => ({ ...prev, [sessionId]: false }));
      }
    }
  };

  if (loading) return <Skeleton active />;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(`/lms/courses/${courseId}`)}
        className="mb-4"
      >
        Back to Course
      </Button>

      <Title level={3} className="mb-6">Sprint Sessions</Title>
      
      {sessions.length === 0 ? (
        <Empty description="No sessions available" />
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div 
              key={session._id} 
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div 
                className="p-4 cursor-pointer flex justify-between items-center bg-white hover:bg-gray-50"
                onClick={() => toggleSession(session._id)}
              >
                <div className="flex items-center">
                  <PlayCircleOutlined className="text-blue-500 text-xl mr-3" />
                  <div>
                    <div className="font-medium">{session.name}</div>
                    <div className="text-gray-500 text-sm">
                      {session.description || 'No description'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  {session.completed && (
                    <CheckCircleOutlined className="text-green-500 mr-3" />
                  )}
                  {expandedSessions[session._id] ? (
                    <DownOutlined className="text-gray-400" />
                  ) : (
                    <RightOutlined className="text-gray-400" />
                  )}
                </div>
              </div>

              {expandedSessions[session._id] && (
                <div className="border-t border-gray-100 bg-gray-50 p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700">
                      <FileTextOutlined className="mr-2" />
                      Tasks
                    </h4>
                    <Button 
                      type="link" 
                      size="small"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const userId = getUserId();
                          if (!userId) {
                            console.error('User not authenticated. Auth state:', { 
                              isAuthenticated, 
                              hasUser: !!currentUser, 
                              userId: currentUser?._id,
                              localStorageUser: localStorage.getItem('user')
                            });
                            message.error('Please log in to view test results.');
                            return;
                          }
                          
                          console.log('Fetching results for user:', userId);
                          const tasks = sessionTasks[session._id] || [];
                          console.log('Tasks in session:', tasks.length);
                          
                          const results = [];
                          
                          // Get submissions for each task
                          for (const task of tasks) {
                            try {
                              console.log('Fetching task:', task._id);
                              const response = await getTask(task._id);
                              console.log('Task API response:', response);
                              
                              // Handle different response structures
                              const taskData = response?.data?.task || response?.task;
                              console.log('Task data:', taskData);
                              
                              const submissions = taskData?.submissions || [];
                              console.log('Submissions found:', submissions.length);
                              
                              if (submissions.length > 0) {
                                console.log('All submissions:', submissions);
                                const userSubmission = submissions.find(
                                  sub => sub.user?._id === userId || sub.user === userId
                                );
                                
                                console.log('User submission for task:', {
                                  taskId: task._id,
                                  taskTitle: task.title,
                                  userId,
                                  foundSubmission: !!userSubmission,
                                  submission: userSubmission
                                });
                                
                                if (userSubmission) {
                                  results.push({
                                    taskId: task._id,
                                    title: task.title,
                                    score: userSubmission.score,
                                    submittedAt: new Date(userSubmission.submittedAt).toLocaleDateString(),
                                    passed: userSubmission.score >= 80
                                  });
                                }
                              }
                            } catch (taskError) {
                              console.error(`Error processing task ${task._id}:`, taskError);
                            }
                          }
                          
                          console.log('Final results:', results);
                          
                          if (results.length === 0) {
                            // Log more details about why no results were found
                            console.warn('No submissions found. Checking task data...');
                            const tasks = sessionTasks[session._id] || [];
                            tasks.forEach(task => {
                              console.log(`Task ${task._id} (${task.title}):`, 
                                'Has submissions:', !!task.submissions?.length,
                                'Submissions:', task.submissions
                              );
                            });
                          }
                          
                          setCurrentResults({
                            sessionTitle: session.title,
                            results
                          });
                          setResultsModalVisible(true);
                        } catch (error) {
                          console.error('Error fetching results:', error);
                          message.error('Failed to load test results');
                        }
                      }}
                    >
                      View Results
                    </Button>
                  </div>
                  
                  {loadingTasks[session._id] ? (
                    <div className="p-4 text-center">
                      <Skeleton active paragraph={{ rows: 1 }} />
                    </div>
                  ) : sessionTasks[session._id]?.length > 0 ? (
                    <div className="space-y-2">
                      {sessionTasks[session._id]?.map((task) => (
                        <div 
                          key={task._id} 
                          className="p-3 bg-white rounded border border-gray-100 hover:border-blue-100 transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/lms/courses/${courseId}/sprints/${sprintId}/sessions/${session._id}/tasks/${task._id}`);
                          }}
                        >
                          <div className="font-medium">{task.title}</div>
                          {task.description && (
                            <div className="text-gray-600 text-sm mt-1">
                              {task.description}
                            </div>
                          )}
                          <div className="mt-2 flex items-center space-x-2">
                            {task.questions?.length > 0 && (
                              <Tag color="blue">
                                {task.questions.length} question{task.questions.length !== 1 ? 's' : ''}
                              </Tag>
                            )}
                            <span className="text-xs text-gray-500">Click to start</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty 
                      description="No tasks available" 
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      className="py-4"
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Results Modal */}
      <Modal
        title={`Test Results - ${currentResults?.sessionTitle || ''}`}
        open={resultsModalVisible}
        onCancel={() => setResultsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setResultsModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {currentResults?.results?.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={currentResults.results}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <span key="score" className={item.passed ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {item.score}%
                  </span>
                ]}
              >
                <List.Item.Meta
                  title={
                    <div className="flex items-center">
                      {item.passed ? (
                        <CheckCircleOutlined className="text-green-500 mr-2" />
                      ) : (
                        <CloseCircleOutlined className="text-red-500 mr-2" />
                      )}
                      <span>{item.title}</span>
                    </div>
                  }
                  description={`Submitted on ${item.submittedAt}`}
                />
                <div className="w-32">
                  <Progress
                    percent={item.score}
                    status={item.passed ? 'success' : 'exception'}
                    showInfo={false}
                    strokeWidth={8}
                  />
                </div>
              </List.Item>
            )}
          />
        ) : (
          <div className="text-center py-4 text-gray-500">
            No test results found for this session.
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SprintDetails;
