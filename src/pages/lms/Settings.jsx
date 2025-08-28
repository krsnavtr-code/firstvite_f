import React, { useState } from 'react';
import { Card, Tabs, Form, Input, Button, Switch, message, Select, Upload, Avatar } from 'antd';
import { UserOutlined, UploadOutlined, MailOutlined, LockOutlined, NotificationOutlined, GlobalOutlined } from '@ant-design/icons';
import { useAuth } from "../../contexts/AuthContext";

const { Option } = Select;

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { currentUser, updateProfile } = useAuth();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await updateProfile(values);
      message.success('Profile updated successfully');
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    // Implement password change logic here
    console.log('Password change:', values);
    message.success('Password updated successfully');
  };

  const handleNotificationChange = (checked) => {
    console.log(`Notification ${checked ? 'enabled' : 'disabled'}`);
    message.info(`Notifications ${checked ? 'enabled' : 'disabled'}`);
  };

  const uploadProps = {
    name: 'avatar',
    action: '/api/upload',
    showUploadList: false,
    onChange(info) {
      if (info.file.status === 'done') {
        message.success('Profile picture updated successfully');
      } else if (info.file.status === 'error') {
        message.error('Upload failed');
      }
    },
  };

  const items = [
    {
      key: '1',
      label: (
        <span>
          <UserOutlined />
          Profile
        </span>
      ),
      children: (
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <Avatar 
              size={120} 
              icon={<UserOutlined />} 
              src={currentUser?.photoURL}
              className="mb-4"
            />
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Change Photo</Button>
            </Upload>
            <p className="text-gray-500 text-sm mt-2">JPG, GIF or PNG. Max size of 2MB</p>
          </div>
          
          <div className="flex-1">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                name: currentUser?.fullname || '',
                email: currentUser?.email || '',
                bio: 'I am a passionate learner!',
              }}
            >
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ message: 'Please input your name!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Your name" />
              </Form.Item>
              
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: 'email', message: 'Please input a valid email!' }]}
              >
                <Input prefix={<MailOutlined />} disabled />
              </Form.Item>
              
              <Form.Item
                name="bio"
                label="Bio"
              >
                <Input.TextArea rows={4} placeholder="Tell us about yourself" />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <span>
          <NotificationOutlined />
          Notifications
        </span>
      ),
      children: (
        <div className="space-y-6">
          <div className="flex justify-between items-center p-4 border-b">
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-gray-500 text-sm">Receive email notifications about your courses and account</p>
            </div>
            <Switch defaultChecked onChange={handleNotificationChange} />
          </div>
          
          <div className="flex justify-between items-center p-4 border-b">
            <div>
              <h3 className="font-medium">Course Updates</h3>
              <p className="text-gray-500 text-sm">Get notified when new content is added to your courses</p>
            </div>
            <Switch defaultChecked onChange={handleNotificationChange} />
          </div>
          
          <div className="flex justify-between items-center p-4 border-b">
            <div>
              <h3 className="font-medium">Promotional Emails</h3>
              <p className="text-gray-500 text-sm">Receive special offers and updates</p>
            </div>
            <Switch onChange={handleNotificationChange} />
          </div>
        </div>
      ),
    },
    {
      key: '4',
      label: (
        <span>
          <GlobalOutlined />
          Preferences
        </span>
      ),
      children: (
        <div className="space-y-6">
          <Form.Item
            label="Language"
            name="language"
            className="max-w-xs"
          >
            <Select defaultValue="en" placeholder="Select language">
              <Option value="en">English</Option>
              <Option value="es">Spanish</Option>
              <Option value="fr">French</Option>
              <Option value="de">German</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="Time Zone"
            name="timezone"
            className="max-w-xs"
          >
            <Select defaultValue="UTC+05:30" placeholder="Select timezone">
              <Option value="UTC">UTC</Option>
              <Option value="UTC+05:30">(UTC+05:30) India</Option>
              <Option value="UTC-05:00">(UTC-05:00) Eastern Time (US & Canada)</Option>
              <Option value="UTC+01:00">(UTC+01:00) London</Option>
            </Select>
          </Form.Item>
          
          <div className="pt-4">
            <Button type="primary">Save Preferences</Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <Card>
        <Tabs defaultActiveKey="1" items={items} />
      </Card>
    </div>
  );
};

export default Settings;
