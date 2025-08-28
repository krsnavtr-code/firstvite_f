import { Navigate } from 'react-router-dom';
import Dashboard from '../pages/lms/Dashboard';
import Settings from '../pages/lms/Settings';
import FirstviteCommunity from '../pages/lms/FirstviteCommunity';
import Assignments from '../pages/lms/Assignments';
import CourseDetails from '../pages/lms/CourseDetails';
import SprintDetails from '../pages/lms/SprintDetails';
import TaskTest from '../pages/lms/TaskTest';
import MyLearning from '../pages/lms/MyLearning';
import ReferAndEarn from '../pages/lms/ReferAndEarn';
import Career from '../pages/lms/Career';
import CallbackRequest from '../pages/lms/CallbackRequest';

const lmsRoutes = [
  {
    path: "dashboard",
    element: <Dashboard />,
  },
  {
    path: "my-learning",
    element: <MyLearning />,
  },
  {
    path: "settings",
    element: <Settings />,
  },
  {
    path: "firstvite-community",
    element: <FirstviteCommunity />,
  },
  {
    path: "assignments",
    element: <Assignments />,
  },
  {
    path: "refer-and-earn",
    element: <ReferAndEarn />,
  },
  {
    path: "career",
    element: <Career />,
  },
  {
    path: "courses/:courseId",
    element: <CourseDetails />,
  },
  {
    path: "courses/:courseId/sprints/:sprintId",
    element: <SprintDetails />,
  },
  {
    path: "courses/:courseId/sprints/:sprintId/sessions/:sessionId/tasks/:taskId",
    element: <TaskTest />,
  },
  {
    path: "callback",
    element: <CallbackRequest />,
  },
  {
    path: "*",
    element: <Navigate to="dashboard" replace />,
  },
];

export default lmsRoutes;
