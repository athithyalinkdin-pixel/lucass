import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, ArrowLeft, Search, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AdminNav from '../../components/AdminNav';

const ManageRoles = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (userId === currentUser?.id) {
      setErrorMessage('You cannot change your own role to prevent lockout.');
      return;
    }

    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setSuccessMessage('User role updated successfully.');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser?.id) {
      setErrorMessage('You cannot delete your own account.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user? This action is permanent.')) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setSuccessMessage('User deleted successfully.');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-32 pb-24 min-h-screen bg-bg-off-white">
      <Helmet>
        <title>Manage User Roles | Lucas Agro</title>
      </Helmet>

      <div className="p-8 max-w-7xl mx-auto">
        {/* Admin Navigation Tabs */}
        <AdminNav />

        {/* Back Link */}
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-primary/60 hover:text-primary font-bold text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>

        {/* Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-primary font-serif flex items-center gap-3">
              <Users className="text-secondary" />
              Manage User Roles
            </h1>
            <p className="text-primary/60 text-sm">
              Control permissions, promote users to admin, or terminate accounts.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full bg-white border border-accent rounded-full py-2.5 pl-12 pr-6 focus:outline-none focus:border-secondary transition-colors text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-200 text-sm font-semibold flex justify-between items-center"
            >
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage('')} className="text-red-400 hover:text-red-600">
                ✕
              </button>
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-50 text-green-700 rounded-2xl border border-green-200 text-sm font-semibold flex justify-between items-center"
            >
              <span>{successMessage}</span>
              <button onClick={() => setSuccessMessage('')} className="text-green-500 hover:text-green-700">
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Users Table */}
        <div className="glass-card p-8 border border-accent/20 overflow-hidden">
          {loading ? (
            <div className="text-center py-20 text-primary font-bold animate-pulse">
              Loading Users List...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20 text-primary/40 font-bold">
              No users found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-accent">
                    <th className="pb-4 text-xs font-bold text-primary/40 uppercase tracking-widest">User ID</th>
                    <th className="pb-4 text-xs font-bold text-primary/40 uppercase tracking-widest">Name</th>
                    <th className="pb-4 text-xs font-bold text-primary/40 uppercase tracking-widest">Email</th>
                    <th className="pb-4 text-xs font-bold text-primary/40 uppercase tracking-widest">Phone</th>
                    <th className="pb-4 text-xs font-bold text-primary/40 uppercase tracking-widest">Role</th>
                    <th className="pb-4 text-xs font-bold text-primary/40 uppercase tracking-widest">Joined Date</th>
                    <th className="pb-4 text-xs font-bold text-primary/40 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-accent">
                  {filteredUsers.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    return (
                      <tr key={u.id} className="group hover:bg-bg-off-white/40 transition-colors">
                        <td className="py-5 text-sm font-semibold text-primary">#{u.id}</td>
                        <td className="py-5 text-sm font-bold text-primary flex items-center gap-2">
                          {u.name} {isSelf && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">You</span>}
                        </td>
                        <td className="py-5 text-sm text-primary/70">{u.email}</td>
                        <td className="py-5 text-sm text-primary/60">{u.phone || 'N/A'}</td>
                        <td className="py-5 text-sm">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                              u.role === 'admin'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-primary/5 text-primary/70 border-primary/10'
                            }`}
                          >
                            {u.role === 'admin' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                            {u.role}
                          </span>
                        </td>
                        <td className="py-5 text-sm text-primary/50">
                          {new Date(u.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-5 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              disabled={isSelf}
                              onClick={() => handleRoleToggle(u.id, u.role)}
                              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                                isSelf
                                  ? 'opacity-30 cursor-not-allowed border-accent text-primary/30'
                                  : u.role === 'admin'
                                  ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                                  : 'border-primary/20 text-primary/80 hover:bg-primary/5'
                              }`}
                              title={isSelf ? 'Cannot change your own role' : `Toggle to ${u.role === 'admin' ? 'user' : 'admin'}`}
                            >
                              <Shield size={14} />
                              <span>{u.role === 'admin' ? 'Demote' : 'Promote'}</span>
                            </button>

                            <button
                              disabled={isSelf}
                              onClick={() => handleDeleteUser(u.id)}
                              className={`p-2 rounded-xl border transition-all ${
                                isSelf
                                  ? 'opacity-30 cursor-not-allowed border-accent text-primary/30'
                                  : 'border-red-100 text-red-500 hover:bg-red-50'
                              }`}
                              title={isSelf ? 'Cannot delete your own account' : 'Delete user'}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageRoles;
