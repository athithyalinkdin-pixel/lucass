import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingLeaves from './components/FloatingLeaves';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
const Home = React.lazy(() => import('./pages/Home'));
const Shop = React.lazy(() => import('./pages/Shop'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Blog = React.lazy(() => import('./pages/Blog'));
const BlogDetail = React.lazy(() => import('./pages/BlogDetail'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const Testimonials = React.lazy(() => import('./pages/Testimonials'));

// Admin Pages
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const ManageProducts = React.lazy(() => import('./pages/admin/ManageProducts'));
const ManageBlog = React.lazy(() => import('./pages/admin/ManageBlog'));
const ManageTestimonials = React.lazy(() => import('./pages/admin/ManageTestimonials'));
const ManageRoles = React.lazy(() => import('./pages/admin/ManageRoles'));
const ManageFeatured = React.lazy(() => import('./pages/admin/ManageFeatured'));
const ManageOrders = React.lazy(() => import('./pages/admin/ManageOrders'));

// Sleek loading skeleton
const PageLoading = () => (
  <div className="pt-32 pb-24 min-h-screen bg-bg-off-white flex flex-col items-center justify-center">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 border-2 border-secondary/15 rounded-full"></div>
      <div className="absolute inset-0 border-2 border-t-secondary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
    </div>
    <p className="mt-4 text-primary/30 font-bold text-[10px] uppercase tracking-widest animate-pulse">
      Loading Wellness...
    </p>
  </div>
);

// Animated Order Success Page
const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(6);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="pt-48 pb-32 text-center text-primary max-w-xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/60 backdrop-blur-md rounded-3xl p-10 border border-accent/20 shadow-premium"
      >
        <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut", delay: 0.2 }}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-black mb-4 font-serif">Order Successful!</h1>
        <p className="text-primary/60 mb-6">
          Thank you for choosing Lucas Agro & Naturals. Your payment has been verified, and your order is being processed.
        </p>
        <div className="text-xs font-bold text-secondary bg-secondary/5 border border-secondary/10 rounded-2xl py-3 px-6 mb-8 max-w-sm mx-auto">
          🔄 Redirecting to your dashboard in <span className="text-sm font-black">{countdown}</span> seconds...
        </div>
        <div className="flex gap-4 justify-center">
          <Link to="/" className="btn-secondary py-3 px-8 text-xs uppercase tracking-wider font-extrabold">
            Continue Shopping
          </Link>
          <Link to="/dashboard" className="btn-primary py-3 px-8 text-xs uppercase tracking-wider font-extrabold">
            View My Orders
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-bg-off-white bg-texture relative flex flex-col justify-between">
      <ScrollToTop />
      <FloatingLeaves />
      <Navbar />
      <main className="flex-grow">
        <React.Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/testimonials" element={<Testimonials />} />

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <ManageOrders />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <ManageProducts />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/blog"
              element={
                <AdminRoute>
                  <ManageBlog />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/testimonials"
              element={
                <AdminRoute>
                  <ManageTestimonials />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/roles"
              element={
                <AdminRoute>
                  <ManageRoles />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/featured"
              element={
                <AdminRoute>
                  <ManageFeatured />
                </AdminRoute>
              }
            />

            {/* Order Success Page */}
            <Route
              path="/order-success"
              element={
                <ProtectedRoute>
                  <OrderSuccessPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </React.Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;
