import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Modal, Form, Input, InputNumber, message, 
  Popconfirm, Select, Card, Tag, Divider 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  ArrowUpOutlined, ArrowDownOutlined, UnorderedListOutlined 
} from '@ant-design/icons';
import { 
  createSession, getSessionsBySprint, updateSession, 
  deleteSession, reorderSessions 
} from '../../../api/sessionApi';
import { 
  createTask, getTasksBySession, updateTask, deleteTask 
} from '../../../api/taskApi';
import TaskForm from './TaskForm';

const { TextArea } = Input;
const { Option } = Select;

const Sessions = ({ sprintId, onClose }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSessionModalVisible, setIsSessionModalVisible] = useState(false);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [form] = Form.useForm();
  const [taskForm] = Form.useForm();

  useEffect(() => {
    if (sprintId) {
      fetchSessions();
    }
  }, [sprintId]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await getSessionsBySprint(sprintId);
      if (response && response.data && response.data.sessions) {
        setSessions(response.data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      message.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const showSessionModal = (session = null) => {
    setEditingSession(session);
    if (session) {
      form.setFieldsValue({
        name: session.name,
        description: session.description,
        duration: session.duration,
        content: session.content,
        videoUrl: session.videoUrl,
        zoomMeetingLink: session.zoomMeetingLink || '',
        resources: session.resources || [],
        isActive: session.isActive
      });
    } else {
      form.resetFields();
    }
    setIsSessionModalVisible(true);
  };

  const showTaskModal = (sessionId) => {
    setCurrentSessionId(sessionId);
    fetchTasks(sessionId);
    setIsTaskModalVisible(true);
  };

  const fetchTasks = async (sessionId) => {
    try {
      setTasksLoading(true);
      const response = await getTasksBySession(sessionId);
      if (response && response.data && response.data.tasks) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      message.error('Failed to load tasks');
    } finally {
      setTasksLoading(false);
    }
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      setTasksLoading(true);
      if (taskData._id) {
        await updateTask(taskData._id, taskData);
        message.success('Task updated successfully');
      } else {
        await createTask({
          ...taskData,
          sessionId: currentSessionId
        });
        message.success('Task created successfully');
      }
      await fetchTasks(currentSessionId);
      taskForm.resetFields();
    } catch (error) {
      console.error('Error saving task:', error);
      message.error(error.response?.data?.message || 'Failed to save task');
    } finally {
      setTasksLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // Create a clean session data object with only the fields we need
      const sessionData = {
        name: values.name,
        description: values.description,
        duration: values.duration,
        content: values.content,
        videoUrl: values.videoUrl || '',
        zoomMeetingLink: values.zoomMeetingLink || '',
        isActive: values.isActive,
        resources: values.resources || [],
        sprintId
      };

      if (editingSession) {
        await updateSession(editingSession._id, sessionData);
        message.success('Session updated successfully');
      } else {
        await createSession(sessionData);
        message.success('Session created successfully');
      }

      setIsSessionModalVisible(false);
      form.resetFields();
      fetchSessions();
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response.data);
        message.error(error.response.data.message || 'Failed to save session');
      } else if (error.request) {
        console.error('No response received:', error.request);
        message.error('No response from server. Please try again.');
      } else {
        console.error('Error:', error.message);
        message.error(error.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteSession(id);
      message.success('Session deleted successfully');
      fetchSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      message.error('Failed to delete session');
    } finally {
      setLoading(false);
    }
  };

  const moveSession = async (id, direction) => {
    try {
      setLoading(true);
      const currentIndex = sessions.findIndex(s => s._id === id);
      if (currentIndex === -1) return;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= sessions.length) return;

      const newSessions = [...sessions];
      [newSessions[currentIndex], newSessions[newIndex]] = [newSessions[newIndex], newSessions[currentIndex]];
      
      setSessions(newSessions);
      
      await reorderSessions(sprintId, newSessions.map((s, idx) => ({
        id: s._id,
        order: idx + 1
      })));
      
      message.success('Session order updated');
    } catch (error) {
      console.error('Error reordering sessions:', error);
      message.error('Failed to reorder sessions');
      fetchSessions(); // Revert to server state on error
    } finally {
      setLoading(false);
    }
  };

  const handleSessionCancel = () => {
    setIsSessionModalVisible(false);
    setEditingSession(null);
    form.resetFields();
  };

  const handleTaskCancel = () => {
    setIsTaskModalVisible(false);
    setCurrentSessionId(null);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Duration (min)',
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
      sorter: (a, b) => a.duration - b.duration,
    },
    {
      title: 'Tasks',
      key: 'tasks',
      width: 100,
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<UnorderedListOutlined />}
          onClick={() => showTaskModal(record._id)}
        >
          Tasks ({record.taskCount || 0})
        </Button>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 250,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showSessionModal(record)}
          />
          <Button
            type="text"
            icon={<UnorderedListOutlined />}
            onClick={() => showTaskModal(record._id)}
          >
            Tasks
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this session?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Sessions</h2>
        <div className="flex space-x-2">
          <Button onClick={onClose} className="mr-2">
            Back to Sprints
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => showSessionModal()}
          >
            Add Session
          </Button>
        </div>
      </div>

      <Table 
        columns={columns} 
        dataSource={sessions.map(session => ({
          ...session,
          taskCount: session.tasks?.length || 0
        }))}
        rowKey="_id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editingSession ? 'Edit Session' : 'Add New Session'}
        open={isSessionModalVisible}
        onOk={handleSubmit}
        onCancel={handleSessionCancel}
        confirmLoading={loading}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            isActive: true,
            duration: 60
          }}
        >
          <Form.Item
            name="name"
            label="Session Name"
            rules={[{ required: true, message: 'Please enter session name' }]}
          >
            <Input placeholder="Enter session name" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Enter session description" />
          </Form.Item>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="duration"
              label="Duration (minutes)"
              rules={[{ required: true, message: 'Please enter duration' }]}
            >
              <InputNumber min={1} className="w-full" />
            </Form.Item>
            
            <Form.Item
              name="isActive"
              label="Status"
            >
              <Select>
                <Option value={true}>Active</Option>
                <Option value={false}>Inactive</Option>
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item
            name="videoUrl"
            label="Recorded Video Link"
            extra="If you want to add it later, leave it blank."
          >
            <Input placeholder="Enter recorded video link" />
          </Form.Item>

          <Form.Item
            name="zoomMeetingLink"
            label="Zoom Meeting Link"
            extra="Paste the full Zoom meeting URL. If you want to add it later, leave it blank."
            rules={[
              {
                type: 'url',
                message: 'Please enter a valid URL',
              },
            ]}
          >
            <Input 
              placeholder="https://zoom.us/j/meeting-id" 
              addonBefore={
                <span style={{ color: '#1890ff' }}>
                  <i className="fab fa-zoom" style={{ marginRight: 5 }} /> Zoom
                </span>
              }
            />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="Content"
          >
            <TextArea rows={6} placeholder="Enter session content (supports markdown)" />
          </Form.Item>
        </Form>
      </Modal>

      <TaskForm
        visible={isTaskModalVisible}
        sessionId={currentSessionId}
        onSave={handleTaskSubmit}
        onCancel={handleTaskCancel}
      />
    </div>
  );
};

export default Sessions;
