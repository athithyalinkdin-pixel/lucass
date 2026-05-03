import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';

const EMPTY_POST = { title: '', content: '', featured_image: '', is_published: false };
const inputCls = 'w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-sm';
const labelCls = 'block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5';

const BlogModal = ({ post, onClose, onSave }) => {
  const [form, setForm] = useState(post || EMPTY_POST);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const isEdit = Boolean(post?.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await api.put(`/admin/blog/${post.id}`, form);
      } else {
        await api.post('/admin/blog', form);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const { data } = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(f => ({ ...f, featured_image: data.url }));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-primary/50 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] p-8 w-full max-w-3xl my-8 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-primary">{isEdit ? 'Edit Blog Post' : 'New Blog Post'}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-accent/30 text-primary/50 hover:text-primary transition-colors"><X size={22} /></button>
        </div>

        {error && <div className="mb-5 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelCls}>Post Title *</label>
            <input required className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. 5 Ayurvedic Tips for Blood Sugar Control" />
          </div>

          <div className="col-span-1">
            <label className={labelCls}>Featured Image</label>
            <div className="flex flex-col gap-3">
              {form.featured_image && (
                <img src={form.featured_image} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-accent shadow-sm" />
              )}
              <label className="flex items-center justify-center px-4 py-3 bg-secondary/10 text-secondary border border-secondary/20 rounded-xl cursor-pointer hover:bg-secondary/20 transition-colors text-sm font-bold w-full text-center">
                {uploading ? 'Uploading...' : 'Upload Image from Computer'}
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </div>
          </div>

          <div>
            <label className={labelCls}>Content * (Write in plain text or basic HTML)</label>
            <textarea
              required
              rows={12}
              className={`${inputCls} font-mono text-xs leading-relaxed`}
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Write your blog post here. You can use plain paragraphs. Press Enter for new lines."
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
              <div className="w-11 h-6 bg-accent rounded-full peer peer-checked:bg-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <div>
              <p className="text-sm font-bold text-primary">{form.is_published ? 'Published — Visible to all visitors' : 'Draft — Hidden from public'}</p>
              <p className="text-xs text-primary/50">Toggle to make this post live on the blog page.</p>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-accent">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-accent rounded-xl font-bold text-primary hover:bg-accent/20 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary py-3">
              {loading ? 'Saving...' : isEdit ? 'Update Post' : 'Create Post'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const AdminBlog = () => {
  const [posts, setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(null); // null | 'add' | post-object

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    try {
      const { data } = await api.get('/admin/blog');
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this blog post?')) return;
    try {
      await api.delete(`/admin/blog/${id}`);
      fetchPosts();
    } catch {
      alert('Error deleting post');
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 md:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">Blog Management</h1>
          <p className="text-primary/50 text-sm">{posts.filter(p => p.is_published).length} published · {posts.filter(p => !p.is_published).length} drafts</p>
        </div>
        <button onClick={() => setModal('add')} className="btn-primary flex items-center gap-2">
          <Plus size={18} /><span>New Post</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-primary/50">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <FileText size={48} className="mx-auto text-primary/10 mb-4" />
          <p className="text-primary/50">No blog posts yet. Create your first one!</p>
          <button onClick={() => setModal('add')} className="btn-primary mt-6 inline-flex items-center gap-2"><Plus size={18} />New Post</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map(post => (
            <motion.div key={post.id} layout className="glass-card p-6 flex items-center gap-6">
              {post.featured_image
                ? <img src={post.featured_image} alt={post.title} className="w-20 h-16 rounded-xl object-cover border border-accent flex-shrink-0" />
                : <div className="w-20 h-16 rounded-xl bg-accent/30 flex items-center justify-center flex-shrink-0"><FileText size={24} className="text-primary/20" /></div>
              }
              <div className="flex-1 min-w-0">
                <p className="font-bold text-primary truncate">{post.title}</p>
                <p className="text-xs text-primary/40 mt-1">{new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {post.is_published
                  ? <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-3 py-1 rounded-full"><Eye size={12} />Live</span>
                  : <span className="flex items-center gap-1 text-yellow-600 text-xs font-bold bg-yellow-50 px-3 py-1 rounded-full"><EyeOff size={12} />Draft</span>
                }
                <button onClick={() => setModal(post)} className="p-2 rounded-lg hover:bg-secondary/10 text-primary/40 hover:text-secondary transition-colors"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(post.id)} className="p-2 rounded-lg hover:bg-red-50 text-primary/40 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <BlogModal
            post={modal === 'add' ? null : modal}
            onClose={() => setModal(null)}
            onSave={() => { setModal(null); fetchPosts(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBlog;
