import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, List, Typography, Skeleton, Empty, message } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getSessionsBySprint } from '../../api/sessionApi';

const { Title, Text } = Typography;

const SprintDetails = () => {
  const { courseId, sprintId } = useParams();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <List
          dataSource={sessions}
          renderItem={(session) => (
            <List.Item 
              className="cursor-pointer hover:bg-gray-50 p-4 rounded"
              onClick={() => navigate(`/lms/courses/${courseId}/sprints/${sprintId}/sessions/${session._id}`)}
            >
              <List.Item.Meta
                avatar={<PlayCircleOutlined className="text-blue-500 text-xl" />}
                title={session.name}
                description={session.description || 'No description'}
              />
              {session.completed ? (
                <CheckCircleOutlined className="text-green-500" />
              ) : null}
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default SprintDetails;
