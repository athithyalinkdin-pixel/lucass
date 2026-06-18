import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Check, AlertCircle, Edit, Trash2, X } from 'lucide-react';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageHelper';
import AdminNav from '../../components/AdminNav';

// Blog Form Modal Component
const BlogEditModal = ({ post, onClose, onSave }) => {
  const defaultFormState = {
    title: '',
    content: '',
    featured_image: '',
    is_published: false,
  };

  const [formData, setFormData] = useState(post || defaultFormState);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isEdit = !!post?.id;

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);
    setUploading(true);
    setErrorMessage('');

    try {
      const { data: uploadData } = await api.post('/admin/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      handleFieldChange('featured_image', uploadData.url);
    } catch (err) {
      setErrorMessage('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');

    try {
      if (isEdit) {
        await api.put(`/admin/blog/${post.id}`, formData);
      } else {
        await api.post('/admin/blog', formData);
      }
      onSave();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-primary/50 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2rem] p-8 w-full max-w-3xl my-8 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-primary font-serif">
            {isEdit ? 'Edit Blog Post' : 'New Blog Post'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-accent/30 text-primary/50 hover:text-primary transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <label className="block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5">Post Title *</label>
            <input
              required
              className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-sm"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="e.g. 5 Ayurvedic Tips for Blood Sugar Control"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5">Featured Image *</label>
            {formData.featured_image ? (
              <div className="relative group rounded-2xl overflow-hidden border border-accent aspect-video max-h-40 bg-bg-off-white flex items-center justify-center p-2">
                <img src={getImageUrl(formData.featured_image)} className="h-full object-contain rounded-xl" alt="Blog Preview" />
                <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <label className="bg-white text-primary px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-accent transition-colors">
                    Change
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('featured_image', '')}
                    className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-accent hover:border-secondary rounded-2xl aspect-video max-h-40 cursor-pointer bg-bg-off-white/45 transition-colors p-4">
                <div className="flex flex-col items-center text-center">
                  <span className="text-2xl mb-1 text-primary/45">📷</span>
                  <span className="text-xs font-extrabold text-primary/70">{uploading ? 'Uploading...' : 'Upload Featured Image'}</span>
                  <span className="text-[9px] font-bold text-primary/40 mt-1">PNG, JPG, WebP</span>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5">Content * (Supports HTML or plain paragraphs)</label>
            <textarea
              required
              rows={12}
              className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-xs leading-relaxed font-mono"
              value={formData.content}
              onChange={(e) => handleFieldChange('content', e.target.value)}
              placeholder="Write your blog post here. You can use plain paragraphs. Press Enter for new lines."
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.is_published}
                onChange={(e) => handleFieldChange('is_published', e.target.checked)}
              />
              <div className="w-11 h-6 bg-accent rounded-full peer peer-checked:bg-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
            <div>
              <p className="text-sm font-bold text-primary">
                {formData.is_published ? 'Published — Visible to all visitors' : 'Draft — Hidden from public'}
              </p>
              <p className="text-xs text-primary/50 font-semibold">
                Toggle to make this post live on the blog page.
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-accent">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-accent rounded-xl font-bold text-primary hover:bg-accent/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-primary py-3 font-bold text-white bg-primary rounded-xl"
            >
              {saving ? 'Saving...' : isEdit ? 'Update Post' : 'Create Post'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Main ManageBlog Page Component
const ManageBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState(null); // 'add', edit blog post, or null

  const fetchBlogs = async () => {
    try {
      const { data } = await api.get('/admin/blog');
      setBlogs(data || []);
    } catch (err) {
      console.error('Error fetching blog list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (postId) => {
    if (window.confirm('Permanently delete this blog post?')) {
      try {
        await api.delete(`/admin/blog/${postId}`);
        fetchBlogs();
      } catch (err) {
        alert('Error deleting post');
      }
    }
  };

  const publishedCount = blogs.filter((b) => b.is_published).length;
  const draftCount = blogs.filter((b) => !b.is_published).length;

  return (
    <div className="pt-32 pb-24 min-h-screen bg-bg-off-white">
      <Helmet>
        <title>Blog Management | Lucas Agro</title>
      </Helmet>

      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Admin Navigation Tabs */}
        <AdminNav />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 text-left">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1 font-serif">Blog Management</h1>
            <p className="text-primary/50 text-sm font-semibold">
              {publishedCount} published · {draftCount} drafts
            </p>
          </div>
          <button
            onClick={() => setModalState('add')}
            className="btn-primary flex items-center gap-2 font-bold"
          >
            <Plus size={18} />
            <span>New Post</span>
          </button>
        </div>

        {/* Blog Posts List */}
        {loading ? (
          <div className="p-12 text-center text-primary/50 font-bold">Loading posts...</div>
        ) : blogs.length === 0 ? (
          <div className="glass-card p-16 text-center border border-accent/20">
            <FileText size={48} className="mx-auto text-primary/10 mb-4" />
            <p className="text-primary/50 font-bold mb-6">No blog posts yet. Create your first one!</p>
            <button
              onClick={() => setModalState('add')}
              className="btn-primary inline-flex items-center gap-2 font-bold"
            >
              <Plus size={18} />
              <span>New Post</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-4 text-left">
            {blogs.map((blog) => (
              <motion.div
                layout
                key={blog.id}
                className="glass-card p-6 flex items-center gap-6 border border-accent/20 bg-white"
              >
                {blog.featured_image ? (
                  <img
                    src={getImageUrl(blog.featured_image)}
                    alt={blog.title}
                    className="w-20 h-16 rounded-xl object-cover border border-accent flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-16 rounded-xl bg-accent/30 flex items-center justify-center flex-shrink-0 border border-accent">
                    <FileText size={24} className="text-primary/20" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-primary truncate text-base">{blog.title}</p>
                  <p className="text-xs text-primary/40 mt-1 font-semibold">
                    {new Date(blog.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {blog.is_published ? (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-3 py-1 rounded-full">
                      Live
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-yellow-600 text-xs font-bold bg-yellow-50 px-3 py-1 rounded-full">
                      Draft
                    </span>
                  )}
                  <button
                    onClick={() => setModalState(blog)}
                    className="p-2 rounded-lg hover:bg-secondary/10 text-primary/40 hover:text-secondary transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-primary/40 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Form Modal */}
        <AnimatePresence>
          {modalState && (
            <BlogEditModal
              post={modalState === 'add' ? null : modalState}
              onClose={() => setModalState(null)}
              onSave={() => {
                setModalState(null);
                fetchBlogs();
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ManageBlog;
