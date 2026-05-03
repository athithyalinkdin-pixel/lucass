import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, Edit2, Trash2, X, Video } from 'lucide-react';
import api from '../../services/api';

const EMPTY = { customer_name: '', video_url: '', rating: 5, caption: '', is_active: true };
const inputCls = 'w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-sm';
const labelCls = 'block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5';

const TestimonialModal = ({ testimonial, onClose, onSave }) => {
  const [form, setForm] = useState(testimonial || EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEdit = Boolean(testimonial?.id);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await api.put(`/admin/testimonials/${testimonial.id}`, form);
      } else {
        await api.post('/admin/testimonials', form);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save testimonial');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl"
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-primary">{isEdit ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-accent/30 text-primary/50 hover:text-primary transition-colors"><X size={22} /></button>
        </div>

        {error && <div className="mb-5 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelCls}>Customer Name *</label>
            <input required className={inputCls} value={form.customer_name} onChange={e => set('customer_name', e.target.value)} placeholder="e.g. Priya Sharma" />
          </div>

          <div>
            <label className={labelCls}>Video URL (YouTube Embed or Direct Link)</label>
            <input type="url" className={inputCls} value={form.video_url} onChange={e => set('video_url', e.target.value)} placeholder="https://www.youtube.com/embed/VIDEO_ID" />
            <p className="text-xs text-primary/40 mt-1">For YouTube: use the embed URL format: <code>https://www.youtube.com/embed/VIDEO_ID</code></p>
          </div>

          <div>
            <label className={labelCls}>Caption / Short Review</label>
            <textarea rows={2} className={inputCls} value={form.caption} onChange={e => set('caption', e.target.value)} placeholder="e.g. Noticed a visible difference in just 6 weeks!" />
          </div>

          {/* Star Rating */}
          <div>
            <label className={labelCls}>Star Rating</label>
            <div className="flex gap-2 mt-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => set('rating', n)} className={`p-1 transition-transform hover:scale-110 ${n <= form.rating ? 'text-amber-400' : 'text-primary/20'}`}>
                  <Star size={28} fill={n <= form.rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} />
              <div className="w-11 h-6 bg-accent rounded-full peer peer-checked:bg-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <span className="text-sm font-bold text-primary">{form.is_active ? 'Visible on homepage' : 'Hidden from homepage'}</span>
          </div>

          <div className="flex gap-4 pt-4 border-t border-accent">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-accent rounded-xl font-bold text-primary hover:bg-accent/20 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary py-3">
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Add Testimonial'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const StarDisplay = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(n => (
      <Star key={n} size={13} className={n <= rating ? 'text-amber-400' : 'text-primary/20'} fill={n <= rating ? 'currentColor' : 'none'} />
    ))}
  </div>
);

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      const { data } = await api.get('/admin/testimonials');
      setTestimonials(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await api.delete(`/admin/testimonials/${id}`);
      fetchAll();
    } catch {
      alert('Error deleting testimonial');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">Customer Testimonials</h1>
          <p className="text-primary/50 text-sm">{testimonials.filter(t => t.is_active).length} active · {testimonials.filter(t => !t.is_active).length} hidden</p>
        </div>
        <button onClick={() => setModal('add')} className="btn-primary flex items-center gap-2">
          <Plus size={18} /><span>Add Testimonial</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-primary/50">Loading...</div>
      ) : testimonials.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Star size={48} className="mx-auto text-primary/10 mb-4" />
          <p className="text-primary/50">No testimonials yet.</p>
          <button onClick={() => setModal('add')} className="btn-primary mt-6 inline-flex items-center gap-2"><Plus size={18} />Add First</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <motion.div key={t.id} layout className="glass-card p-6 flex flex-col gap-4">
              {/* Video preview */}
              {t.video_url && (
                <div className="rounded-xl overflow-hidden bg-black aspect-video">
                  <iframe
                    src={t.video_url}
                    className="w-full h-full"
                    title={t.customer_name}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              {!t.video_url && (
                <div className="rounded-xl bg-accent/20 aspect-video flex items-center justify-center">
                  <Video size={36} className="text-primary/20" />
                </div>
              )}

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-primary">{t.customer_name}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {t.is_active ? 'Live' : 'Hidden'}
                  </span>
                </div>
                <StarDisplay rating={t.rating} />
                {t.caption && <p className="text-xs text-primary/60 mt-2 italic">"{t.caption}"</p>}
              </div>

              <div className="flex gap-2 pt-2 border-t border-accent">
                <button onClick={() => setModal(t)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl hover:bg-secondary/10 text-primary/50 hover:text-secondary transition-colors text-sm font-bold">
                  <Edit2 size={14} />Edit
                </button>
                <button onClick={() => handleDelete(t.id)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl hover:bg-red-50 text-primary/50 hover:text-red-500 transition-colors text-sm font-bold">
                  <Trash2 size={14} />Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <TestimonialModal
            testimonial={modal === 'add' ? null : modal}
            onClose={() => setModal(null)}
            onSave={() => { setModal(null); fetchAll(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTestimonials;
