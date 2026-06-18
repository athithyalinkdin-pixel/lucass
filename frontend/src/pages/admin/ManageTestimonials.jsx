import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Star, Edit, Trash2, X, Film } from 'lucide-react';
import api from '../../services/api';
import AdminNav from '../../components/AdminNav';
import { getImageUrl } from '../../utils/imageHelper';

// Testimonial Form Modal Component
const TestimonialEditModal = ({ testimonial, onClose, onSave }) => {
  const defaultFormState = {
    customer_name: '',
    video_url: '',
    rating: 5,
    caption: '',
    is_active: true,
  };

  const [formData, setFormData] = useState(
    testimonial
      ? {
          ...defaultFormState,
          ...testimonial,
          is_active: testimonial.is_active === 1 || testimonial.is_active === true || testimonial.is_active === 'true',
        }
      : defaultFormState
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isEdit = !!testimonial?.id;

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = async (e) => {
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
      handleFieldChange('video_url', uploadData.url);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to upload media file');
    } finally {
      setUploading(false);
    }
  };

  const renderMediaPreview = () => {
    const url = formData.video_url;
    if (!url) return null;

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let embedUrl = url;
      if (url.includes('watch?v=')) {
        const vidId = url.split('v=')[1]?.split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${vidId}`;
      } else if (url.includes('youtu.be/')) {
        const vidId = url.split('youtu.be/')[1]?.split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${vidId}`;
      }
      return (
        <iframe src={embedUrl} className="w-full h-full" title="YouTube Preview" />
      );
    }

    const isVideo = /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(url) || url.includes('video');
    if (isVideo) {
      return (
        <video src={getImageUrl(url)} className="w-full h-full object-cover" controls />
      );
    }

    return (
      <img src={getImageUrl(url)} className="w-full h-full object-contain p-2" alt="Preview" />
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');

    try {
      if (isEdit) {
        await api.put(`/admin/testimonials/${testimonial.id}`, formData);
      } else {
        await api.post('/admin/testimonials', formData);
      }
      onSave();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to save testimonial');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/50 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl"
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-primary font-serif">
            {isEdit ? 'Edit Testimonial' : 'Add Testimonial'}
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
            <label className="block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5">Customer Name *</label>
            <input
              required
              className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-sm"
              value={formData.customer_name}
              onChange={(e) => handleFieldChange('customer_name', e.target.value)}
              placeholder="e.g. Priya Sharma"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5">Customer Media (Image or Video)</label>
            {formData.video_url ? (
              <div className="relative group rounded-2xl overflow-hidden border border-accent aspect-video max-h-44 bg-bg-off-white flex items-center justify-center">
                {renderMediaPreview()}
                <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10">
                  <label className="bg-white text-primary px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-accent transition-colors">
                    Change File
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('video_url', '')}
                    className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-accent hover:border-secondary rounded-2xl aspect-video max-h-36 cursor-pointer bg-bg-off-white/45 transition-colors p-4">
                  <div className="flex flex-col items-center text-center">
                    <span className="text-2xl mb-1 text-primary/45">🎥 / 📷</span>
                    <span className="text-xs font-extrabold text-primary/70">{uploading ? 'Uploading...' : 'Upload Image or Video'}</span>
                    <span className="text-[9px] font-bold text-primary/40 mt-1">Accepts PNG, JPG, MP4, WebM, etc.</span>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                  />
                </label>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-accent/40"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase font-extrabold">
                    <span className="bg-white px-3 text-primary/30 text-[9px] tracking-widest">Or link a YouTube Video</span>
                  </div>
                </div>

                <input
                  type="text"
                  className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-sm"
                  value={formData.video_url || ''}
                  onChange={(e) => handleFieldChange('video_url', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5">Caption / Short Review</label>
            <textarea
              rows={2}
              className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-sm"
              value={formData.caption || ''}
              onChange={(e) => handleFieldChange('caption', e.target.value)}
              placeholder="e.g. Noticed a visible difference in just 6 weeks!"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5 font-serif">Star Rating</label>
            <div className="flex gap-2 mt-1">
              {[1, 2, 3, 4, 5].map((starVal) => (
                <button
                  type="button"
                  key={starVal}
                  onClick={() => handleFieldChange('rating', starVal)}
                  className={`p-1 transition-transform hover:scale-110 ${
                    starVal <= formData.rating ? 'text-amber-400' : 'text-primary/20'
                  }`}
                >
                  <Star size={28} fill={starVal <= formData.rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.is_active}
                onChange={(e) => handleFieldChange('is_active', e.target.checked)}
              />
              <div className="w-11 h-6 bg-accent rounded-full peer peer-checked:bg-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
            <span className="text-sm font-bold text-primary">
              {formData.is_active ? 'Visible on homepage' : 'Hidden from homepage'}
            </span>
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
              {saving ? 'Saving...' : isEdit ? 'Update' : 'Add Testimonial'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Admin Media Renderer supporting multiple formats
const renderAdminMedia = (url, name) => {
  if (!url) {
    return (
      <div className="rounded-xl bg-accent/20 aspect-video flex items-center justify-center border border-accent">
        <Film size={36} className="text-primary/20" />
      </div>
    );
  }

  // Check if it is a YouTube link
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let embedUrl = url;
    if (url.includes('watch?v=')) {
      const vidId = url.split('v=')[1]?.split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${vidId}`;
    } else if (url.includes('youtu.be/')) {
      const vidId = url.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${vidId}`;
    }
    return (
      <div className="rounded-xl overflow-hidden bg-black aspect-video">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          title={name}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Check if it is a direct video link (mp4, webm, ogg, mov, m4v)
  const isVideo = /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(url) || url.includes('video');
  if (isVideo) {
    return (
      <div className="rounded-xl overflow-hidden bg-black aspect-video">
        <video
          src={getImageUrl(url)}
          controls
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Treat as image URL
  return (
    <div className="rounded-xl overflow-hidden bg-white aspect-video flex items-center justify-center border border-accent">
      <img
        src={getImageUrl(url, name)}
        alt={name}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800';
        }}
      />
    </div>
  );
};

// Rating Stars display
const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((starVal) => (
      <Star
        size={13}
        key={starVal}
        className={starVal <= rating ? 'text-amber-400' : 'text-primary/20'}
        fill={starVal <= rating ? 'currentColor' : 'none'}
      />
    ))}
  </div>
);

// Main ManageTestimonials Page Component
const ManageTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState(null); // 'add', edit testimonial, or null

  const fetchTestimonials = async () => {
    try {
      const { data } = await api.get('/admin/testimonials');
      setTestimonials(data || []);
    } catch (err) {
      console.error('Error fetching testimonials list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this testimonial?')) {
      try {
        await api.delete(`/admin/testimonials/${id}`);
        fetchTestimonials();
      } catch (err) {
        alert('Error deleting testimonial');
      }
    }
  };

  const activeCount = testimonials.filter((t) => t.is_active).length;
  const hiddenCount = testimonials.filter((t) => !t.is_active).length;

  return (
    <div className="pt-32 pb-24 min-h-screen bg-bg-off-white">
      <Helmet>
        <title>Testimonials Management | Lucas Agro</title>
      </Helmet>

      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Admin Navigation Tabs */}
        <AdminNav />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 text-left">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1 font-serif">Customer Testimonials</h1>
            <p className="text-primary/50 text-sm font-semibold">
              {activeCount} active · {hiddenCount} hidden
            </p>
          </div>
          <button
            onClick={() => setModalState('add')}
            className="btn-primary flex items-center gap-2 font-bold"
          >
            <Plus size={18} />
            <span>Add Testimonial</span>
          </button>
        </div>

        {/* Testimonials List */}
        {loading ? (
          <div className="p-12 text-center text-primary/50 font-bold">Loading...</div>
        ) : testimonials.length === 0 ? (
          <div className="glass-card p-16 text-center border border-accent/20">
            <Star size={48} className="mx-auto text-primary/10 mb-4" />
            <p className="text-primary/50 font-bold">No testimonials yet.</p>
            <button
              onClick={() => setModalState('add')}
              className="btn-primary mt-6 inline-flex items-center gap-2 font-bold"
            >
              <Plus size={18} />
              <span>Add First</span>
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 text-left">
            {testimonials.map((t) => (
              <motion.div
                layout
                key={t.id}
                className="glass-card p-6 flex flex-col gap-4 border border-accent/20 bg-white"
              >
                {/* Render customer media correctly based on its format */}
                {renderAdminMedia(t.video_url, t.customer_name)}

                {/* Info block */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-primary">{t.customer_name}</p>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        t.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {t.is_active ? 'Live' : 'Hidden'}
                    </span>
                  </div>
                  <StarRating rating={t.rating} />
                  {t.caption && (
                    <p className="text-xs text-primary/60 mt-2 italic font-semibold">
                      "{t.caption}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-accent">
                  <button
                    onClick={() => setModalState(t)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl hover:bg-secondary/10 text-primary/50 hover:text-secondary transition-colors text-sm font-bold border border-accent/35"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl hover:bg-red-50 text-primary/50 hover:text-red-500 transition-colors text-sm font-bold border border-accent/35"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Form Modal */}
        <AnimatePresence>
          {modalState && (
            <TestimonialEditModal
              testimonial={modalState === 'add' ? null : modalState}
              onClose={() => setModalState(null)}
              onSave={() => {
                setModalState(null);
                fetchTestimonials();
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ManageTestimonials;
