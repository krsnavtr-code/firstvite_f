import React, { useState } from 'react';
import { Card, Table, Tag, Space, Button, Modal, Form, Input, DatePicker, Select, message } from 'antd';
import { 
  FileDoneOutlined, 
  PlusOutlined, 
  SearchOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  CloseCircleOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileImageOutlined,
  FileOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { RangePicker } = DatePicker;
const { Option } = Select;

const Assignments = () => {
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'React Hooks Implementation',
      course: 'Advanced React',
      dueDate: dayjs().add(3, 'day'),
      status: 'pending', // pending, submitted, late, graded
      submittedDate: null,
      grade: null,
      totalPoints: 100,
      description: 'Create a custom hook that fetches data from an API and handles loading and error states.',
      attachments: [
        { name: 'assignment_requirements.pdf', type: 'pdf' },
        { name: 'example_code.zip', type: 'zip' }
      ]
    },
    {
      id: 2,
      title: 'Redux Store Design',
      course: 'State Management',
      dueDate: dayjs().subtract(1, 'day'),
      status: 'late',
      submittedDate: null,
      grade: null,
      totalPoints: 100,
      description: 'Design a Redux store for an e-commerce application.',
      attachments: []
    },
    {
      id: 3,
      title: 'Responsive Layout',
      course: 'CSS & Styling',
      dueDate: dayjs().subtract(5, 'day'),
      status: 'graded',
      submittedDate: dayjs().subtract(6, 'day'),
      grade: 92,
      totalPoints: 100,
      description: 'Create a responsive layout using CSS Grid and Flexbox.',
      attachments: [
        { name: 'layout_design.pdf', type: 'pdf' },
        { name: 'screenshot.png', type: 'image' }
      ]
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState([]);
  const [form] = Form.useForm();

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Pending' },
      submitted: { color: 'blue', icon: <CheckCircleOutlined />, text: 'Submitted' },
      late: { color: 'red', icon: <CloseCircleOutlined />, text: 'Late' },
      graded: { color: 'green', icon: <CheckCircleOutlined />, text: 'Graded' },
    };
    
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return (
      <Tag color={statusInfo.color} icon={statusInfo.icon}>
        {statusInfo.text}
      </Tag>
    );
  };

  const getFileIcon = (type) => {
    const iconMap = {
      pdf: <FilePdfOutlined style={{ color: '#FF4D4F' }} />,
      doc: <FileWordOutlined style={{ color: '#1890FF' }} />,
      docx: <FileWordOutlined style={{ color: '#1890FF' }} />,
      jpg: <FileImageOutlined style={{ color: '#52C41A' }} />,
      png: <FileImageOutlined style={{ color: '#52C41A' }} />,
      zip: <FileOutlined style={{ color: '#FAAD14' }} />,
    };
    return iconMap[type] || <FileOutlined />;
  };

  const handleViewAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setIsModalVisible(true);
  };

  const handleSubmitAssignment = () => {
    // In a real app, this would upload the file to a server
    message.success('Assignment submitted successfully!');
    setIsModalVisible(false);
    
    // Update the assignment status
    const updatedAssignments = assignments.map(a => 
      a.id === selectedAssignment.id 
        ? { ...a, status: 'submitted', submittedDate: dayjs() } 
        : a
    );
    setAssignments(updatedAssignments);
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    const matchesSearch = assignment.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         assignment.course.toLowerCase().includes(searchText.toLowerCase());
    const matchesDate = dateRange.length === 0 || 
                       (assignment.dueDate.isAfter(dateRange[0]) && 
                        assignment.dueDate.isBefore(dateRange[1]));
    
    return matchesStatus && matchesSearch && matchesDate;
  });

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a onClick={() => handleViewAssignment(record)}>{text}</a>
      ),
    },
    {
      title: 'Course',
      dataIndex: 'course',
      key: 'course',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => (
        <div>
          <div>{date.format('MMM D, YYYY')}</div>
          <div className="text-xs text-gray-500">{dayjs().to(date)}</div>
        </div>
      ),
      sorter: (a, b) => a.dueDate - b.dueDate,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Submitted', value: 'submitted' },
        { text: 'Late', value: 'late' },
        { text: 'Graded', value: 'graded' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade, record) => (
        grade ? 
          <span className="font-medium">{grade}/{record.totalPoints}</span> : 
          <span className="text-gray-400">-</span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleViewAssignment(record)}
          >
            {record.status === 'pending' || record.status === 'late' ? 'Submit' : 'View'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assignments</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          New Assignment
        </Button>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search assignments..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full md:w-64"
          />
          <Select
            placeholder="Filter by status"
            className="w-full md:w-48"
            value={filterStatus}
            onChange={setFilterStatus}
          >
            <Option value="all">All Statuses</Option>
            <Option value="pending">Pending</Option>
            <Option value="submitted">Submitted</Option>
            <Option value="late">Late</Option>
            <Option value="graded">Graded</Option>
          </Select>
          <RangePicker 
            className="w-full md:w-80"
            onChange={(dates) => setDateRange(dates)}
          />
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredAssignments} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          className="overflow-x-auto"
        />
      </Card>

      <Modal
        title={selectedAssignment?.title || 'Assignment'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
          (selectedAssignment?.status === 'pending' || selectedAssignment?.status === 'late') && (
            <Button 
              key="submit" 
              type="primary" 
              onClick={handleSubmitAssignment}
            >
              Submit Assignment
            </Button>
          ),
        ]}
        width={800}
      >
        {selectedAssignment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Course</div>
                <div className="font-medium">{selectedAssignment.course}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Due Date</div>
                <div className="font-medium">
                  {selectedAssignment.dueDate.format('dddd, MMMM D, YYYY')}
                  <span className="ml-2 text-sm text-gray-500">
                    ({dayjs().to(selectedAssignment.dueDate, true)} left)
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div>{getStatusTag(selectedAssignment.status)}</div>
              </div>
              {selectedAssignment.grade && (
                <div>
                  <div className="text-sm text-gray-500">Grade</div>
                  <div className="font-medium">
                    {selectedAssignment.grade}/{selectedAssignment.totalPoints} 
                    <span className="ml-2 text-gray-500">
                      ({(selectedAssignment.grade / selectedAssignment.totalPoints * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Divider orientation="left">Description</Divider>
            <div className="bg-gray-50 p-4 rounded">
              {selectedAssignment.description}
            </div>

            {selectedAssignment.attachments && selectedAssignment.attachments.length > 0 && (
              <>
                <Divider orientation="left">Attachments</Divider>
                <div className="space-y-2">
                  {selectedAssignment.attachments.map((file, index) => {
                    const fileType = file.name.split('.').pop().toLowerCase();
                    return (
                      <div key={index} className="flex items-center p-2 border rounded hover:bg-gray-50">
                        <span className="mr-2">{getFileIcon(fileType)}</span>
                        <span className="flex-1">{file.name}</span>
                        <Button type="link" size="small">Download</Button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {(selectedAssignment.status === 'pending' || selectedAssignment.status === 'late') && (
              <>
                <Divider orientation="left">Submit Your Work</Divider>
                <Form form={form} layout="vertical">
                  <Form.Item
                    name="submission"
                    label="Upload your work"
                    rules={[{ required: true, message: 'Please upload your assignment' }]}
                  >
                    <Upload.Dragger>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">Click or drag file to this area to upload</p>
                      <p className="ant-upload-hint">
                        Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                        band files
                      </p>
                    </Upload.Dragger>
                  </Form.Item>
                  <Form.Item
                    name="comments"
                    label="Comments (Optional)"
                  >
                    <Input.TextArea rows={4} placeholder="Add any comments for your instructor" />
                  </Form.Item>
                </Form>
              </>
            )}

            {selectedAssignment.status === 'graded' && (
              <>
                <Divider orientation="left">Feedback</Divider>
                <div className="bg-blue-50 p-4 rounded">
                  <div className="font-medium mb-2">Instructor's Feedback:</div>
                  <p>Great work! Your implementation of the custom hook is clean and efficient. 
                  You've handled all the edge cases we discussed in class. Keep it up!</p>
                  <div className="mt-4 text-sm text-gray-500">
                    Graded on: {dayjs().subtract(2, 'day').format('MMMM D, YYYY')}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Assignments;
