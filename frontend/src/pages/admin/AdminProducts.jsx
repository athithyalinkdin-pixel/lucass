import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Search, Edit2, Trash2, X, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';

const EMPTY_PRODUCT = {
  name: '', price: '', original_price: '', stock: '', description: '',
  ingredients: '', benefits: '', offers: '', image_url: '', subtitle: '', 
  rating: '4.5', tag: '', category_id: '1', is_active: true,
};

const inputCls = 'w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-sm';
const labelCls = 'block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5';

const ProductModal = ({ product, categories, onClose, onSave }) => {
  const [form, setForm] = useState(product || EMPTY_PRODUCT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const isEdit = Boolean(product?.id);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

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
      set('image_url', data.url);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await api.put(`/admin/products/${product.id}`, form);
      } else {
        await api.post('/admin/products', form);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
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
          <h3 className="text-2xl font-bold text-primary">{isEdit ? 'Edit Product' : 'Add New Product'}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-accent/30 text-primary/50 hover:text-primary transition-colors"><X size={22} /></button>
        </div>

        {error && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
          {/* Name */}
          <div className="col-span-2">
            <label className={labelCls}>Product Name *</label>
            <input required className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Avaram Poo Plus" />
          </div>

          {/* Price + Original Price */}
          <div>
            <label className={labelCls}>Selling Price (₹) *</label>
            <input required type="number" step="0.01" min="0" className={inputCls} value={form.price} onChange={e => set('price', e.target.value)} placeholder="599" />
          </div>
          <div>
            <label className={labelCls}>Original Price (₹) – for strike-through</label>
            <input type="number" step="0.01" min="0" className={inputCls} value={form.original_price} onChange={e => set('original_price', e.target.value)} placeholder="799" />
          </div>

          {/* Stock + Category */}
          <div>
            <label className={labelCls}>Stock Quantity *</label>
            <input required type="number" min="0" className={inputCls} value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="100" />
          </div>
          <div>
            <label className={labelCls}>Category *</label>
            <select required className={inputCls} value={form.category_id} onChange={e => set('category_id', e.target.value)}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Subtitle + Tag */}
          <div>
            <label className={labelCls}>Subtitle (Tagline)</label>
            <input className={inputCls} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="e.g. Sip & Slim" />
          </div>
          <div>
            <label className={labelCls}>Tag (Badge)</label>
            <input className={inputCls} value={form.tag} onChange={e => set('tag', e.target.value)} placeholder="e.g. Sale, Trending" />
          </div>

          {/* Image Upload + Rating */}
          <div className="col-span-1">
            <label className={labelCls}>Product Image</label>
            <div className="flex flex-col gap-3">
              {form.image_url && (
                <img src={form.image_url} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-accent shadow-sm" />
              )}
              <label className="flex items-center justify-center px-4 py-3 bg-secondary/10 text-secondary border border-secondary/20 rounded-xl cursor-pointer hover:bg-secondary/20 transition-colors text-sm font-bold w-full text-center">
                {uploading ? 'Uploading...' : 'Upload Image from Computer'}
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </div>
          </div>
          <div className="col-span-1">
            <label className={labelCls}>Rating (1-5)</label>
            <input type="number" step="0.1" min="1" max="5" className={inputCls} value={form.rating} onChange={e => set('rating', e.target.value)} placeholder="4.5" />
          </div>

          {/* Description */}
          <div className="col-span-2">
            <label className={labelCls}>Description *</label>
            <textarea required rows={3} className={inputCls} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief product overview..." />
          </div>

          {/* Ingredients */}
          <div className="col-span-2">
            <label className={labelCls}>Ingredients</label>
            <textarea rows={2} className={inputCls} value={form.ingredients} onChange={e => set('ingredients', e.target.value)} placeholder="e.g. Avaram Poo, Neem, Turmeric..." />
          </div>

          {/* Benefits */}
          <div className="col-span-2">
            <label className={labelCls}>Key Benefits (one per line)</label>
            <textarea rows={3} className={inputCls} value={form.benefits} onChange={e => set('benefits', e.target.value)} placeholder="Supports healthy blood sugar&#10;Rich in antioxidants&#10;100% Natural" />
          </div>

          {/* Offers */}
          <div className="col-span-2">
            <label className={labelCls}>Offers / Combo Details</label>
            <textarea rows={2} className={inputCls} value={form.offers} onChange={e => set('offers', e.target.value)} placeholder="e.g. Buy 2 Get 1 Free, Free shipping above ₹500" />
          </div>

          {/* Active Toggle */}
          <div className="col-span-2 flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} />
              <div className="w-11 h-6 bg-accent rounded-full peer peer-checked:bg-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <span className="text-sm font-bold text-primary">{form.is_active ? 'Product is Active (Visible in shop)' : 'Product is Inactive (Hidden from shop)'}</span>
          </div>

          {/* Actions */}
          <div className="col-span-2 flex gap-4 pt-4 border-t border-accent">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-accent rounded-xl font-bold text-primary hover:bg-accent/20 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary py-3">
              {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const AdminProducts = () => {
  const [products, setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState(null); // null | 'add' | product-object

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      const [{ data: prods }, { data: cats }] = await Promise.all([
        api.get('/admin/products'),
        api.get('/products/categories'),
      ]);
      setProducts(prods);
      setCategories(cats.length ? cats : [{ id: 1, name: 'General' }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      fetchAll();
    } catch {
      alert('Error deleting product');
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-32 pb-24 px-6 md:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">Product Management</h1>
          <p className="text-primary/50 text-sm">{products.length} products total</p>
        </div>
        <button onClick={() => setModal('add')} className="btn-primary flex items-center gap-2">
          <Plus size={18} /><span>Add New Product</span>
        </button>
      </div>

      {/* Search */}
      <div className="glass-card overflow-hidden mb-6">
        <div className="p-4 border-b border-accent flex items-center gap-3">
          <Search size={18} className="text-primary/30" />
          <input
            type="text"
            placeholder="Search products by name..."
            className="flex-1 bg-transparent outline-none text-sm text-primary"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-primary/50">Loading products...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-primary/50">No products found.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-primary/5 text-left">
                  {['Product', 'Price', 'Stock', 'Category', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-xs font-bold text-primary/40 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-accent">
                {filtered.map(p => (
                  <motion.tr key={p.id} layout className="hover:bg-bg-off-white transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {p.image_url
                          ? <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-accent" />
                          : <div className="w-10 h-10 bg-accent/30 rounded-lg flex items-center justify-center text-secondary/50"><Package size={18} /></div>
                        }
                        <div>
                          <p className="font-bold text-primary text-sm">{p.name}</p>
                          <p className="text-xs text-primary/40">/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-primary">₹{p.price}</p>
                      {p.original_price && <p className="text-xs text-primary/40 line-through">₹{p.original_price}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-bold ${p.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>{p.stock}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-primary/60">{p.category_name || '—'}</td>
                    <td className="px-5 py-4">
                      {p.is_active
                        ? <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><CheckCircle size={14} />Active</span>
                        : <span className="flex items-center gap-1 text-red-500 text-xs font-bold"><XCircle size={14} />Inactive</span>
                      }
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setModal(p)} className="p-2 rounded-lg hover:bg-secondary/10 text-primary/40 hover:text-secondary transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-50 text-primary/40 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <ProductModal
            product={modal === 'add' ? null : modal}
            categories={categories}
            onClose={() => setModal(null)}
            onSave={() => { setModal(null); fetchAll(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
