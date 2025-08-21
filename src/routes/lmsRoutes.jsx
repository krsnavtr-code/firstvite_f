import { Navigate } from 'react-router-dom';
import Dashboard from '../pages/lms/Dashboard';
import Settings from '../pages/lms/Settings';
import Discussions from '../pages/lms/Discussions';
import Assignments from '../pages/lms/Assignments';
import CourseDetails from '../pages/lms/CourseDetails';
import SprintDetails from '../pages/lms/SprintDetails';

const lmsRoutes = [
  {
    path: 'dashboard',
    element: <Dashboard />,
  },
  {
    path: 'settings',
    element: <Settings />,
  },
  {
    path: 'discussions',
    element: <Discussions />,
  },
  {
    path: 'assignments',
    element: <Assignments />,
  },
  {
    path: 'courses/:courseId',
    element: <CourseDetails />,
  },
  {
    path: 'courses/:courseId/sprints/:sprintId',
    element: <SprintDetails />,
  },
  {
    path: '*',
    element: <Navigate to="dashboard" replace />,
  },
];

export default lmsRoutes;
