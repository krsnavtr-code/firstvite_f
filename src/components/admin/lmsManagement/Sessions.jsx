import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, message, Popconfirm, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { createSession, getSessionsBySprint, updateSession, deleteSession, reorderSessions } from '../../../api/sessionApi';

const { TextArea } = Input;
const { Option } = Select;

const Sessions = ({ sprintId, onClose }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [form] = Form.useForm();

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

  const showModal = (session = null) => {
    setEditingSession(session);
    form.setFieldsValue({
      name: session?.name || '',
      description: session?.description || '',
      duration: session?.duration || 60,
      content: session?.content || '',
      videoUrl: session?.videoUrl || '',
      isActive: session?.isActive ?? true
    });
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingSession) {
        await updateSession(editingSession._id, {
          ...values,
          sprintId
        });
        message.success('Session updated successfully');
      } else {
        await createSession({
          ...values,
          sprintId
        });
        message.success('Session created successfully');
      }

      setIsModalVisible(false);
      fetchSessions();
    } catch (error) {
      console.error('Error saving session:', error);
      message.error(error.response?.data?.message || 'Failed to save session');
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

  const columns = [
    {
      title: 'Order',
      key: 'order',
      width: 100,
      render: (_, record, index) => (
        <div className="flex items-center space-x-1">
          <Button 
            icon={<ArrowUpOutlined />} 
            size="small" 
            disabled={index === 0}
            onClick={(e) => {
              e.stopPropagation();
              moveSession(record._id, 'up');
            }}
          />
          <span className="mx-1">{index + 1}</span>
          <Button 
            icon={<ArrowDownOutlined />} 
            size="small" 
            disabled={index === sessions.length - 1}
            onClick={(e) => {
              e.stopPropagation();
              moveSession(record._id, 'down');
            }}
          />
        </div>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">{record.duration} minutes</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      width: 100,
      render: (isActive) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={(e) => {
              e.stopPropagation();
              showModal(record);
            }}
          />
          <Popconfirm
            title="Are you sure you want to delete this session?"
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDelete(record._id);
            }}
            onCancel={(e) => e?.stopPropagation()}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={(e) => e.stopPropagation()}
            />
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
            onClick={() => showModal()}
          >
            Add Session
          </Button>
        </div>
      </div>

      <Table 
        columns={columns} 
        dataSource={sessions} 
        rowKey="_id"
        loading={loading}
        pagination={false}
        rowClassName="cursor-pointer hover:bg-gray-50"
        onRow={(record) => ({
          onClick: () => showModal(record),
        })}
      />

      <Modal
        title={`${editingSession ? 'Edit' : 'Create'} Session`}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={loading}
        width={700}
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
            label="Meeting Link! If you want to add it later, leave it blank."
          >
            <Input placeholder="Enter meeting link" />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="Content"
          >
            <TextArea rows={6} placeholder="Enter session content (supports markdown)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Sessions;
