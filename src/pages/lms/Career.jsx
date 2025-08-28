import React, { useState } from 'react';
import { Card, Tabs, Button, List, Tag, Space, Typography, message } from 'antd';
import { RocketOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Career = () => {
  const [loading, setLoading] = useState(false);
  
  // Sample job listings data - replace with actual API call
  const [jobListings, setJobListings] = useState([
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'TechCorp',
      location: 'Bangalore, India',
      type: 'Full-time',
      experience: '2-4 years',
      salary: '₹8L - ₹15L',
      skills: ['React', 'JavaScript', 'HTML/CSS'],
      posted: '2 days ago',
      status: 'active',
    },
    {
      id: 2,
      title: 'Backend Engineer',
      company: 'DataSystems',
      location: 'Remote',
      type: 'Full-time',
      experience: '3-5 years',
      salary: '₹10L - ₹18L',
      skills: ['Node.js', 'Python', 'MongoDB'],
      posted: '1 week ago',
      status: 'active',
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      company: 'DesignHub',
      location: 'Mumbai, India',
      type: 'Contract',
      experience: '1-3 years',
      salary: '₹6L - ₹12L',
      skills: ['Figma', 'UI/UX', 'Prototyping'],
      posted: '3 days ago',
      status: 'active',
    },
  ]);

  const [appliedJobs, setAppliedJobs] = useState([]);

  const handleApply = (jobId) => {
    const job = jobListings.find(job => job.id === jobId);
    if (job) {
      setAppliedJobs([...appliedJobs, job]);
      message.success(`Successfully applied for ${job.title} at ${job.company}`);
    }
  };

  const isApplied = (jobId) => {
    return appliedJobs.some(job => job.id === jobId);
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: 24 }}>
        <Typography.Title level={3} style={{ marginBottom: 0 }}>
          <Space>
            <RocketOutlined />
            Career Opportunities
          </Space>
        </Typography.Title>
        <Typography.Text type="secondary">
          Find your dream job through FirstVite's referral network
        </Typography.Text>
      </div>

      <Card className="main-card">
        <Tabs defaultActiveKey="1">
          <TabPane tab="Available Jobs" key="1">
            <List
              itemLayout="vertical"
              dataSource={jobListings}
              renderItem={(job) => (
                <List.Item
                  key={job.id}
                  actions={[
                    <Space size="middle">
                      <Tag color="blue">{job.type}</Tag>
                      <Text type="secondary">{job.location}</Text>
                      <Text type="secondary">Experience: {job.experience}</Text>
                      <Text strong>₹{job.salary}</Text>
                    </Space>,
                  ]}
                  extra={[
                    <Button 
                      type="primary" 
                      onClick={() => handleApply(job.id)}
                      disabled={isApplied(job.id)}
                      icon={isApplied(job.id) ? <CheckCircleOutlined /> : null}
                    >
                      {isApplied(job.id) ? 'Applied' : 'Apply Now'}
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space direction="vertical" size={4}>
                        <Title level={5} style={{ margin: 0 }}>{job.title}</Title>
                        <Text type="secondary">{job.company}</Text>
                      </Space>
                    }
                    description={
                      <Space size={[4, 8]} wrap>
                        {job.skills.map((skill, index) => (
                          <Tag key={index}>{skill}</Tag>
                        ))}
                      </Space>
                    }
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Posted {job.posted}
                  </Text>
                </List.Item>
              )}
            />
          </TabPane>
          <TabPane tab="My Applications" key="2">
            {appliedJobs.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={appliedJobs}
                renderItem={(job) => (
                  <List.Item
                    actions={[
                      <Tag color="processing" icon={<ClockCircleOutlined />}>
                        In Review
                      </Tag>
                    ]}
                  >
                    <List.Item.Meta
                      title={job.title}
                      description={`${job.company} • ${job.location}`}
                    />
                    <div style={{ textAlign: 'right' }}>
                      <div>Applied on {new Date().toLocaleDateString()}</div>
                      <Text type="secondary">Status: Under Review</Text>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Text type="secondary">You haven't applied to any jobs yet.</Text>
              </div>
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Career;
