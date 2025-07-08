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
import ContactsPage from "./pages/admin/ContactsPage";
import PrivateRoute from './components/PrivateRoute';
import Unauthorized from './pages/Unauthorized';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';
import CoursesByCategory from './pages/user/CoursesByCategory';
import CourseDetail from './pages/user/CourseDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import { CartProvider } from './contexts/CartContext';
import Cart from './components/cart/Cart';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    <CartProvider>
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
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={
          <MainLayout>
            <Home />
          </MainLayout>
        }>
          {/* Add any nested public routes here */}
        </Route>
        
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

        {/* Public course routes */}
        <Route path="/courses" element={
          <MainLayout>
            <CoursesByCategory />
          </MainLayout>
        } />
        
        <Route path="/courses/category/:categoryName" element={
          <MainLayout>
            <CoursesByCategory />
          </MainLayout>
        } />
        
        <Route path="/course/:id" element={
          <MainLayout>
            <CourseDetail />
          </MainLayout>
        } />
        
        <Route path="/about" element={
          <MainLayout>
            <About />
          </MainLayout>
        } />
        
        <Route path="/contact" element={
          <MainLayout>
            <Contact />
          </MainLayout>
        } />

        {/* Protected routes */}
        <Route
          path="/my-courses"
          element={
            <PrivateRoute>
              <MainLayout>
                <Courses />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* Admin routes - No Navbar/Footer */}
        <Route element={
          <PrivateRoute roles={['admin']}>
            <AdminLayout />
          </PrivateRoute>
        }>
          <Route path="/admin" element={<Navigate to="dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/categories/*" element={<Categories />} />
          <Route path="/admin/courses/*" element={<AdminCourses />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/contacts" element={<ContactsPage />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Cart />
    </CartProvider>
  );
}

export default App;
