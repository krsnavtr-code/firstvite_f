import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Tag, 
  Button, 
  Space, 
  Divider, 
  List, 
  Skeleton, 
  Alert, 
  Tabs, 
  Descriptions, 
  Row, 
  Col,
  Breadcrumb
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined, 
  DollarOutlined, 
  BookOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  HomeOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { format, parseISO, isAfter } from 'date-fns';
import JobApplicationModal from './JobApplicationModal';
import { useAuth } from "../../contexts/AuthContext";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [application, setApplication] = useState(null);
  const [isApplicationModalVisible, setIsApplicationModalVisible] = useState(false);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const [jobRes, appRes] = await Promise.all([
          axios.get(`/api/careers/${id}`),
          user ? axios.get(`/api/applications/check?jobId=${id}`) : Promise.resolve({ data: null })
        ]);
        
        setJob(jobRes.data);
        setApplication(appRes.data);
        
        // Fetch related jobs if courseId exists
        if (jobRes.data.courseId) {
          try {
            const relatedRes = await axios.get(`/api/careers?courseId=${jobRes.data.courseId}&limit=3`);
            setRelatedJobs(relatedRes.data.filter(j => j._id !== id));
          } catch (err) {
            console.error('Error fetching related jobs:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJobDetails();
    }
  }, [id, user]);

  const handleApply = () => {
    if (!user) {
      // Redirect to login with return URL
      navigate('/login', { state: { from: `/career/${id}` } });
      return;
    }
    setIsApplicationModalVisible(true);
  };

  const handleApplicationSuccess = () => {
    // Refresh application status
    if (user && id) {
      axios.get(`/api/applications/check?jobId=${id}`)
        .then(res => setApplication(res.data))
        .catch(console.error);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Not Found"
          description="The job you're looking for doesn't exist or has been removed."
          type="warning"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate('/career')}>
              Browse Jobs
            </Button>
          }
        />
      </div>
    );
  }

  const {
    title,
    company,
    location,
    jobType,
    salary,
    description,
    requirements = [],
    responsibilities = [],
    benefits = [],
    applicationDeadline,
    createdAt,
    courseId,
    skills = []
  } = job;

  const deadline = parseISO(applicationDeadline);
  const isDeadlinePassed = isAfter(new Date(), deadline);
  const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
  const isApplied = !!application;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <Breadcrumb 
        style={{ marginBottom: 24 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> Home</Link> },
          { title: <Link to="/career">Career</Link> },
          { title: job.title }
        ]}
      />

      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Back to Jobs
      </Button>

      <Card 
        title={
          <Title level={3} style={{ margin: 0 }}>
            {title}
            {company && (
              <Text type="secondary" style={{ display: 'block', fontSize: 18, fontWeight: 'normal' }}>
                {company}
              </Text>
            )}
          </Title>
        }
        extra={
          <Space>
            <Button 
              type="primary" 
              onClick={handleApply}
              disabled={isApplied || isDeadlinePassed}
            >
              {isApplied ? 'Applied' : 'Apply Now'}
            </Button>
            <Button>Save Job</Button>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Space size={[8, 16]} wrap style={{ marginBottom: 16 }}>
          <Tag icon={<EnvironmentOutlined />}>
            {location || 'Remote'}
          </Tag>
          <Tag icon={<ClockCircleOutlined />} color={jobType === 'Full-time' ? 'blue' : 'green'}>
            {jobType}
          </Tag>
          {salary && (
            <Tag icon={<DollarOutlined />} color="gold">
              {salary}
            </Tag>
          )}
          {courseId && (
            <Tag icon={<BookOutlined />}>
              {typeof courseId === 'object' ? courseId.name : 'Related Course'}
            </Tag>
          )}
          <Tag icon={<CalendarOutlined />} color={isDeadlinePassed ? 'red' : 'default'}>
            {isDeadlinePassed 
              ? 'Closed on ' + format(deadline, 'MMM d, yyyy') 
              : 'Apply within ' + daysLeft + ' day' + (daysLeft !== 1 ? 's' : '')}
          </Tag>
        </Space>

        <Tabs 
          defaultActiveKey="details" 
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ marginTop: 16 }}
        >
          <TabPane tab={<span><FileTextOutlined /> Job Details</span>} key="details">
            <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
              <Col xs={24} lg={16}>
                <Card 
                  title="Job Description" 
                  bordered={false}
                  style={{ marginBottom: 24 }}
                >
                  <div dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br />') }} />
                </Card>

                <Card 
                  title="Key Responsibilities" 
                  bordered={false}
                  style={{ marginBottom: 24 }}
                >
                  <List
                    dataSource={responsibilities}
                    renderItem={item => (
                      <List.Item>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        {item}
                      </List.Item>
                    )}
                  />
                </Card>

                <Card title="Requirements" bordered={false}>
                  <List
                    dataSource={requirements}
                    renderItem={item => (
                      <List.Item>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        {item}
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>

              <Col xs={24} lg={8}>
                <Card title="Job Overview" style={{ marginBottom: 24 }}>
                  <Descriptions column={1}>
                    <Descriptions.Item label="Posted Date">
                      {format(parseISO(createdAt), 'MMM d, yyyy')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Application Deadline">
                      <Text type={isDeadlinePassed ? 'danger' : 'default'}>
                        {format(deadline, 'MMM d, yyyy')}
                        {isDeadlinePassed && ' (Closed)'}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Job Type">{jobType}</Descriptions.Item>
                    <Descriptions.Item label="Location">{location || 'Remote'}</Descriptions.Item>
                    {salary && (
                      <Descriptions.Item label="Salary">{salary}</Descriptions.Item>
                    )}
                    {courseId && (
                      <Descriptions.Item label="Related Course">
                        {typeof courseId === 'object' ? (
                          <Link to={`/courses/${courseId._id}`}>
                            {courseId.name}
                          </Link>
                        ) : (
                          'N/A'
                        )}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>

                {skills.length > 0 && (
                  <Card title="Skills" style={{ marginBottom: 24 }}>
                    <Space size={[8, 8]} wrap>
                      {skills.map((skill, index) => (
                        <Tag key={index} color="blue">
                          {skill}
                        </Tag>
                      ))}
                    </Space>
                  </Card>
                )}

                {benefits.length > 0 && (
                  <Card title="Benefits">
                    <List
                      size="small"
                      dataSource={benefits}
                      renderItem={benefit => (
                        <List.Item>
                          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                          {benefit}
                        </List.Item>
                      )}
                    />
                  </Card>
                )}
              </Col>
            </Row>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <UserOutlined />
                About {company || 'the Company'}
              </span>
            } 
            key="company"
          >
            <Card style={{ marginTop: 16 }}>
              <Title level={4}>About {company || 'Our Company'}</Title>
              <Paragraph>
                {job.companyDescription || 'No company information available. Please check back later for updates.'}
              </Paragraph>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {relatedJobs.length > 0 && (
        <Card title="Related Jobs" style={{ marginBottom: 24 }}>
          <List
            itemLayout="vertical"
            dataSource={relatedJobs}
            renderItem={relatedJob => (
              <List.Item
                key={relatedJob._id}
                actions={[
                  <Button 
                    type="link" 
                    onClick={() => navigate(`/career/${relatedJob._id}`)}
                  >
                    View Details
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <Link to={`/career/${relatedJob._id}`}>
                      {relatedJob.title}
                    </Link>
                  }
                  description={
                    <Space size={[8, 8]} wrap>
                      <Tag icon={<EnvironmentOutlined />}>
                        {relatedJob.location || 'Remote'}
                      </Tag>
                      <Tag icon={<ClockCircleOutlined />}>
                        {relatedJob.jobType}
                      </Tag>
                      {relatedJob.salary && (
                        <Tag icon={<DollarOutlined />}>
                          {relatedJob.salary}
                        </Tag>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      <JobApplicationModal
        visible={isApplicationModalVisible}
        onCancel={() => setIsApplicationModalVisible(false)}
        onSuccess={handleApplicationSuccess}
        job={job}
      />
    </div>
  );
};

export default JobDetails;
