import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  ShoppingBag, 
  FileText, 
  Users, 
  TrendingUp, 
  Package, 
  AlertCircle,
  LogOut,
  MessageSquare,
  Star
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const { data: statsData } = await api.get('/admin/stats');
        const { data: ordersData } = await api.get('/admin/orders');
        const { data: messagesData } = await api.get('/admin/messages').catch(() => ({ data: [] })); // Fail gracefully
        setStats(statsData);
        setOrders(ordersData.slice(0, 5)); // Just the 5 latest
        setMessages(messagesData.slice(0, 5)); // Just the 5 latest messages
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch {
      alert('Failed to update order status');
    }
  };

  if (loading) return <div className="p-8">Loading Dashboard...</div>;

  const statCards = [
    { title: 'Total Sales', value: `₹${stats?.totalSales || 0}`, icon: <TrendingUp />, color: 'bg-green-50' },
    { title: 'Total Orders', value: stats?.totalOrders || 0, icon: <ShoppingBag />, color: 'bg-blue-50' },
    { title: 'Products', value: stats?.totalProducts || 0, icon: <Package />, color: 'bg-yellow-50' },
    { title: 'Users', value: stats?.totalUsers || 0, icon: <Users />, color: 'bg-purple-50' },
    { title: 'Blog Posts', value: stats?.totalBlogs || 0, icon: <FileText />, color: 'bg-orange-50' },
    { title: 'Testimonials', value: stats?.totalTestimonials || 0, icon: <Star />, color: 'bg-teal-50' }
  ];

  return (
    <div className="pt-32 pb-24 px-6 md:px-8 max-w-7xl mx-auto min-h-screen">
      <Helmet>
        <title>Admin Dashboard | Lucas Agro</title>
      </Helmet>

      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Dashboard Overview</h1>
          <p className="text-primary/60 text-sm">Welcome back, {user?.name || 'Admin'}. Here's what's happening today.</p>
        </div>
        <button 
            onClick={async () => { await logout(); navigate('/login'); }}
            className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
        >
            <LogOut size={18} />
            <span>Logout</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-6 rounded-3xl ${card.color} border border-primary/5 flex items-center gap-6`}
          >
            <div className="p-4 bg-white rounded-2xl shadow-sm text-primary">
              {card.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-primary">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Recent Orders */}
        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-primary">Recent Orders</h3>
            <button className="text-sm font-bold text-secondary hover:underline">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-accent">
                  <th className="pb-4 text-xs font-bold text-primary/40 uppercase tracking-widest">Order ID</th>
                  <th className="pb-4 text-xs font-bold text-primary/40 uppercase tracking-widest">Customer</th>
                  <th className="pb-4 text-xs font-bold text-primary/40 uppercase tracking-widest">Amount</th>
                  <th className="pb-4 text-xs font-bold text-primary/40 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent">
                {orders.map((order) => (
                  <tr key={order.id} className="group hover:bg-bg-off-white transition-colors">
                    <td className="py-4 text-sm font-medium text-primary">#{order.id}</td>
                    <td className="py-4 text-sm text-primary/70">{order.customer_name}</td>
                    <td className="py-4 text-sm font-bold text-primary">₹{order.total_amount}</td>
                    <td className="py-4 text-sm">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border-none focus:ring-2 focus:ring-secondary cursor-pointer ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 
                          order.status === 'paid' ? 'bg-purple-100 text-purple-700' : 
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold text-primary mb-8">Quick Actions</h3>
          <div className="grid gap-3">
            <Link to="/admin/products" className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 hover:bg-primary hover:text-white transition-all group">
               <Package className="text-secondary group-hover:text-white" size={20} />
               <span className="font-bold text-sm">Manage Products</span>
            </Link>
            <Link to="/admin/blog" className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 hover:bg-primary hover:text-white transition-all group">
               <FileText className="text-secondary group-hover:text-white" size={20} />
               <span className="font-bold text-sm">Manage Blog Posts</span>
            </Link>
            <Link to="/admin/testimonials" className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 hover:bg-primary hover:text-white transition-all group">
               <Star className="text-secondary group-hover:text-white" size={20} />
               <span className="font-bold text-sm">Manage Testimonials</span>
            </Link>
            <Link to="/admin/users" className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 hover:bg-primary hover:text-white transition-all group">
               <Users className="text-secondary group-hover:text-white" size={20} />
               <span className="font-bold text-sm">Manage Users & Roles</span>
            </Link>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50">
               <AlertCircle className="text-amber-500" size={20} />
               <span className="font-bold text-sm text-amber-700">{stats?.lowStock || 0} Low Stock Alerts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Messages */}
      <div className="mt-10 glass-card p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold text-primary flex items-center gap-3">
            <MessageSquare className="text-secondary" size={22} />
            Contact Messages
            {stats?.unreadMessages > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{stats.unreadMessages} New</span>
            )}
          </h3>
        </div>

        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-primary/40 py-8 text-sm">No messages received yet.</p>
          ) : messages.map(msg => (
            <div key={msg.id} className={`p-5 rounded-2xl border transition-colors ${msg.is_read ? 'border-accent bg-transparent' : 'border-secondary/30 bg-secondary/5'}`}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-bold text-primary">{msg.name}</p>
                    {!msg.is_read && <span className="text-[10px] bg-secondary text-white px-2 py-0.5 rounded-full font-bold uppercase">Unread</span>}
                  </div>
                  <div className="flex gap-4 text-xs text-primary/40 mt-1">
                    <span>{msg.email}</span>
                    {msg.phone && <span>· {msg.phone}</span>}
                    <span>· {new Date(msg.created_at).toLocaleString('en-IN')}</span>
                  </div>
                  {msg.subject && <p className="text-sm font-semibold text-primary/70 mt-2">{msg.subject}</p>}
                  <p className="text-sm text-primary/60 mt-1 leading-relaxed">{msg.message}</p>
                </div>
                {!msg.is_read && (
                  <button
                    onClick={async () => {
                      await api.put(`/admin/messages/${msg.id}/read`);
                      setMessages(messages.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
                      setStats(s => ({ ...s, unreadMessages: Math.max(0, (s?.unreadMessages || 1) - 1) }));
                    }}
                    className="flex-shrink-0 text-xs font-bold text-secondary hover:underline"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
