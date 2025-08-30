import React from 'react';
import { Card, Tag, Button, Space, Typography, Divider, Tooltip } from 'antd';
import { 
  EnvironmentOutlined, 
  ClockCircleOutlined, 
  DollarOutlined, 
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined as ClockOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const { Text, Title } = Typography;

const statusTag = {
  applied: { color: 'blue', icon: <ClockOutlined />, text: 'Applied' },
  reviewed: { color: 'purple', icon: <ClockOutlined />, text: 'Under Review' },
  interview: { color: 'orange', icon: <ClockOutlined />, text: 'Interview' },
  hired: { color: 'green', icon: <CheckCircleOutlined />, text: 'Hired' },
  rejected: { color: 'red', icon: <CloseCircleOutlined />, text: 'Not Selected' }
};

const JobCard = ({ 
  job, 
  onApply, 
  isApplied = false, 
  applicationStatus = null,
  showActions = true 
}) => {
  const { 
    _id, 
    title, 
    company,
    location, 
    jobType, 
    salary, 
    description, 
    requirements = [],
    responsibilities = [],
    applicationDeadline,
    createdAt,
    courseId
  } = job;

  const deadline = new Date(applicationDeadline);
  const isDeadlinePassed = new Date() > deadline;
  const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <Card 
      className="job-card"
      style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
    >
      <div className="job-header" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            {title}
          </Title>
          {company && (
            <Text type="secondary" style={{ fontSize: 16 }}>
              {company}
            </Text>
          )}
        </div>
        
        <Space size={[8, 16]} wrap style={{ marginTop: 8 }}>
          <Tooltip title="Location">
            <Tag icon={<EnvironmentOutlined />}>
              {location || 'Remote'}
            </Tag>
          </Tooltip>
          <Tooltip title="Job Type">
            <Tag icon={<ClockCircleOutlined />} color={jobType === 'Full-time' ? 'blue' : 'green'}>
              {jobType}
            </Tag>
          </Tooltip>
          {salary && (
            <Tooltip title="Salary">
              <Tag icon={<DollarOutlined />} color="gold">
                {salary}
              </Tag>
            </Tooltip>
          )}
          {courseId && (
            <Tooltip title="Related Course">
              <Tag icon={<BookOutlined />}>
                {typeof courseId === 'object' ? courseId.name : 'Course'}
              </Tag>
            </Tooltip>
          )}
        </Space>
      </div>

      <div className="job-description" style={{ marginBottom: 16 }}>
        <Text>
          {description.length > 200 
            ? `${description.substring(0, 200)}...` 
            : description}
        </Text>
      </div>

      {requirements.length > 0 && (
        <div className="job-requirements" style={{ marginBottom: 16 }}>
          <Text strong>Requirements:</Text>
          <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
            {requirements.slice(0, 3).map((req, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                <Text>{req}</Text>
              </li>
            ))}
            {requirements.length > 3 && (
              <li>
                <Text type="secondary">+{requirements.length - 3} more</Text>
              </li>
            )}
          </ul>
        </div>
      )}

      <Divider style={{ margin: '12px 0' }} />

      <div className="job-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Posted {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </Text>
          {!isDeadlinePassed ? (
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Apply within {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
              </Text>
            </div>
          ) : (
            <div style={{ marginTop: 4 }}>
              <Text type="danger" style={{ fontSize: 12 }}>
                Application closed
              </Text>
            </div>
          )}
        </div>

        {showActions && (
          <Space>
            {isApplied ? (
              <Tag 
                color={statusTag[applicationStatus]?.color || 'default'}
                icon={statusTag[applicationStatus]?.icon}
                style={{ margin: 0 }}
              >
                {statusTag[applicationStatus]?.text || 'Applied'}
              </Tag>
            ) : !isDeadlinePassed ? (
              <Button 
                type="primary" 
                onClick={() => onApply(job)}
                disabled={isApplied}
              >
                {isApplied ? 'Applied' : 'Apply Now'}
              </Button>
            ) : (
              <Button disabled>Applications Closed</Button>
            )}
            <Button type="link">
              <Link to={`/career/${_id}`}>View Details</Link>
            </Button>
          </Space>
        )}
      </div>
    </Card>
  );
};

export default JobCard;
