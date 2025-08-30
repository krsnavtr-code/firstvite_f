import React, { useState, useEffect } from 'react';
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
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div style={{ marginBottom: 24 }} className='text-black'>
        <Typography.Title level={3} style={{ marginBottom: 0, color: 'inherit' }}>
          <Space>
            <RocketOutlined />
            Career Opportunities
          </Space>
        </Typography.Title>
        <Typography.Text>
          Find your dream job through FirstVite's referral network
        </Typography.Text>
      </div>

      <Card className="main-card bg-gray-200 dark:bg-[#001525] shadow-sm">
        <Tabs defaultActiveKey="1" className="dark:text-white">
          <TabPane tab={<span className="dark:text-white">Available Jobs</span>} key="1">
            <List
              itemLayout="vertical"
              dataSource={jobListings}
              renderItem={(job) => (
                <List.Item
                  key={job.id}
                  className="bg-gray-100 dark:bg-[#001525] hover:bg-gray-50 dark:hover:bg-[#001a33] rounded-lg transition-colors"
                  actions={[
                    <Space size="middle" className="dark:text-gray-300">
                      <Tag color="blue" className="dark:border-blue-400">{job.type}</Tag>
                      <Text className="dark:text-gray-300">{job.location}</Text>
                      <Text className="dark:text-gray-400">Experience: {job.experience}</Text>
                      <Text strong className="dark:text-white">₹{job.salary}</Text>
                    </Space>,
                  ]}
                  extra={[
                    <Button
                      onClick={() => handleApply(job.id)}
                      disabled={isApplied(job.id)}
                      icon={isApplied(job.id) ? <CheckCircleOutlined /> : null}
                      className={`${isApplied(job.id) 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                    >
                      {isApplied(job.id) ? "Applied" : "Apply Now"}
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    className="p-2"
                    title={
                      <Space direction="vertical" size={4}>
                        <Title level={5} style={{ margin: 0 }} className="dark:text-white">
                          {job.title}
                        </Title>
                        <Text className="dark:text-gray-400">{job.company}</Text>
                      </Space>
                    }
                    description={
                      <Space size={[4, 8]} wrap>
                        {job.skills.map((skill, index) => (
                          <Tag 
                            key={index}
                            className="dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                          >
                            {skill}
                          </Tag>
                        ))}
                      </Space>
                    }
                  />
                  <Text className="dark:text-gray-400 text-xs p-2">
                    Posted {job.posted}
                  </Text>
                </List.Item>
              )}
            />
          </TabPane>
          <TabPane tab={<span className="dark:text-white active:text-blue-600">My Applications</span>} key="2">
            {appliedJobs.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={appliedJobs}
                renderItem={(job) => (
                  <List.Item
                    className="bg-white dark:bg-[#001525] hover:bg-gray-50 dark:hover:bg-[#001a33] p-4 rounded-lg mb-2 transition-colors"
                    actions={[
                      <Tag 
                        color="processing" 
                        icon={<ClockCircleOutlined />}
                        className="dark:border-blue-400"
                      >
                        In Review
                      </Tag>,
                    ]}
                  >
                    <List.Item.Meta
                      className="p-2"
                      title={<span className="dark:text-white">{job.title}</span>}
                      description={
                        <span className="dark:text-gray-400">
                          {job.company} • {job.location}
                        </span>
                      }
                    />
                    <div className="text-right">
                      <div className="dark:text-gray-300">
                        Applied on {new Date().toLocaleDateString()}
                      </div>
                      <Text className="dark:text-gray-400">Status: Under Review</Text>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center py-10">
                <Text className="dark:text-gray-400">
                  You haven't applied to any jobs yet.
                </Text>
              </div>
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Career;
