import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Package, Check, XCircle, Edit, Trash2, X } from 'lucide-react';
import api from '../../services/api';

// Product Form Modal Component
const ProductEditModal = ({ product, categories, onClose, onSave }) => {
  const defaultFormState = {
    name: '',
    price: '',
    original_price: '',
    stock: '',
    description: '',
    ingredients: '',
    benefits: '',
    offers: '',
    image_url: '',
    subtitle: '',
    rating: '4.5',
    tag: '',
    category_id: categories[0]?.id || '1',
    is_active: true,
    is_featured: false,
  };

  const [formData, setFormData] = useState(
    product
      ? {
          ...defaultFormState,
          ...product,
          is_active: product.is_active === 1 || product.is_active === true || product.is_active === 'true',
          is_featured: product.is_featured === 1 || product.is_featured === true || product.is_featured === 'true',
        }
      : defaultFormState
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isEdit = !!product?.id;

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
      handleFieldChange('image_url', uploadData.url);
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
        await api.put(`/admin/products/${product.id}`, formData);
      } else {
        await api.post('/admin/products', formData);
      }
      onSave();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to save product');
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
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-accent/30 text-primary/50 hover:text-primary transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5 text-left">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5">Product Name *</label>
            <input
              required
              className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-sm"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="e.g. Avaram Poo Plus"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5">Selling Price (₹) *</label>
            <input
              required
              type="number"
              step="0.01"
              min="0"
              className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-sm"
              value={formData.price}
              onChange={(e) => handleFieldChange('price', e.target.value)}
              placeholder="1099"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5">Original Price (₹) – for strike-through</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-sm"
              value={formData.original_price || ''}
              onChange={(e) => handleFieldChange('original_price', e.target.value)}
              placeholder="1299"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5">Stock Quantity *</label>
            <input
              required
              type="number"
              min="0"
              className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-sm"
              value={formData.stock}
              onChange={(e) => handleFieldChange('stock', e.target.value)}
              placeholder="100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5">Category *</label>
            <select
              required
              className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-sm cursor-pointer"
              value={formData.category_id}
              onChange={(e) => handleFieldChange('category_id', e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5">Subtitle (Tagline)</label>
            <input
              className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-sm"
              value={formData.subtitle || ''}
              onChange={(e) => handleFieldChange('subtitle', e.target.value)}
              placeholder="e.g. Sip & Slim"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5">Tag (Badge)</label>
            <input
              className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-sm"
              value={formData.tag || ''}
              onChange={(e) => handleFieldChange('tag', e.target.value)}
              placeholder="e.g. Sale, Trending"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5">Product Image *</label>
            {formData.image_url ? (
              <div className="relative group rounded-2xl overflow-hidden border border-accent aspect-square max-h-36 bg-bg-off-white flex items-center justify-center p-2">
                <img src={formData.image_url} className="h-full object-contain rounded-lg" alt="Product Preview" />
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
                    onClick={() => handleFieldChange('image_url', '')}
                    className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-accent hover:border-secondary rounded-2xl aspect-square max-h-36 cursor-pointer bg-bg-off-white/45 transition-colors p-4">
                <div className="flex flex-col items-center text-center">
                  <span className="text-2xl mb-1 text-primary/45">📷</span>
                  <span className="text-xs font-extrabold text-primary/70">{uploading ? 'Uploading...' : 'Upload Image'}</span>
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

          <div className="col-span-1">
            <label className="block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5">Rating (1-5)</label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="5"
              className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-sm"
              value={formData.rating || '4.5'}
              onChange={(e) => handleFieldChange('rating', e.target.value)}
              placeholder="4.5"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5">Description *</label>
            <textarea
              required
              rows={3}
              className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-sm"
              value={formData.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Brief product overview..."
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5">Ingredients</label>
            <textarea
              rows={2}
              className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-sm"
              value={formData.ingredients || ''}
              onChange={(e) => handleFieldChange('ingredients', e.target.value)}
              placeholder="e.g. Avaram Poo, Neem, Turmeric..."
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5">Key Benefits (one per line)</label>
            <textarea
              rows={3}
              className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-sm"
              value={formData.benefits || ''}
              onChange={(e) => handleFieldChange('benefits', e.target.value)}
              placeholder="Supports healthy blood sugar&#10;Rich in antioxidants&#10;100% Natural"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-bold text-primary/50 uppercase tracking-wider mb-1.5">Offers / Combo Details</label>
            <textarea
              rows={2}
              className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-sm"
              value={formData.offers || ''}
              onChange={(e) => handleFieldChange('offers', e.target.value)}
              placeholder="e.g. Buy 2 Get 1 Free, Free shipping above ₹500"
            />
          </div>

          <div className="col-span-1 flex items-center gap-3">
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
              {formData.is_active ? 'Active (Shop Visible)' : 'Inactive (Hidden)'}
            </span>
          </div>

          <div className="col-span-1 flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.is_featured}
                onChange={(e) => handleFieldChange('is_featured', e.target.checked)}
              />
              <div className="w-11 h-6 bg-accent rounded-full peer peer-checked:bg-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
            <span className="text-sm font-bold text-primary">
              {formData.is_featured ? 'Featured (Homepage)' : 'Regular Product'}
            </span>
          </div>

          <div className="col-span-2 flex gap-4 pt-4 border-t border-accent">
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
              {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Main ManageProducts Page Component
const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalState, setModalState] = useState(null); // 'add', edit product, or null

  const fetchProducts = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/admin/products'),
        api.get('/products/categories'),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data.length ? categoriesRes.data : [{ id: 1, name: 'General' }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    if (window.confirm('Permanently delete this product?')) {
      try {
        await api.delete(`/admin/products/${productId}`);
        fetchProducts();
      } catch (err) {
        alert('Error deleting product');
      }
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-32 pb-24 min-h-screen bg-bg-off-white">
      <Helmet>
        <title>Product Management | Lucas Agro</title>
      </Helmet>

      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 text-left">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1 font-serif">Product Management</h1>
            <p className="text-primary/50 text-sm font-semibold">{products.length} products total</p>
          </div>
          <button
            onClick={() => setModalState('add')}
            className="btn-primary flex items-center gap-2 font-bold"
          >
            <Plus size={18} />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Products Table Card */}
        <div className="glass-card overflow-hidden mb-6 border border-accent/20">
          {/* Search bar */}
          <div className="p-4 border-b border-accent flex items-center gap-3 bg-white/50">
            <Search size={18} className="text-primary/30" />
            <input
              type="text"
              placeholder="Search products by name..."
              className="flex-1 bg-transparent outline-none text-sm text-primary font-medium placeholder:text-primary/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto text-left">
            {loading ? (
              <div className="p-12 text-center text-primary/50 font-bold">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center text-primary/50 font-bold">No products found.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-primary/5 border-b border-accent">
                    {['Product', 'Price', 'Stock', 'Category', 'Status', 'Actions'].map((header) => (
                      <th
                        key={header}
                        className="px-5 py-4 text-xs font-bold text-primary/40 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-accent">
                  {filteredProducts.map((p) => (
                    <motion.tr
                      layout
                      key={p.id}
                      className="hover:bg-bg-off-white transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover border border-accent"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-accent/30 rounded-lg flex items-center justify-center text-secondary/50 border border-accent">
                              <Package size={18} />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-primary text-sm">{p.name}</p>
                              {(p.is_featured === 1 || p.is_featured === true || p.is_featured === 'true') && (
                                <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold uppercase px-1.5 py-0.5 rounded-full border border-amber-200">
                                  Featured
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-primary/40 font-medium">/{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold">
                        <p className="font-bold text-primary">₹{p.price}</p>
                        {p.original_price && (
                          <p className="text-xs text-primary/40 line-through">₹{p.original_price}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-sm font-bold ${p.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-primary/60 font-semibold">
                        {p.category_name || '—'}
                      </td>
                      <td className="px-5 py-4">
                        {p.is_active ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                            <Check size={14} />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-500 text-xs font-bold">
                            <XCircle size={14} />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setModalState(p)}
                            className="p-2 rounded-lg hover:bg-secondary/10 text-primary/40 hover:text-secondary transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-primary/40 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Form Modal */}
        <AnimatePresence>
          {modalState && (
            <ProductEditModal
              product={modalState === 'add' ? null : modalState}
              categories={categories}
              onClose={() => setModalState(null)}
              onSave={() => {
                setModalState(null);
                fetchProducts();
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ManageProducts;
