import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Table, Space, Modal, message, DatePicker, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { getCourses } from '../../../api/courseApi';
import { createSprint, getSprintsByCourse, updateSprint, deleteSprint } from '../../../api/sprintApi';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const Sprint = () => {
  const [form] = Form.useForm();
  const [courses, setCourses] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(Array.isArray(data) ? data : (data.data || []));
      } catch (error) {
        message.error('Failed to fetch courses');
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  // Fetch sprints when selected course changes
  useEffect(() => {
    if (selectedCourse) {
      fetchSprints(selectedCourse);
    } else {
      setSprints([]);
    }
  }, [selectedCourse]);

  const fetchSprints = async (courseId) => {
    try {
      setLoading(true);
      const data = await getSprintsByCourse(courseId);
      setSprints(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Failed to fetch sprints');
      console.error('Error fetching sprints:', error);
    } finally {
      setLoading(false);
    }
  };

  const showModal = (sprint = null) => {
    setEditingSprint(sprint);
    if (sprint) {
      // Format dates for the form
      form.setFieldsValue({
        ...sprint,
        duration: [
          sprint.startDate ? new Date(sprint.startDate) : null,
          sprint.endDate ? new Date(sprint.endDate) : null
        ]
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      // Ensure we have valid dates
      if (!values.duration || !values.duration[0] || !values.duration[1]) {
        throw new Error('Please select a valid date range');
      }

      const sprintData = {
        name: values.name,
        description: values.description,
        courseId: selectedCourse,
        startDate: values.duration[0].toISOString(),
        endDate: values.duration[1].toISOString(),
        goal: values.goal,
        isActive: values.isActive !== undefined ? values.isActive : true
      };
      
      console.log('Sending sprint data to server:', JSON.stringify(sprintData, null, 2));

      console.log('Submitting sprint data:', sprintData);

      if (editingSprint) {
        console.log('Updating sprint with ID:', editingSprint._id);
        await updateSprint(editingSprint._id, sprintData);
        message.success('Sprint updated successfully');
      } else {
        console.log('Creating new sprint');
        const response = await createSprint(sprintData);
        console.log('Create sprint response:', response);
        message.success('Sprint created successfully');
      }

      setIsModalVisible(false);
      fetchSprints(selectedCourse);
    } catch (error) {
      message.error(`Failed to ${editingSprint ? 'update' : 'create'} sprint`);
      console.error('Error saving sprint:', error);
    }
  };

  const handleDelete = (sprintId) => {
    confirm({
      title: 'Are you sure you want to delete this sprint?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'No, cancel',
      onOk: async () => {
        try {
          await deleteSprint(sprintId);
          message.success('Sprint deleted successfully');
          fetchSprints(selectedCourse);
        } catch (error) {
          message.error('Failed to delete sprint');
          console.error('Error deleting sprint:', error);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive) => (
        <span style={{ color: isActive ? '#52c41a' : '#f5222d' }}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Sprint Management</h1>
        <div className="flex space-x-4">
          <Select
            placeholder="Select a course"
            style={{ width: 300 }}
            onChange={(value) => setSelectedCourse(value)}
            value={selectedCourse}
            allowClear
          >
            {courses.map(course => (
              <Option key={course._id} value={course._id}>
                {course.title}
              </Option>
            ))}
          </Select>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            disabled={!selectedCourse}
          >
            Add Sprint
          </Button>
        </div>
      </div>

      <Table 
        columns={columns} 
        dataSource={sprints} 
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`${editingSprint ? 'Edit' : 'Create'} Sprint`}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isActive: true,
          }}
        >
          <Form.Item
            name="name"
            label="Sprint Name"
            rules={[{ required: true, message: 'Please enter a sprint name' }]}
          >
            <Input placeholder="Enter sprint name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} placeholder="Enter sprint description" />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration"
            rules={[{ required: true, message: 'Please select sprint duration' }]}
          >
            <RangePicker style={{ width: '100%' }} showTime format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="goal"
            label="Sprint Goal"
          >
            <Input.TextArea rows={2} placeholder="What is the main goal of this sprint?" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item className="text-right">
            <Button className="mr-2" onClick={() => setIsModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingSprint ? 'Update' : 'Create'} Sprint
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Sprint;