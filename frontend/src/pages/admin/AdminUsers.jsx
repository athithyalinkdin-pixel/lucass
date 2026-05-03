import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, ArrowLeft, Loader, CheckCircle, AlertCircle, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const inputCls = 'w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-sm';
const labelCls = 'block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5';

const CreateUserModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/admin/users', form);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl"
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-primary">Create New User</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-accent/30 text-primary/50 hover:text-primary transition-colors"><X size={22} /></button>
        </div>

        {error && <div className="mb-5 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelCls}>Name</label>
            <input required className={inputCls} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input required type="email" className={inputCls} value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@example.com" />
          </div>
          <div>
            <label className={labelCls}>Password</label>
            <input required type="password" minLength={6} className={inputCls} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Minimum 6 characters" />
          </div>
          <div>
            <label className={labelCls}>Role</label>
            <select className={inputCls} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="user">User (Customer)</option>
              <option value="admin">Admin (Dashboard Access)</option>
            </select>
          </div>
          
          <div className="flex gap-4 pt-4 border-t border-accent">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-accent rounded-xl font-bold text-primary hover:bg-accent/20 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary py-3">
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingId(userId);
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex justify-center items-center">
        <Loader className="animate-spin text-secondary" size={48} />
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 md:px-8 max-w-7xl mx-auto min-h-screen">
      <Helmet>
        <title>Manage Users | Admin Panel</title>
      </Helmet>

      <Link to="/admin" className="inline-flex items-center gap-2 text-primary/60 hover:text-secondary font-bold mb-8 transition-colors">
        <ArrowLeft size={20} /> Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">User Management</h1>
          <p className="text-primary/50 text-sm">{users.length} registered users</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /><span>Add New User</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 mb-8">
          <AlertCircle size={20} />
          <span className="font-bold">{error}</span>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-accent/20 bg-bg-off-white">
                <th className="p-4 text-xs font-bold text-primary/40 uppercase tracking-widest">ID</th>
                <th className="p-4 text-xs font-bold text-primary/40 uppercase tracking-widest">Name</th>
                <th className="p-4 text-xs font-bold text-primary/40 uppercase tracking-widest">Email</th>
                <th className="p-4 text-xs font-bold text-primary/40 uppercase tracking-widest">Role</th>
                <th className="p-4 text-xs font-bold text-primary/40 uppercase tracking-widest">Joined</th>
                <th className="p-4 text-xs font-bold text-primary/40 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent/10">
              {users.map((user) => (
                <motion.tr 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  key={user.id} 
                  className="hover:bg-bg-off-white transition-colors"
                >
                  <td className="p-4 font-medium text-primary">#{user.id}</td>
                  <td className="p-4 font-bold text-primary">{user.name}</td>
                  <td className="p-4 text-primary/70">{user.email}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                      user.role === 'admin' ? 'bg-secondary/20 text-secondary' : 'bg-primary/5 text-primary/60'
                    }`}>
                      {user.role === 'admin' && <Shield size={12} />}
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-primary/60">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={updatingId === user.id}
                      className="bg-white border border-accent/30 text-primary text-sm rounded-lg focus:ring-secondary focus:border-secondary p-2 cursor-pointer disabled:opacity-50"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && !loading && (
            <div className="p-12 text-center text-primary/40 font-medium">
              No users found.
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <CreateUserModal
            onClose={() => setIsModalOpen(false)}
            onSave={() => { setIsModalOpen(false); fetchUsers(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;
