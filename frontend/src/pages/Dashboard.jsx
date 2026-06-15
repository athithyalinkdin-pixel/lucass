import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { LogOut, ShoppingBag, Package, ChevronRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/myorders');
        setOrders(data || []);
      } catch (err) {
        console.error('Error fetching dashboard orders:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const handleLogoutClick = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="pt-48 text-center min-h-screen text-primary font-bold">
        Loading your profile...
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-bg-off-white">
      <Helmet>
        <title>My Dashboard | Lucas Agro & Naturals</title>
      </Helmet>

      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-secondary text-white rounded-full flex items-center justify-center text-3xl font-black shadow-md font-serif">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary italic font-serif">
                Welcome, {user?.name}
              </h1>
              <p className="text-primary/60 font-semibold text-sm">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 px-6 py-2 rounded-full transition-colors border border-red-100"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left: Order History */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-primary mb-8 flex items-center gap-3 font-serif">
              <ShoppingBag className="text-secondary" />
              Order History
            </h3>

            {orders.length === 0 ? (
              <div className="glass-card p-12 text-center border border-accent/20">
                <Package className="mx-auto text-primary/10 mb-4" size={60} />
                <p className="text-primary/60 mb-6 font-semibold">You haven't placed any orders yet.</p>
                <Link to="/shop" className="btn-primary">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    key={order.id}
                    className="glass-card p-6 flex justify-between items-center group cursor-pointer border border-accent/20"
                  >
                    <div>
                      <p className="text-[10px] font-bold text-primary/40 uppercase mb-1">
                        Order #{order.id}
                      </p>
                      <p className="font-bold text-primary text-lg">₹{order.total_amount}</p>
                      <p className="text-xs text-primary/60">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          order.status === 'delivered' || order.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {order.status}
                      </span>
                      <ChevronRight className="text-primary/20 group-hover:text-secondary transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Account details */}
          <div>
            <h3 className="text-2xl font-bold text-primary mb-8 flex items-center gap-3 font-serif">
              <User className="text-secondary" />
              Account Details
            </h3>

            <div className="glass-card p-8 border border-accent/20">
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-primary/40 uppercase mb-1">Full Name</p>
                  <p className="font-semibold text-primary">{user?.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-primary/40 uppercase mb-1">Email Address</p>
                  <p className="font-semibold text-primary">{user?.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-primary/40 uppercase mb-1">Phone Number</p>
                  <p className="font-semibold text-primary">{user?.phone || 'Not provided'}</p>
                </div>
                <button className="text-sm font-bold text-secondary hover:underline pt-4 block">
                  Edit Profile Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
