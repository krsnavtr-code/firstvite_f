import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Table, Space, Modal, message, DatePicker, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { getCourses } from '../../../api/courseApi';
import { 
  createSprint, 
  getSprintsByCourse, 
  updateSprint, 
  deleteSprint,
  getAllSprints 
} from '../../../api/sprintApi';

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
      // Pass null to fetchSprints to indicate we want all sprints
      fetchSprints(null);
    }
  }, [selectedCourse]);

  const fetchSprints = async (courseId) => {
    try {
      setLoading(true);
      let response;
      
      if (courseId) {
        console.log('Fetching sprints for course:', courseId);
        response = await getSprintsByCourse(courseId);
      } else {
        console.log('Fetching all sprints');
        response = await getAllSprints();
      }
      
      console.log('API Response:', response);
      
      // Handle different response formats
      let sprints = [];
      if (Array.isArray(response)) {
        // Direct array response
        sprints = response;
      } else if (response?.data?.sprints) {
        // Response with { data: { sprints: [...] } }
        sprints = response.data.sprints;
      } else if (response?.data && Array.isArray(response.data)) {
        // Response with { data: [...] }
        sprints = response.data;
      } else if (response?.results) {
        // Response with { results: N, data: { sprints: [...] } }
        sprints = response.data?.sprints || [];
      }
      
      console.log('Processed sprints:', sprints);
      setSprints(Array.isArray(sprints) ? sprints : []);
    } catch (error) {
      console.error('Error fetching sprints:', {
        error,
        response: error.response?.data,
        status: error.response?.status
      });
      message.error('Failed to fetch sprints. Please try again.');
      setSprints([]);
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
      form.resetFields();
      // Force refresh the sprints list
      fetchSprints(selectedCourse);
      
      // Add a small delay to ensure the backend has time to process
      setTimeout(() => {
        fetchSprints(selectedCourse);
      }, 500);
      
    } catch (error) {
      console.error('Error saving sprint:', {
        error,
        response: error.response?.data,
        status: error.response?.status
      });
      message.error(
        error.response?.data?.message || 
        `Failed to ${editingSprint ? 'update' : 'create'} sprint. Please try again.`
      );
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
      title: 'Sprint Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search by name"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
        </div>
      ),
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Course',
      dataIndex: ['courseId', 'title'],
      key: 'course',
      width: 200,
      render: (courseTitle) => courseTitle || 'No Course',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: 'Duration',
      key: 'duration',
      width: 250,
      render: (_, record) => {
        const start = record.startDate ? new Date(record.startDate).toLocaleDateString() : '-';
        const end = record.endDate ? new Date(record.endDate).toLocaleDateString() : '-';
        return (
          <div>
            <div>Start: {start}</div>
            <div>End: {end}</div>
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (isActive) => (
        <span 
          className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center ${
            isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}
        >
          <span className={`w-2 h-2 rounded-full mr-1 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Goal',
      dataIndex: 'goal',
      key: 'goal',
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EditOutlined className="text-blue-500" />} 
            onClick={() => showModal(record)}
            title="Edit"
          />
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record._id)}
            title="Delete"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl text-black font-semibold">Sprint Management</h1>
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{sprints.length}</span> {sprints.length === 1 ? 'sprint' : 'sprints'}
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => showModal()}
              disabled={!selectedCourse}
              size="small"
            >
              New Sprint
            </Button>
          </div>
        </div>
        <Table 
          columns={columns} 
          dataSource={sprints} 
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} sprints`,
            className: 'px-4 py-2',
            size: 'small',
          }}
          scroll={{ x: 1300, y: 'calc(100vh - 300px)' }}
          rowClassName="hover:bg-gray-50 cursor-pointer"
          onRow={(record) => ({
            onClick: () => showModal(record),
          })}
          className="border-t"
          size="middle"
          bordered={false}
        />
      </div>

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