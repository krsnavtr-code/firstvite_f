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
import ScrollToTop from "./components/ScrollToTop";
import AdminCourses from "./components/admin/courses";
import Users from "./components/admin/Users";
import ContactsPage from "./pages/admin/ContactsPage";
import AdminEnrollments from "./pages/admin/Enrollments";
import PrivateRoute from './components/PrivateRoute';
import Unauthorized from './pages/Unauthorized';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';
import CoursesByCategory from './pages/user/CoursesByCategory';
import AllCategories from './pages/user/AllCategories';
import CourseDetail from './pages/user/CourseDetail';
import CorporateTraining from './pages/user/CorporateTraining';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import MyLearning from './pages/user/MyLearning';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQPage from './pages/FAQPage';
import ManageFAQs from './pages/admin/ManageFAQs';
import ImageUploadDemo from './pages/admin/ImageUploadDemo';
import ImageGallery from './components/admin/ImageGallery';
import MediaGallery from './pages/admin/MediaGallery';
import { CartProvider } from './contexts/CartContext';
import Cart from './components/cart/Cart';
import Profile from './pages/user/Profile';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Create a layout component that conditionally renders Navbar and Footer
const MainLayout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <div className="dark:bg-slate-900 dark:text-white min-h-screen flex flex-col">
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow bg-gray-50 dark:bg-gray-900">
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
            <Home />
            <Login />
          </MainLayout>
        } />
        
        <Route path="/signup" element={
          <MainLayout>
            <Home />
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
        
        <Route path="/categories" element={
          <MainLayout>
            <AllCategories />
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
        
        <Route path="/faq" element={
          <MainLayout>
            <FAQPage />
          </MainLayout>
        } />
        
        <Route path="/corporate-training" element={
          <MainLayout>
            <CorporateTraining />
          </MainLayout>
        } />
        
        <Route path="/privacy-policy" element={
          <MainLayout>
            <PrivacyPolicy />
          </MainLayout>
        } />
        
        <Route path="/terms-of-service" element={
          <MainLayout>
            <TermsOfService />
          </MainLayout>
        } />

        {/* Protected routes */}
        <Route
          path="/my-learning"
          element={
            <PrivateRoute>
              <MainLayout>
                <MyLearning />
              </MainLayout>
            </PrivateRoute>
          }
        />
        
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
        
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <MainLayout>
                <Profile />
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
          <Route path="/admin/faqs" element={<ManageFAQs />} />
          <Route path="/admin/media" element={<MediaGallery />} />
          <Route path="/admin/image-upload" element={<ImageUploadDemo />} />
          <Route path="/admin/image-gallery" element={<ImageGallery />} />
          <Route path="/admin/enrollments" element={<AdminEnrollments />} />
          <Route path="/admin/*" element={<Navigate to="dashboard" replace />} />
        </Route>


        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Cart />
    </CartProvider>
  );
}

export default App;
