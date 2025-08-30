import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Upload, Spin, Typography, Divider, Alert } from 'antd';
import { UploadOutlined, FilePdfOutlined, FileWordOutlined, FileImageOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from "../../contexts/AuthContext";

const { TextArea } = Input;
const { Text } = Typography;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];

const getFileIcon = (fileType) => {
  if (fileType === 'application/pdf') return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
  if (fileType.includes('word') || fileType.includes('document')) return <FileWordOutlined style={{ color: '#2b579a' }} />;
  if (fileType.includes('image')) return <FileImageOutlined style={{ color: '#52c41a' }} />;
  return <FileOutlined />;
};

const JobApplicationModal = ({ 
  visible, 
  onCancel, 
  onSuccess,
  job
}) => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [hasExistingResume, setHasExistingResume] = useState(false);

  // Check if user has an existing resume
  useEffect(() => {
    const checkExistingResume = async () => {
      if (user?._id) {
        try {
          const response = await axios.get(`/api/users/${user._id}/resume`);
          if (response.data.resumeUrl) {
            setResumeUrl(response.data.resumeUrl);
            setHasExistingResume(true);
            form.setFieldsValue({ useExistingResume: true });
          }
        } catch (error) {
          console.error('Error checking for existing resume:', error);
        }
      }
    };
    
    if (visible) {
      checkExistingResume();
    }
  }, [user, visible, form]);

  const handleFileChange = ({ fileList: newFileList }) => {
    // Only allow one file at a time
    const latestFile = newFileList.slice(-1);
    setFileList(latestFile);
  };

  const beforeUpload = (file) => {
    const isValidType = ALLOWED_FILE_TYPES.includes(file.type);
    const isLtMaxSize = file.size <= MAX_FILE_SIZE;

    if (!isValidType) {
      message.error('You can only upload PDF, DOC, DOCX, JPG, or PNG files!');
      return Upload.LIST_IGNORE;
    }
    if (!isLtMaxSize) {
      message.error('File must be smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }
    
    // Auto upload when file is selected
    const formData = new FormData();
    formData.append('resume', file);
    
    setUploading(true);
    
    axios.post('/api/upload/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(response => {
      setResumeUrl(response.data.url);
      message.success('Resume uploaded successfully');
      setUploading(false);
    })
    .catch(error => {
      console.error('Error uploading resume:', error);
      message.error('Failed to upload resume');
      setUploading(false);
    });
    
    return false; // Prevent default upload
  };

  const handleSubmit = async (values) => {
    if (!resumeUrl && !values.useExistingResume) {
      message.error('Please upload a resume or select your existing one');
      return;
    }

    try {
      setLoading(true);
      
      await axios.post('/api/applications', {
        jobId: job._id,
        coverLetter: values.coverLetter,
        resumeUrl: values.useExistingResume ? resumeUrl : resumeUrl
      });
      
      message.success('Application submitted successfully!');
      onSuccess();
      handleCancel();
    } catch (error) {
      console.error('Error submitting application:', error);
      message.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  return (
    <Modal
      title={`Apply for ${job?.title}`}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      <Divider />
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          coverLetter: `Dear Hiring Manager,\n\nI am excited to apply for the ${job?.title} position. ` +
`I believe my skills and experience make me a strong candidate for this role.\n\n` +
`Sincerely,\n${user?.name || 'Applicant'}`
        }}
      >
        {hasExistingResume && (
          <Form.Item 
            name="useExistingResume"
            valuePropName="checked"
            style={{ marginBottom: 16 }}
          >
            <div className="ant-upload-list ant-upload-list-text">
              <div className="ant-upload-list-item ant-upload-list-item-done">
                <div className="ant-upload-list-item-info">
                  <span>
                    <FilePdfOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                    <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                      View Current Resume
                    </a>
                  </span>
                </div>
                <div className="ant-upload-list-item-actions">
                  <span>Use this resume</span>
                </div>
              </div>
            </div>
          </Form.Item>
        )}

        <Form.Item
          label="Upload Resume (PDF, DOC, DOCX, JPG, PNG)"
          extra="Max file size: 5MB"
          style={{ marginBottom: 24 }}
        >
          <Upload
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={handleFileChange}
            maxCount={1}
            accept=".pdf,.doc,.docx,image/jpeg,image/png"
            showUploadList={{
              showRemoveIcon: true,
              showPreviewIcon: true,
            }}
          >
            <Button icon={<UploadOutlined />} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Select File'}
            </Button>
          </Upload>
        </Form.Item>

        <Form.Item
          label="Cover Letter"
          name="coverLetter"
          rules={[
            { required: true, message: 'Please write a cover letter' },
            { min: 100, message: 'Cover letter should be at least 100 characters' },
            { max: 5000, message: 'Cover letter should not exceed 5000 characters' }
          ]}
        >
          <TextArea 
            rows={8} 
            placeholder="Tell us why you're a great fit for this position..."
            showCount 
            maxLength={5000}
          />
        </Form.Item>

        <Alert 
          type="info" 
          message="Application Tips" 
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Tailor your cover letter to this specific position</li>
              <li>Highlight relevant experience and skills</li>
              <li>Keep it professional and proofread carefully</li>
              <li>Make sure your resume is up to date</li>
            </ul>
          } 
          style={{ marginBottom: 24 }}
          showIcon
        />

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button onClick={handleCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading || uploading}
            disabled={!resumeUrl && !form.getFieldValue('useExistingResume')}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default JobApplicationModal;
