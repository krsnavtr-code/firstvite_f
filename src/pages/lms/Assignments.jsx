import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Skeleton,
  Empty,
  Upload,
  Divider,
} from "antd";
import {
  FileDoneOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileImageOutlined,
  FileOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import { getMyEnrollments } from "../../api/lmsApi";
import { getSprintsByCourse } from "../../api/sprintApi";
import { getSessionsBySprint } from "../../api/sessionApi";
import { getTasksBySession } from "../../api/taskApi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { RangePicker } = DatePicker;
const { Option } = Select;

const Assignments = () => {
  const { currentUser } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [form] = Form.useForm();

  // Resolve user id used in submissions
  const userId = useMemo(
    () =>
      currentUser?._id ||
      localStorage.getItem("userId") ||
      JSON.parse(localStorage.getItem("user") || "{}")?._id,
    [currentUser]
  );

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        // 1) Get enrollments (courses the user is in)
        const enrollments = await getMyEnrollments();
        const courses = Array.isArray(enrollments)
          ? enrollments
              .map((e) => e.course || e?.data?.course || e)
              .filter(Boolean)
          : [];

        // 2) For each course, load sprints -> sessions -> tasks
        const allTasks = [];

        for (const course of courses) {
          const courseId = course?._id || course?.id;
          if (!courseId) continue;

          const sprintsRaw = await getSprintsByCourse(courseId);
          const sprints = Array.isArray(sprintsRaw)
            ? sprintsRaw
            : Array.isArray(sprintsRaw?.data)
            ? sprintsRaw.data
            : Array.isArray(sprintsRaw?.sprints)
            ? sprintsRaw.sprints
            : Array.isArray(sprintsRaw?.data?.sprints)
            ? sprintsRaw.data.sprints
            : [];

          for (const sprint of sprints) {
            const sprintId = sprint?._id || sprint?.id;
            if (!sprintId) continue;

            const sessionsRaw = await getSessionsBySprint(sprintId);
            const sessions = Array.isArray(sessionsRaw)
              ? sessionsRaw
              : Array.isArray(sessionsRaw?.data)
              ? sessionsRaw.data
              : Array.isArray(sessionsRaw?.sessions)
              ? sessionsRaw.sessions
              : Array.isArray(sessionsRaw?.data?.sessions)
              ? sessionsRaw.data.sessions
              : [];

            for (const session of sessions) {
              const sessionId = session?._id || session?.id;
              if (!sessionId) continue;

              try {
                const tasksRaw = await getTasksBySession(sessionId);
                const tasks = Array.isArray(tasksRaw)
                  ? tasksRaw
                  : Array.isArray(tasksRaw?.data)
                  ? tasksRaw.data
                  : Array.isArray(tasksRaw?.tasks)
                  ? tasksRaw.tasks
                  : Array.isArray(tasksRaw?.data?.tasks)
                  ? tasksRaw.data.tasks
                  : [];

                for (const task of tasks) {
                  // Determine user's submission & status
                  const submissions = Array.isArray(task?.submissions)
                    ? task.submissions
                    : [];
                  const mySubmission = submissions.find(
                    (s) => (s?.user?._id || s?.user) === userId
                  );
                  const status = mySubmission
                    ? typeof mySubmission.score === "number"
                      ? "graded"
                      : "submitted"
                    : "pending";

                  allTasks.push({
                    id: task?._id || task?.id,
                    title: task?.title || "Untitled Task",
                    course: course?.title || course?.name || "Course",
                    // Task model may not have dueDate; fallback to createdAt
                    dueDate: task?.dueDate
                      ? dayjs(task.dueDate)
                      : task?.createdAt
                      ? dayjs(task.createdAt)
                      : null,
                    status,
                    submittedDate: mySubmission?.submittedAt
                      ? dayjs(mySubmission.submittedAt)
                      : null,
                    grade:
                      typeof mySubmission?.score === "number"
                        ? mySubmission.score
                        : null,
                    totalPoints: 100,
                    description: task?.description || "",
                    attachments: [],
                  });
                }
              } catch (err) {
                // If a session has no tasks or fails, continue
                console.warn(
                  "Failed to load tasks for session",
                  sessionId,
                  err
                );
              }
            }
          }
        }

        setAssignments(allTasks);
      } catch (error) {
        console.error("Error loading assignments:", error);
        message.error(error?.message || "Failed to load assignments");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [userId]);

  const getStatusTag = (status) => {
    const statusMap = {
      pending: {
        color: "orange",
        icon: <ClockCircleOutlined />,
        text: "Pending",
      },
      submitted: {
        color: "blue",
        icon: <CheckCircleOutlined />,
        text: "Submitted",
      },
      late: { color: "red", icon: <CloseCircleOutlined />, text: "Late" },
      graded: { color: "green", icon: <CheckCircleOutlined />, text: "Graded" },
    };

    const statusInfo = statusMap[status] || { color: "default", text: status };
    return (
      <Tag color={statusInfo.color} icon={statusInfo.icon}>
        {statusInfo.text}
      </Tag>
    );
  };

  const getFileIcon = (type) => {
    const iconMap = {
      pdf: <FilePdfOutlined style={{ color: "#FF4D4F" }} />,
      doc: <FileWordOutlined style={{ color: "#1890FF" }} />,
      docx: <FileWordOutlined style={{ color: "#1890FF" }} />,
      jpg: <FileImageOutlined style={{ color: "#52C41A" }} />,
      png: <FileImageOutlined style={{ color: "#52C41A" }} />,
      zip: <FileOutlined style={{ color: "#FAAD14" }} />,
    };
    return iconMap[type] || <FileOutlined />;
  };

  const handleViewAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setIsModalVisible(true);
  };

  const handleSubmitAssignment = () => {
    // In a real app, this would upload the file to a server
    message.success("Assignment submitted successfully!");
    setIsModalVisible(false);

    // Update the assignment status
    const updatedAssignments = assignments.map((a) =>
      a.id === selectedAssignment.id
        ? { ...a, status: "submitted", submittedDate: dayjs() }
        : a
    );
    setAssignments(updatedAssignments);
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesStatus =
      filterStatus === "all" || assignment.status === filterStatus;
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchText.toLowerCase()) ||
      assignment.course.toLowerCase().includes(searchText.toLowerCase());
    const matchesDate =
      dateRange.length === 0 ||
      (assignment.dueDate &&
        assignment.dueDate.isAfter(dateRange[0]) &&
        assignment.dueDate.isBefore(dateRange[1]));

    return matchesStatus && matchesSearch && matchesDate;
  });

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <a onClick={() => handleViewAssignment(record)}>{text}</a>
      ),
    },
    {
      title: "Course",
      dataIndex: "course",
      key: "course",
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) =>
        date ? (
          <div>
            <div>{date.format("MMM D, YYYY")}</div>
            <div className="text-xs text-gray-500">{dayjs().to(date)}</div>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        ),
      sorter: (a, b) => {
        const ad = a.dueDate ? a.dueDate.valueOf() : 0;
        const bd = b.dueDate ? b.dueDate.valueOf() : 0;
        return ad - bd;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Submitted", value: "submitted" },
        { text: "Late", value: "late" },
        { text: "Graded", value: "graded" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      render: (grade, record) =>
        grade ? (
          <span className="font-medium">
            {grade}/{record.totalPoints}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            size="small"
            onClick={() => handleViewAssignment(record)}
            className="text-white bg-[#1677ff] hover:bg-[#1677ff]"
          >
            {record.status === "pending" || record.status === "late"
              ? "Submit"
              : "View"}
          </Button>
        </Space>
      ),
    },
  ];

  if (loading)
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Skeleton active />
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-whit">
          Take & Review Assignments
        </h1>
        {/* Learners shouldn't create assignments */}
      </div>

      <Card className="mb-6 border-2 border-[#001525] bg-gray-200 dark:bg-[#001529]">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search assignments..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full md:w-64 text-black bg-white dark:border-gray-600"
          />
          <Select
            placeholder="Filter by status"
            className="w-full md:w-48 text-black bg-white [&>div]:dark:border-gray-600"
            value={filterStatus}
            onChange={setFilterStatus}
            dropdownClassName="bg-white"
          >
            <Option value="all">All Statuses</Option>
            <Option value="pending">Pending</Option>
            <Option value="submitted">Submitted</Option>
            <Option value="late">Late</Option>
            <Option value="graded">Graded</Option>
          </Select>
          <RangePicker
            className="w-full md:w-80 text-black [&>div]:dark:border-gray-600 [&>input]:dark:text-white [&>input]:dark:placeholder-gray-400"
            popupClassName="bg-white"
            onChange={(dates) => setDateRange(dates || [])}
          />
        </div>

        {filteredAssignments.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredAssignments}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="
            overflow-x-auto 
            [&_.ant-table]:bg-white dark:[&_.ant-table]:bg-[#001529] 
            [&_.ant-table-thead>tr>th]:bg-gray-100 dark:[&_.ant-table-thead>tr>th]:bg-[#001a33] 
            [&_.ant-table-thead>tr>th]:text-black dark:[&_.ant-table-thead>tr>th]:text-white 
            [&_.ant-table-tbody>tr>td]:text-black dark:[&_.ant-table-tbody>tr>td]:text-white 
            [&_.ant-table-tbody>tr:hover>td]:bg-[#f5f5f5] 
            dark:[&_.ant-table-tbody>tr:hover>td]:bg-[#002140]
          "
          />
        ) : (
          <Empty description="No assignments found" />
        )}
      </Card>

      <Modal
        title={selectedAssignment?.title || "Assignment"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
          (selectedAssignment?.status === "pending" ||
            selectedAssignment?.status === "late") && (
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
                  {selectedAssignment.dueDate ? (
                    <>
                      {selectedAssignment.dueDate.format("dddd, MMMM D, YYYY")}
                      <span className="ml-2 text-sm text-gray-500">
                        ({dayjs().to(selectedAssignment.dueDate, true)} left)
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
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
                      (
                      {(
                        (selectedAssignment.grade /
                          selectedAssignment.totalPoints) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Assignments;
