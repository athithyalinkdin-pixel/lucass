import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, User as UserIcon, Package, ChevronRight, LogOut } from 'lucide-react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        
        // In a real app, we'd have a specific user orders endpoint
        // For now, we'll fetch orders from the general endpoint if user is admin or mock it
        try {
            const { data: orderData } = await api.get('/orders/myorders');
            setOrders(orderData || []);
        } catch {
            setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) return <div className="pt-48 text-center min-h-screen">Loading your profile...</div>;

  return (
    <div className="pt-32 pb-24 min-h-screen bg-bg-off-white">
      <Helmet>
        <title>My Dashboard | Lucas Agro & Naturals</title>
      </Helmet>

      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-secondary text-white rounded-full flex items-center justify-center text-3xl font-bold">
                    {user?.name?.charAt(0)}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-primary italic">Welcome, {user?.name}</h1>
                    <p className="text-primary/60">{user?.email}</p>
                </div>
            </div>
            <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 px-6 py-2 rounded-full transition-colors"
            >
                <LogOut size={20} />
                <span>Logout</span>
            </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
                <h3 className="text-2xl font-bold text-primary mb-8 flex items-center gap-3">
                    <Package className="text-secondary" />
                    Order History
                </h3>

                {orders.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <ShoppingBag className="mx-auto text-primary/10 mb-4" size={60} />
                        <p className="text-primary/60 mb-6">You haven't placed any orders yet.</p>
                        <Link to="/shop" className="btn-primary inline-block">Start Shopping</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <motion.div
                                key={order.id}
                                whileHover={{ scale: 1.01 }}
                                className="glass-card p-6 flex justify-between items-center group cursor-pointer"
                            >
                                <div>
                                    <p className="text-xs font-bold text-primary/40 uppercase mb-1">Order #{order.id}</p>
                                    <p className="font-bold text-primary">₹{order.total_amount}</p>
                                    <p className="text-xs text-primary/60">{new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                        order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {order.status}
                                    </span>
                                    <ChevronRight className="text-primary/20 group-hover:text-secondary transition-colors" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Profile Info */}
            <div>
                <h3 className="text-2xl font-bold text-primary mb-8 flex items-center gap-3">
                    <UserIcon className="text-secondary" />
                    Account Details
                </h3>
                <div className="glass-card p-8">
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs font-bold text-primary/40 uppercase mb-1">Full Name</p>
                            <p className="font-medium text-primary">{user?.name}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-primary/40 uppercase mb-1">Email Address</p>
                            <p className="font-medium text-primary">{user?.email}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-primary/40 uppercase mb-1">Phone Number</p>
                            <p className="font-medium text-primary">{user?.phone || 'Not provided'}</p>
                        </div>
                        <button className="text-sm font-bold text-secondary hover:underline pt-4">
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

export default UserDashboard;
