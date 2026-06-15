import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingLeaves from './components/FloatingLeaves';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Testimonials from './pages/Testimonials';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageBlog from './pages/admin/ManageBlog';
import ManageTestimonials from './pages/admin/ManageTestimonials';
import ManageRoles from './pages/admin/ManageRoles';
import ManageFeatured from './pages/admin/ManageFeatured';

function App() {
  return (
    <div className="min-h-screen bg-bg-off-white bg-texture relative flex flex-col justify-between">
      <ScrollToTop />
      <FloatingLeaves />
      <Navbar />
      <main className="flex-grow">
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
                <div className="pt-48 pb-32 text-center text-primary max-w-xl mx-auto px-4">
                  <div className="bg-white/60 backdrop-blur-md rounded-3xl p-10 border border-accent/20 shadow-premium">
                    <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h1 className="text-3xl font-black mb-4 font-serif">Order Successful!</h1>
                    <p className="text-primary/60 mb-8">
                      Thank you for choosing Lucas Agro & Naturals. Your payment has been verified, and your order is being processed.
                    </p>
                    <Link to="/dashboard" className="btn-primary py-3 px-8 text-sm uppercase tracking-wider font-bold">
                      View My Orders
                    </Link>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

import { Link } from 'react-router-dom';

export default App;
