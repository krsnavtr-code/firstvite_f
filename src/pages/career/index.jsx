import React, { useState, useEffect, useCallback } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Input, 
  Select, 
  Button, 
  Space, 
  Typography, 
  Spin, 
  Empty, 
  Tabs, 
  Tag, 
  Alert,
  message
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined,
  BookOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  CloseOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import JobCard from '../../components/career/JobCard';
import JobApplicationModal from '../../components/career/JobApplicationModal';
import './career.less';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Career = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State for job listings and filters
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyingJob, setApplyingJob] = useState(null);
  const [myApplications, setMyApplications] = useState([]);
  const [courses, setCourses] = useState([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    jobType: [],
    location: [],
    courseId: [],
    status: 'all',
  });
  
  // Fetch jobs and user applications
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [jobsRes, coursesRes] = await Promise.all([
        axios.get('/api/careers?status=Open'),
        axios.get('/api/courses?status=published&fields=name,slug')
      ]);
      
      setJobs(jobsRes.data);
      setFilteredJobs(jobsRes.data);
      setCourses(coursesRes.data || []);
      
      // Fetch user applications if logged in
      if (user) {
        try {
          const appsRes = await axios.get('/api/applications/me');
          setMyApplications(appsRes.data || []);
        } catch (err) {
          console.error('Error fetching applications:', err);
        }
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load job listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Apply filters
  useEffect(() => {
    if (!jobs.length) return;
    
    let result = [...jobs];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(job => 
        job.title.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term) ||
        (job.requirements?.some(req => req.toLowerCase().includes(term)))
      );
    }
    
    // Apply job type filter
    if (filters.jobType.length > 0) {
      result = result.filter(job => 
        filters.jobType.includes(job.jobType)
      );
    }
    
    // Apply location filter
    if (filters.location.length > 0) {
      result = result.filter(job => 
        filters.location.some(loc => 
          job.location?.toLowerCase().includes(loc.toLowerCase())
        )
      );
    }
    
    // Apply course filter
    if (filters.courseId.length > 0) {
      result = result.filter(job => 
        job.courseId && filters.courseId.includes(
          typeof job.courseId === 'string' ? job.courseId : job.courseId._id
        )
      );
    }
    
    setFilteredJobs(result);
  }, [jobs, searchTerm, filters]);
  
  // Extract unique filter options
  const jobTypes = [...new Set(jobs.map(job => job.jobType).filter(Boolean))];
  const locations = [...new Set(jobs.map(job => job.location).filter(Boolean))];
  
  const handleApply = (job) => {
    if (!user) {
      // Redirect to login with return URL
      navigate('/login', { state: { from: '/career' } });
      return;
    }
    setApplyingJob(job);
  };
  
  const handleApplicationSuccess = () => {
    message.success('Application submitted successfully!');
    // Refresh applications
    if (user) {
      axios.get('/api/applications/me')
        .then(res => setMyApplications(res.data || []))
        .catch(console.error);
    }
  };
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      jobType: [],
      location: [],
      courseId: [],
      status: 'all',
    });
  };
  
  const isFilterActive = searchTerm || 
    filters.jobType.length > 0 || 
    filters.location.length > 0 || 
    filters.courseId.length > 0;
  
  // Get job application status for a specific job
  const getApplicationStatus = (jobId) => {
    const application = myApplications.find(app => app.jobId._id === jobId);
    return application ? application.status : null;
  };
  
  // Group jobs by status for the "My Applications" tab
  const groupedApplications = {
    applied: myApplications.filter(app => app.status === 'applied'),
    reviewed: myApplications.filter(app => app.status === 'reviewed'),
    interview: myApplications.filter(app => app.status === 'interview'),
    hired: myApplications.filter(app => app.status === 'hired'),
    rejected: myApplications.filter(app => app.status === 'rejected')
  };

  return (
    <div className="career-page">
      {/* Hero Section */}
      <div className="career-hero">
        <div className="container">
          <Title level={2} className="hero-title">Find Your Dream Job</Title>
          <Text className="hero-subtitle">
            Browse through our latest job openings and take the next step in your career
          </Text>
          
          <div className="search-container">
            <Search
              placeholder="Search by job title, skills, or keywords"
              enterButton={
                <Button type="primary">
                  <SearchOutlined /> Search Jobs
                </Button>
              }
              size="large"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={(value) => setSearchTerm(value)}
              className="job-search"
            />
          </div>
        </div>
      </div>
      
      <div className="container" style={{ marginTop: 40 }}>
        <Tabs 
          defaultActiveKey="all" 
          type="card"
          size="large"
          className="job-tabs"
          items={[
            {
              key: 'all',
              label: (
                <span>
                  <FileTextOutlined /> All Jobs
                  {jobs.length > 0 && (
                    <Tag className="tab-badge" color="blue">
                      {jobs.length}
                    </Tag>
                  )}
                </span>
              ),
              children: (
                <>
                  <div className="filters-container">
                    <Space size="middle" wrap>
                      <Select
                        mode="multiple"
                        style={{ width: 200 }}
                        placeholder="Job Type"
                        value={filters.jobType}
                        onChange={(value) => handleFilterChange('jobType', value)}
                        suffixIcon={<FilterOutlined />}
                        allowClear
                        maxTagCount="responsive"
                      >
                        {jobTypes.map(type => (
                          <Option key={type} value={type}>
                            {type}
                          </Option>
                        ))}
                      </Select>
                      
                      <Select
                        mode="multiple"
                        style={{ width: 200 }}
                        placeholder="Location"
                        value={filters.location}
                        onChange={(value) => handleFilterChange('location', value)}
                        suffixIcon={<EnvironmentOutlined />}
                        allowClear
                        maxTagCount="responsive"
                      >
                        {locations.map(location => (
                          <Option key={location} value={location}>
                            {location}
                          </Option>
                        ))}
                      </Select>
                      
                      <Select
                        mode="multiple"
                        style={{ width: 200 }}
                        placeholder="Course"
                        value={filters.courseId}
                        onChange={(value) => handleFilterChange('courseId', value)}
                        suffixIcon={<BookOutlined />}
                        allowClear
                        maxTagCount="responsive"
                      >
                        {courses.map(course => (
                          <Option key={course._id} value={course._id}>
                            {course.name}
                          </Option>
                        ))}
                      </Select>
                      
                      {isFilterActive && (
                        <Button 
                          type="text" 
                          icon={<CloseOutlined />} 
                          onClick={clearFilters}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </Space>
                    
                    <div className="filter-results">
                      <Text type="secondary">
                        Showing {filteredJobs.length} of {jobs.length} jobs
                      </Text>
                    </div>
                  </div>
                  
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <Spin size="large" />
                      <div style={{ marginTop: 16 }}>Loading jobs...</div>
                    </div>
                  ) : error ? (
                    <Alert 
                      message="Error" 
                      description={error} 
                      type="error" 
                      showIcon 
                      style={{ marginTop: 20 }}
                    />
                  ) : filteredJobs.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <span>No jobs found matching your criteria</span>
                      }
                      style={{ margin: '40px 0' }}
                    >
                      <Button type="primary" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    </Empty>
                  ) : (
                    <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                      {filteredJobs.map(job => {
                        const applicationStatus = getApplicationStatus(job._id);
                        const isApplied = !!applicationStatus;
                        
                        return (
                          <Col xs={24} key={job._id}>
                            <JobCard
                              job={job}
                              onApply={handleApply}
                              isApplied={isApplied}
                              applicationStatus={applicationStatus}
                            />
                          </Col>
                        );
                      })}
                    </Row>
                  )}
                </>
              )
            },
            ...(user ? [{
              key: 'my-applications',
              label: (
                <span>
                  <CheckCircleOutlined /> My Applications
                  {myApplications.length > 0 && (
                    <Tag className="tab-badge" color="blue">
                      {myApplications.length}
                    </Tag>
                  )}
                </span>
              ),
              children: (
                <div style={{ marginTop: 24 }}>
                  {myApplications.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <span>You haven't applied to any jobs yet</span>
                      }
                      style={{ margin: '40px 0' }}
                    >
                      <Button type="primary" onClick={() => setActiveTab('all')}>
                        Browse Jobs
                      </Button>
                    </Empty>
                  ) : (
                    <Tabs defaultActiveKey="all" type="card">
                      <Tabs.TabPane tab={`All (${myApplications.length})`} key="all">
                        <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
                          {myApplications.map(application => (
                            <Col xs={24} key={application._id}>
                              <JobCard 
                                job={application.jobId}
                                onApply={() => {}}
                                isApplied={true}
                                applicationStatus={application.status}
                                showActions={false}
                              />
                            </Col>
                          ))}
                        </Row>
                      </Tabs.TabPane>
                      
                      {Object.entries(groupedApplications).map(([status, apps]) => (
                        apps.length > 0 && (
                          <Tabs.TabPane 
                            key={status}
                            tab={`${status.charAt(0).toUpperCase() + status.slice(1)} (${apps.length})`}
                          >
                            <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
                              {apps.map(application => (
                                <Col xs={24} key={application._id}>
                                  <JobCard 
                                    job={application.jobId}
                                    onApply={() => {}}
                                    isApplied={true}
                                    applicationStatus={application.status}
                                    showActions={false}
                                  />
                                </Col>
                              ))}
                            </Row>
                          </Tabs.TabPane>
                        )
                      ))}
                    </Tabs>
                  )}
                </div>
              )
            }] : [])
          ]}
        />
      </div>
      
      {/* Application Modal */}
      {applyingJob && (
        <JobApplicationModal
          visible={!!applyingJob}
          onCancel={() => setApplyingJob(null)}
          onSuccess={handleApplicationSuccess}
          job={applyingJob}
        />
      )}
    </div>
  );
};

export default Career;
