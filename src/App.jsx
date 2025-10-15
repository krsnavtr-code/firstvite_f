import React from "react";
import { HelmetProvider } from "react-helmet-async";
import Home from "./home/Home";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Courses from "./components/Courses";
import LoginPage from "./pages/auth/LoginPage";
import FreeCourses from "./pages/FreeCourses";
import { Toaster } from "react-hot-toast";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import CategoriesList from "./components/admin/categories/CategoriesList";
import ScrollToTop from "./components/ScrollToTop";
import CoursesList from "./components/admin/courses/CoursesList";
import Users from "./components/admin/Users";
import ContactsList from "./components/admin/ContactsList";
import AdminEnrollments from "./pages/admin/Enrollments";
import PrivateRoute from "./components/PrivateRoute";
import Unauthorized from "./pages/Unauthorized";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CoursesByCategory from "./pages/user/CoursesByCategory";
import AllCategories from "./pages/user/AllCategories";
import CourseDetail from "./pages/user/CourseDetail";
import CategoryForm from "./components/admin/categories/CategoryForm";
import CorporateTraining from "./pages/user/CorporateTraining";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import MyLearning from "./pages/user/MyLearning";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQPage from "./pages/FAQPage";
import ManageFAQs from "./pages/admin/ManageFAQs";
import ImageUploadDemo from "./pages/admin/ImageUploadDemo";
import ImageGallery from "./components/admin/ImageGallery";
import CourseForm from "./components/admin/courses/CourseForm";
import MediaGallery from "./pages/admin/MediaGallery";
import { CartProvider } from "./contexts/CartContext";
import Profile from "./pages/user/Profile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useContactFormPopup from "./hooks/useContactFormPopup.jsx";
import SuspendedAccount from "./pages/SuspendedAccount";
import PendingApproval from "./pages/PendingApproval";
import ChatButton from "./components/common/ChatButton";
import PaymentTAndC from "./pages/PaymentTAndC";
import PaymentsList from "./pages/admin/PaymentsList";
import PaymentDetails from "./pages/admin/PaymentDetails";
import SendBrochure from "./pages/admin/SendBrochure";
import SendProposal from "./pages/admin/SendProposal";
import EmailRecords from "./pages/admin/EmailRecords";
import ThankYouPage from "./pages/ThankYouPage";
import CandidateInviteForm from "./pages/CandidateInviteForm";
import CareerManagement from "./pages/admin/career/CareerManagement";
import lmsRoutes from "./routes/lmsRoutes";

// Blog Components
import BlogListPage from "./pages/blog/BlogListPage";
import BlogDetailPage from "./pages/blog/BlogDetailPage";
import BlogPostList from "./pages/admin/BlogListPage";
import BlogPostForm from "./pages/admin/BlogPostForm";

// LMS Components
import LMSLayout from "./components/lms/LMSLayout";
import RegisterPage from "./pages/auth/RegisterPage";
import LMS from "./pages/lms";
import InactiveAccount from "./pages/auth/InactiveAccount";

// LMS Management Components for Admin Panel
import Sprint from "./components/admin/lmsManagement/Sprint.jsx";
import LmsManagement from "./components/admin/lmsManagement/LmsManagement.jsx";
import Assessment from "./components/admin/lmsManagement/Assessment.jsx";
import CandidatesPage from "./pages/admin/CandidatesPage.jsx";

// Create a layout component that conditionally renders Navbar and Footer
const MainLayout = ({ children }) => {
  const location = useLocation();
  // Check if the current route is an admin route
  const isAdminRoute = location.pathname.startsWith("/admin");
  // Check if the current route is an LMS route
  const isLMSRoute = location.pathname.startsWith("/lms");
  // Check if the current route is login, register, forgot-password, reset-password, or jobfair
  const isAuthRoute =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register") ||
    location.pathname.startsWith("/forgot-password") ||
    location.pathname.startsWith("/reset-password") ||
    location.pathname.startsWith("/jobfair");

  return (
    <div className="dark:bg-slate-900 dark:text-white min-h-screen flex flex-col">
      <ScrollToTop />
      {!isAdminRoute && !isLMSRoute && !isAuthRoute && <Navbar />}
      <main className="flex-grow bg-gray-50 dark:bg-gray-900">{children}</main>
      {!isAdminRoute && !isLMSRoute && !isAuthRoute && <Footer />}
      {!isAdminRoute && !isLMSRoute && !isAuthRoute && <ChatButton />}
    </div>
  );
};

function App() {
  const { ContactFormPopup } = useContactFormPopup();

  return (
    <HelmetProvider>
      <CartProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--color-bg-elevated)",
              color: "var(--color-fg-default)",
              boxShadow: "var(--shadow-lg)",
            },
            success: {
              iconTheme: {
                primary: "#10B981",
                secondary: "white",
              },
            },
            error: {
              iconTheme: {
                primary: "#EF4444",
                secondary: "white",
              },
            },
          }}
        />
        <ContactFormPopup />
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
          {/* Account Status Pages */}
          <Route path="/suspended" element={<SuspendedAccount />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/inactive-account" element={<InactiveAccount />} />

          {/* Public routes */}
          <Route
            path="/"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          >
            {/* Add any nested public routes here */}
          </Route>

          <Route
            path="/login"
            element={
              <MainLayout>
                <LoginPage />
              </MainLayout>
            }
          />

          {/* <Route path="/signup" element={
            <MainLayout>
              <Home />
              <Signup />
            </MainLayout>
          } /> */}

          <Route
            path="/unauthorized"
            element={
              <MainLayout>
                <Unauthorized />
              </MainLayout>
            }
          />

          {/* Public course routes */}
          <Route
            path="/courses"
            element={
              <MainLayout>
                <CoursesByCategory />
              </MainLayout>
            }
          />

          <Route
            path="/free-courses"
            element={
              <MainLayout>
                <FreeCourses />
              </MainLayout>
            }
          />

          <Route
            path="/courses/category/:categoryName"
            element={
              <MainLayout>
                <CoursesByCategory />
              </MainLayout>
            }
          />

          <Route
            path="/categories"
            element={
              <MainLayout>
                <AllCategories />
              </MainLayout>
            }
          />

          <Route
            path="/course/:id"
            element={
              <MainLayout>
                <CourseDetail />
              </MainLayout>
            }
          />

          <Route
            path="/about"
            element={
              <MainLayout>
                <About />
              </MainLayout>
            }
          />

          <Route
            path="/contact"
            element={
              <MainLayout>
                <Contact />
              </MainLayout>
            }
          />

          <Route
            path="/faq"
            element={
              <MainLayout>
                <FAQPage />
              </MainLayout>
            }
          />

          <Route
            path="/corporate-training"
            element={
              <MainLayout>
                <CorporateTraining />
              </MainLayout>
            }
          />

          <Route
            path="/privacy-policy"
            element={
              <MainLayout>
                <PrivacyPolicy />
              </MainLayout>
            }
          />

          <Route
            path="/terms-of-service"
            element={
              <MainLayout>
                <TermsOfService />
              </MainLayout>
            }
          />

          {/* Blog Routes */}
          <Route
            path="/blog"
            element={
              <MainLayout>
                <BlogListPage />
              </MainLayout>
            }
          />

          <Route
            path="/blog/:slug"
            element={
              <MainLayout>
                <BlogDetailPage />
              </MainLayout>
            }
          />

          <Route
            path="/payment-t-and-c"
            element={
              <MainLayout>
                <PaymentTAndC />
              </MainLayout>
            }
          />

          <Route
            path="/thank-you"
            element={
              <MainLayout>
                <ThankYouPage />
              </MainLayout>
            }
          />

          {/* Protected routes - Basic website access (only requires active account) */}
          <Route
            path="/profile"
            element={
              <PrivateRoute allowedRoles={["admin", "user", "student"]}>
                <MainLayout>
                  <Profile />
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* Protected routes - Requires active and approved account (LMS access) */}
          <Route
            path="/my-learning"
            element={
              <PrivateRoute
                requireLMS={true}
                allowedRoles={["student", "admin"]}
              >
                <MainLayout>
                  <MyLearning />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/my-courses"
            element={
              <PrivateRoute
                requireLMS={true}
                allowedRoles={["student", "admin"]}
              >
                <MainLayout>
                  <Courses />
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* LMS Routes - Requires active and approved account */}
          <Route
            path="/mylearning"
            element={
              <PrivateRoute
                requireLMS={true}
                allowedRoles={["student", "admin"]}
              >
                <Navigate to="/lms" replace />
              </PrivateRoute>
            }
          />

          <Route
            path="/lms"
            element={
              <PrivateRoute
                requireLMS={true}
                allowedRoles={["student", "admin"]}
              >
                <LMSLayout>
                  <LMS />
                </LMSLayout>
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            {lmsRoutes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </Route>

          {/* Status pages */}
          <Route
            path="/inactive-account"
            element={
              <MainLayout>
                <InactiveAccount />
              </MainLayout>
            }
          />
          <Route
            path="/pending-approval"
            element={
              <MainLayout>
                <PendingApproval />
              </MainLayout>
            }
          />

          {/* JobFair Routes */}
          <Route
            path="/jobfair"
            element={<Navigate to="/jobfair/apply/student" replace />}
          />
          <Route
            path="/jobfair/apply/student"
            element={
              <MainLayout>
                <CandidateInviteForm defaultType="student" />
              </MainLayout>
            }
          />
          <Route
            path="/jobfair/apply/company"
            element={
              <MainLayout>
                <CandidateInviteForm defaultType="company" />
              </MainLayout>
            }
          />

          {/* Admin Routes */}
          <Route
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route
              path="/admin"
              element={<Navigate to="dashboard" replace />}
            />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/categories" element={<CategoriesList />} />
            <Route path="/admin/categories/new" element={<CategoryForm />} />
            <Route
              path="/admin/categories/:id/edit"
              element={<CategoryForm />}
            />
            <Route path="/admin/courses" element={<CoursesList />} />
            <Route
              path="/admin/courses/new"
              element={<CourseForm isEdit={false} />}
            />
            <Route
              path="/admin/courses/:id/edit"
              element={<CourseForm isEdit={true} />}
            />
            <Route path="/admin/course/:id" element={<CourseDetail />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/contacts" element={<ContactsList />} />
            <Route path="/admin/faqs" element={<ManageFAQs />} />
            <Route path="/admin/media" element={<MediaGallery />} />
            <Route path="/admin/image-upload" element={<ImageUploadDemo />} />
            <Route path="/admin/image-gallery" element={<ImageGallery />} />
            <Route path="/admin/enrollments" element={<AdminEnrollments />} />

            {/* Payment Admin Routes */}
            <Route path="/admin/payments" element={<PaymentsList />} />
            <Route path="/admin/payments/:id" element={<PaymentDetails />} />

            {/* Blog Admin Routes */}
            <Route path="/admin/blog" element={<BlogPostList />} />
            <Route path="/admin/blog/new" element={<BlogPostForm />} />
            <Route path="/admin/blog/edit/:id" element={<BlogPostForm />} />

            {/* Career Management */}

            {/* Email Routes */}
            <Route path="/admin/email-records" element={<EmailRecords />} />
            <Route path="/admin/send-brochure" element={<SendBrochure />} />
            <Route path="/admin/send-proposal" element={<SendProposal />} />

            {/* LMS Routes */}
            <Route path="/admin/lms-management" element={<LmsManagement />} />
            <Route
              path="/admin/lms"
              element={<Navigate to="create-sprint" replace />}
            />
            <Route path="/admin/lms/create-sprint" element={<Sprint />} />
            <Route path="/admin/lms/assessment" element={<Assessment />} />
            <Route path="/admin/lms/career" element={<CareerManagement />} />

            {/* Candidates Management */}
            <Route path="/admin/candidates" element={<CandidatesPage />} />
          </Route>

          {/* LMS Routes */}
          <Route
            path="/register"
            element={
              <MainLayout>
                <RegisterPage />
              </MainLayout>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {/* <Cart /> */}
      </CartProvider>
    </HelmetProvider>
  );
}

export default App;
