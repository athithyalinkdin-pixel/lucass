import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Filter, Calendar, MapPin, User, Phone, CreditCard, ChevronDown, ChevronUp, Check, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import AdminNav from '../../components/AdminNav';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState({});

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/admin/orders');
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
      );
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const toggleExpandOrder = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Calculations for stats
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const processingCount = orders.filter((o) => o.status === 'processing').length;
  const shippedCount = orders.filter((o) => o.status === 'shipped').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  const filteredOrders = orders.filter((order) => {
    // Search query matches Order ID, Customer Name, Email, or City
    const matchesSearch =
      order.id.toString().includes(searchQuery) ||
      (order.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.city || '').toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter matches
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="pt-32 pb-24 min-h-screen bg-bg-off-white">
      <Helmet>
        <title>Order Management | Lucas Agro</title>
      </Helmet>

      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Admin Navigation Tabs */}
        <AdminNav />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 text-left">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1 font-serif">Order Management</h1>
            <p className="text-primary/50 text-sm font-semibold">
              Manage incoming customer transactions, fulfillments, and status controls
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-10">
          <div className="bg-white p-5 rounded-2xl border border-accent/20 shadow-sm text-left">
            <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mb-1">Total Revenue</p>
            <p className="text-xl font-bold text-primary">₹{totalRevenue.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-accent/20 shadow-sm text-left">
            <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mb-1">Total Orders</p>
            <p className="text-xl font-bold text-primary">{totalOrders}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-accent/20 shadow-sm text-left">
            <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mb-1">Pending</p>
            <p className="text-xl font-bold text-yellow-600">{pendingCount}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-accent/20 shadow-sm text-left">
            <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mb-1">Processing</p>
            <p className="text-xl font-bold text-blue-500">{processingCount}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-accent/20 shadow-sm text-left">
            <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mb-1">Shipped</p>
            <p className="text-xl font-bold text-indigo-600">{shippedCount}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-accent/20 shadow-sm text-left">
            <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mb-1">Delivered</p>
            <p className="text-xl font-bold text-green-600">{deliveredCount}</p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30" size={18} />
            <input
              type="text"
              placeholder="Search by ID, name, email, or city..."
              className="w-full bg-white border border-accent rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-secondary transition-colors text-sm font-semibold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30" size={18} />
              <select
                className="w-full md:w-48 bg-white border border-accent rounded-2xl pl-12 pr-8 py-3 focus:outline-none focus:border-secondary transition-colors text-sm font-bold cursor-pointer appearance-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="paid">Paid</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="p-12 text-center text-primary/50 font-bold">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="glass-card p-16 text-center border border-accent/20 bg-white">
            <ShoppingBag size={48} className="mx-auto text-primary/10 mb-4" />
            <p className="text-primary/50 font-bold">No orders found.</p>
          </div>
        ) : (
          <div className="grid gap-6 text-left">
            {filteredOrders.map((order) => {
              const isExpanded = !!expandedOrders[order.id];
              return (
                <motion.div
                  layout
                  key={order.id}
                  className="glass-card p-6 border border-accent/20 bg-white rounded-3xl shadow-sm"
                >
                  {/* Top Bar Summary */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-accent pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-lg font-bold text-primary">Order #{order.id}</span>
                        <span className="text-xs font-semibold text-primary/40 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(order.created_at).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-primary/60 mt-1">
                        Customer: <span className="text-primary">{order.customer_name || 'Guest User'}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Grand Total</p>
                        <p className="font-serif text-lg font-bold text-secondary">₹{order.total_amount}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold uppercase border border-accent/30 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer ${
                            order.status === 'delivered'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : order.status === 'shipped'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : order.status === 'processing'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : order.status === 'paid'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : order.status === 'pending'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="paid">Paid</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        <button
                          onClick={() => toggleExpandOrder(order.id)}
                          className="p-2 hover:bg-accent/40 rounded-xl text-primary/50 hover:text-primary transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick summary info */}
                  {!isExpanded && (
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-primary/60">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-secondary" />
                        {order.city}, {order.state}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ShoppingBag size={14} className="text-secondary" />
                        {order.items?.length || 0} items purchased
                      </span>
                    </div>
                  )}

                  {/* Expanded Detailed View */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid md:grid-cols-2 gap-8 pt-4 border-t border-accent/40 mt-4">
                          {/* Left: Customer & Shipping Details */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold text-primary/40 uppercase tracking-widest border-b border-accent pb-2">
                              Customer & Shipping Details
                            </h4>
                            
                            <div className="space-y-3 text-xs font-semibold text-primary/80">
                              <div className="flex items-center gap-3">
                                <User size={16} className="text-secondary" />
                                <div>
                                  <p className="font-bold text-primary">{order.customer_name || 'Guest User'}</p>
                                  {order.customer_email && (
                                    <p className="text-[10px] text-primary/50">{order.customer_email}</p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <Phone size={16} className="text-secondary" />
                                <span>{order.phone}</span>
                              </div>

                              <div className="flex items-start gap-3">
                                <MapPin size={16} className="text-secondary mt-0.5" />
                                <div>
                                  <p>{order.address_line1}</p>
                                  <p>
                                    {order.city}, {order.state} – {order.zip}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3 pt-2">
                                <CreditCard size={16} className="text-secondary mt-0.5" />
                                <div>
                                  <p className="font-bold uppercase tracking-widest text-[9px] text-primary/45">Razorpay Reference</p>
                                  <p>Order ID: <span className="font-mono text-primary">{order.razorpay_order_id || 'N/A'}</span></p>
                                  <p>Payment ID: <span className="font-mono text-primary">{order.payment_id || 'N/A'}</span></p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right: Order Items */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold text-primary/40 uppercase tracking-widest border-b border-accent pb-2">
                              Items Ordered
                            </h4>

                            <div className="space-y-2">
                              {order.items && order.items.length > 0 ? (
                                order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-xs font-bold py-1.5 border-b border-accent/25 last:border-b-0">
                                    <div>
                                      <p className="text-primary font-semibold">{item.product_name || `Product ID ${item.product_id}`}</p>
                                      <p className="text-[10px] text-primary/40 font-medium">
                                        Qty: {item.quantity} · Price: ₹{item.price}
                                      </p>
                                    </div>
                                    <span className="text-primary">₹{parseFloat(item.price) * item.quantity}</span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-primary/40 italic">No item details loaded</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrders;
