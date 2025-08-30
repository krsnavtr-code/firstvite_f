import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, List, Tag, Space, Typography, message, Spin, Empty, Select } from 'antd';
import { RocketOutlined, CheckCircleOutlined, ClockCircleOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from "../../contexts/AuthContext";
import { formatDistanceToNow } from 'date-fns';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const Career = () => {
  const [loading, setLoading] = useState(true);
  const [jobListings, setJobListings] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    jobType: null,
    location: '',
    course: null
  });
  const [courses, setCourses] = useState([]);
  const { user } = useAuth();

  // Fetch job listings and applied jobs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all open job listings
        const [jobsRes, appliedRes, coursesRes] = await Promise.all([
          axios.get('/api/careers?status=Open'),
          user ? axios.get(`/api/users/${user.id}/applications`) : Promise.resolve({ data: [] }),
          axios.get('/api/courses')
        ]);

        setJobListings(jobsRes.data);
        setFilteredJobs(jobsRes.data);
        setAppliedJobs(appliedRes.data || []);
        setCourses(coursesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Failed to load job listings');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Apply filters and search
  useEffect(() => {
    let result = [...jobListings];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(job => 
        job.title.toLowerCase().includes(term) || 
        job.description.toLowerCase().includes(term) ||
        job.requirements.some(req => req.toLowerCase().includes(term))
      );
    }

    // Apply filters
    if (filters.jobType) {
      result = result.filter(job => job.jobType === filters.jobType);
    }
    
    if (filters.location) {
      result = result.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    if (filters.course) {
      result = result.filter(job => job.courseId._id === filters.course);
    }

    setFilteredJobs(result);
  }, [searchTerm, filters, jobListings]);

  const handleApply = async (jobId) => {
    if (!user) {
      message.warning('Please login to apply for jobs');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/applications', { jobId, studentId: user.id });
      
      // Update UI optimistically
      const job = jobListings.find(j => j._id === jobId);
      if (job) {
        setAppliedJobs([...appliedJobs, { ...job, status: 'applied', appliedAt: new Date() }]);
        message.success(`Successfully applied for ${job.title}`);
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      message.error('Failed to apply for job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isApplied = (jobId) => {
    return appliedJobs.some(job => job._id === jobId || job.jobId === jobId);
  };

  const getApplicationStatus = (jobId) => {
    const application = appliedJobs.find(app => app._id === jobId || app.jobId === jobId);
    return application?.status || 'not_applied';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <Title level={3} className="flex items-center gap-2 mb-1">
              <RocketOutlined />
              <span>Career Opportunities</span>
            </Title>
            <Text className="text-gray-600">
              Find your dream job through FirstVite's career portal
            </Text>
          </div>
          
          <div className="w-full md:w-96">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchOutlined className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:text-white"
                placeholder="Search jobs by title, skills, or company"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Select
            placeholder="Job Type"
            className="w-full sm:w-48"
            allowClear
            onChange={(value) => setFilters({...filters, jobType: value})}
          >
            <Option value="Full-time">Full-time</Option>
            <Option value="Part-time">Part-time</Option>
            <Option value="Contract">Contract</Option>
            <Option value="Internship">Internship</Option>
            <Option value="Freelance">Freelance</Option>
          </Select>
          
          <Select
            placeholder="Course"
            className="w-full sm:w-56"
            allowClear
            onChange={(value) => setFilters({...filters, course: value})}
          >
            {courses.map(course => (
              <Option key={course._id} value={course._id}>
                {course.title}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <Tabs defaultActiveKey="1" className="dark:text-white">
          <TabPane tab={<span className="dark:text-white">Available Jobs</span>} key="1">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Spin size="large" />
              </div>
            ) : filteredJobs.length > 0 ? (
              <List
                itemLayout="vertical"
                dataSource={filteredJobs}
                renderItem={(job) => (
                  <List.Item
                    key={job._id}
                    className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors mb-4"
                    actions={[
                      <Space size="middle" className="dark:text-gray-300">
                        <Tag color="blue" className="dark:border-blue-400">{job.jobType}</Tag>
                        <Text className="dark:text-gray-300">{job.location}</Text>
                        {job.salary && (
                          <Text strong className="dark:text-white">{job.salary}</Text>
                        )}
                        {job.courseId && (
                          <Tag color="purple" className="dark:border-purple-400">
                            {job.courseId.title}
                          </Tag>
                        )}
                      </Space>,
                    ]}
                    extra={[
                      <Button
                        onClick={() => handleApply(job._id)}
                        disabled={isApplied(job._id)}
                        icon={isApplied(job._id) ? <CheckCircleOutlined /> : null}
                        className={`${
                          isApplied(job._id)
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                        loading={loading}
                      >
                        {isApplied(job._id) ? 'Applied' : 'Apply Now'}
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      className="p-2"
                      title={
                        <div className="flex flex-col">
                          <Title level={5} className="dark:text-white mb-1">
                            {job.title}
                          </Title>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {job.requirements.slice(0, 3).map((req, index) => (
                              <Tag
                                key={index}
                                className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                              >
                                {req}
                              </Tag>
                            ))}
                            {job.requirements.length > 3 && (
                              <Tag className="dark:border-gray-600 dark:bg-gray-700">
                                +{job.requirements.length - 3} more
                              </Tag>
                            )}
                          </div>
                        </div>
                      }
                      description={
                        <div className="mt-2">
                          <Text className="dark:text-gray-400 line-clamp-3">
                            {job.description}
                          </Text>
                        </div>
                      }
                    />
                    <div className="flex justify-between items-center mt-4 px-2">
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        Posted {formatDate(job.createdAt)}
                        {job.applicationDeadline && (
                          <span className="ml-2">• Apply by {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                        )}
                      </Text>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                description={
                  <span className="dark:text-gray-400">
                    No jobs found matching your criteria
                  </span>
                }
                className="py-12"
              />
            )}
          </TabPane>
          
          <TabPane 
            tab={
              <div className="flex items-center">
                <span className="dark:text-white">My Applications</span>
                {appliedJobs.length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-800">
                    {appliedJobs.length}
                  </span>
                )}
              </div>
            } 
            key="2"
          >
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Spin size="large" />
              </div>
            ) : appliedJobs.length > 0 ? (
              <List
                itemLayout="vertical"
                dataSource={appliedJobs}
                renderItem={(application) => {
                  const job = application.jobId || application; // Handle both direct job objects and populated references
                  const status = application.status || 'applied';
                  
                  return (
                    <List.Item
                      className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors mb-4"
                      actions={[
                        <div key="status" className="flex items-center gap-2">
                          <Tag 
                            color={
                              status === 'hired' ? 'success' : 
                              status === 'rejected' ? 'error' : 
                              'processing'
                            }
                            className="dark:border-opacity-50"
                          >
                            {status === 'hired' ? 'Hired' : 
                             status === 'rejected' ? 'Not Selected' : 
                             status === 'interview' ? 'Interview Scheduled' :
                             'Application Submitted'}
                          </Tag>
                          {application.appliedAt && (
                            <Text className="text-sm text-gray-500 dark:text-gray-400">
                              Applied {formatDate(application.appliedAt)}
                            </Text>
                          )}
                        </div>
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <div className="flex flex-col">
                            <Title level={5} className="dark:text-white mb-1">
                              {job.title}
                            </Title>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                              {job.company && <span>{job.company}</span>}
                              {job.location && <span>• {job.location}</span>}
                              {job.jobType && (
                                <Tag color="blue" className="dark:border-blue-400">
                                  {job.jobType}
                                </Tag>
                              )}
                            </div>
                          </div>
                        }
                        description={
                          <div className="mt-2">
                            {application.coverLetter && (
                              <div className="mb-2">
                                <Text strong className="dark:text-gray-300">Your Note:</Text>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                  {application.coverLetter}
                                </p>
                              </div>
                            )}
                            {application.notes && status !== 'applied' && (
                              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 rounded-md">
                                <Text strong className="dark:text-blue-300">
                                  {status === 'hired' ? 'Congratulations!' : 
                                   status === 'rejected' ? 'Update:' : 
                                   'Latest Update:'}
                                </Text>
                                <p className="text-gray-700 dark:text-gray-300 mt-1">
                                  {application.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty
                description={
                  <div className="flex flex-col items-center">
                    <Text className="dark:text-gray-400 mb-4">
                      You haven't applied to any jobs yet
                    </Text>
                    <Button 
                      type="primary" 
                      onClick={() => document.querySelector('.ant-tabs-tab:first-child').click()}
                    >
                      Browse Jobs
                    </Button>
                  </div>
                }
                className="py-12"
              />
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Career;
