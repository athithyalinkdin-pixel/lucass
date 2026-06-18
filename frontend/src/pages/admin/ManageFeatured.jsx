import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Package, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AdminNav from '../../components/AdminNav';
import { getImageUrl } from '../../utils/imageHelper';

const ManageFeatured = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/admin/products');
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleFeatured = async (product) => {
    const nextStatus = !product.is_featured;

    // Build the request body satisfying the Zod schema requirements
    const updatedProduct = {
      name: product.name,
      price: parseFloat(product.price),
      original_price: product.original_price ? parseFloat(product.original_price) : null,
      stock: parseInt(product.stock),
      description: product.description,
      ingredients: product.ingredients || null,
      benefits: product.benefits || null,
      offers: product.offers || null,
      image_url: product.image_url || '',
      subtitle: product.subtitle || '',
      rating: parseFloat(product.rating || 4.5),
      tag: product.tag || '',
      category_id: parseInt(product.category_id || 1),
      is_active: product.is_active === 1 || product.is_active === true || product.is_active === 'true',
      is_featured: nextStatus,
    };

    try {
      await api.put(`/admin/products/${product.id}`, updatedProduct);
      
      // Update state
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_featured: nextStatus } : p))
      );

      // Trigger success toast
      setToastMessage(`"${product.name}" featured status updated!`);
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Failed to toggle featured status:', err);
      alert('Failed to update product featured status.');
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-bg-off-white">
      <Helmet>
        <title>Manage Featured Products | Lucas Agro Admin</title>
      </Helmet>

      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        {/* Admin Navigation Tabs */}
        <AdminNav />

        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-secondary text-white px-6 py-3.5 rounded-full shadow-premium flex items-center gap-3 text-sm font-bold"
            >
              <CheckCircle2 size={18} />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back Link */}
        <div className="mb-6 flex">
          <Link
            to="/admin"
            className="flex items-center gap-2 text-primary/50 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10 text-left">
          <h1 className="text-3xl font-bold text-primary font-serif">Manage Homepage Products</h1>
          <p className="text-primary/50 text-sm mt-1 font-semibold">
            Toggle which products appear in the "Featured Products" section of the home screen. Changes save instantly.
          </p>
        </div>

        {/* Products Table List */}
        <div className="glass-card overflow-hidden border border-accent/20">
          <div className="overflow-x-auto text-left">
            {loading ? (
              <div className="p-16 text-center text-primary/50 font-bold">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="p-16 text-center text-primary/40 font-bold flex flex-col items-center gap-4">
                <Package size={48} className="opacity-30" />
                <span>No products found to manage. Create products first.</span>
                <Link to="/admin/products" className="btn-primary inline-flex mt-2">Manage Products</Link>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-primary/5 border-b border-accent">
                    <th className="px-6 py-4 text-xs font-bold text-primary/45 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-xs font-bold text-primary/45 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-primary/45 uppercase tracking-wider text-center">Home Featured Switch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-accent bg-white/40">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="group hover:bg-bg-off-white/40 transition-colors"
                    >
                      {/* Product Detail info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1 border border-accent/40 shadow-sm flex-shrink-0">
                            <img
                              src={getImageUrl(product.image_url, product.name)}
                              alt={product.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.src = 'https://placehold.co/100x100?text=Ayurveda';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-extrabold text-primary text-sm font-serif">{product.name}</p>
                            <p className="text-xs text-primary/45 font-semibold mt-0.5">₹{product.price}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 text-sm font-bold text-primary/70">
                        {product.category_name || 'Ayurveda'}
                      </td>

                      {/* Toggle Switch */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={product.is_featured === 1 || product.is_featured === true || product.is_featured === 'true'}
                              onChange={() => handleToggleFeatured(product)}
                            />
                            <div className="w-14 h-7 bg-accent rounded-full peer peer-checked:bg-secondary after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-7 shadow-sm" />
                          </label>
                          <span className="ml-3 text-xs font-extrabold uppercase tracking-wide min-w-[70px] text-left">
                            {(product.is_featured === 1 || product.is_featured === true || product.is_featured === 'true') ? (
                              <span className="text-secondary">Featured</span>
                            ) : (
                              <span className="text-primary/30">Regular</span>
                            )}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageFeatured;
