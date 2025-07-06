import React from "react";
import Home from "./home/Home";
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Courses from "./components/Courses";
import Signup from "./components/Signup";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthProvider";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import Categories from "./components/admin/categories";
import AdminCourses from "./components/admin/courses";
import Users from "./components/admin/Users";
import PrivateRoute from './components/PrivateRoute';
import Unauthorized from './pages/Unauthorized';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';

// Create a layout component that conditionally renders Navbar and Footer
const MainLayout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <div className="dark:bg-slate-900 dark:text-white min-h-screen flex flex-col">
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

function App() {
  const { authUser } = useAuth();
  
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-bg-elevated)',
            color: 'var(--color-fg-default)',
            boxShadow: 'var(--shadow-lg)'
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={
          <MainLayout>
            <Home />
          </MainLayout>
        } />
        
        <Route path="/login" element={
          <MainLayout>
            <Login />
          </MainLayout>
        } />
        
        <Route path="/signup" element={
          <MainLayout>
            <Signup />
          </MainLayout>
        } />
        
        <Route path="/unauthorized" element={
          <MainLayout>
            <Unauthorized />
          </MainLayout>
        } />

        {/* Protected routes */}
        <Route
          path="/course"
          element={
            <PrivateRoute>
              <MainLayout>
                <Courses />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* Admin routes - No Navbar/Footer */}
        <Route
          path="/admin"
          element={
            <PrivateRoute roles={['admin']}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="categories/*" element={<Categories />} />
          <Route path="courses/*" element={<AdminCourses />} />
          <Route path="users" element={<Users />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
