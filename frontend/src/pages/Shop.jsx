import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, Filter, Plus } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageHelper';

const ProductImage = ({ src, alt, categoryName }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full aspect-square bg-white flex items-center justify-center p-6 overflow-hidden max-w-[400px] max-h-[400px] mx-auto">
      {!loaded && (
        <div className="absolute inset-0 bg-accent/10 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-contain group-hover:scale-105 transition-all duration-700 drop-shadow-lg ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onError={(e) => {
          e.target.src = 'https://placehold.co/400x400?text=Ayurveda';
          setLoaded(true);
        }}
      />
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-secondary">
        {categoryName || 'Ayurveda'}
      </div>
    </div>
  );
};

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products'),
          api.get('/products/categories'),
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error('Error fetching products, using fallbacks:', err);
        // Fallbacks if backend is not running
        setProducts([
          {
            id: 1,
            name: 'AMALA PLUS',
            subtitle: 'Sip & Slim',
            price: 1099,
            slug: 'amala-plus',
            description: 'Premium Ayurvedic blend for natural fat reduction.',
            category_id: 1,
            category_name: 'Weight Management',
            image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop',
          },
          {
            id: 2,
            name: 'AVARAM POO PLUS',
            subtitle: 'Sugar Killer',
            price: 1099,
            slug: 'avaram-poo-plus',
            description: 'Traditional support for healthy sugar balance.',
            category_id: 2,
            category_name: 'Sugar Balance',
            image_url: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=500&auto=format&fit=crop',
          },
        ]);
        setCategories([
          { id: 1, name: 'Weight Management' },
          { id: 2, name: 'Sugar Balance' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query filter
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category_id === parseInt(selectedCategory));
    }

    // Sorting
    if (sortOption === 'newest') {
      result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else if (sortOption === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [searchQuery, sortOption, selectedCategory, products]);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-bg-off-white">
      <Helmet>
        <title>Shop Natural Health Solutions | Lucas Agro & Naturals</title>
        <meta
          name="description"
          content="Shop premium Ayurvedic products for weight management, sugar support, and heart health. Safe and effective herbal solutions from Lucas Agro & Naturals."
        />
      </Helmet>

      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 italic font-serif">
            Begin Your Wellness Journey
          </h1>
          <p className="text-primary/60 text-lg">Premium Ayurvedic products | Safe and effective</p>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-white border border-accent rounded-full py-3 pl-12 pr-6 focus:outline-none focus:border-secondary transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Selector options */}
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            {/* Category selection */}
            <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-full border border-accent">
              <Filter size={18} className="text-primary/40" />
              <select
                className="bg-transparent focus:outline-none text-sm font-medium pr-8 cursor-pointer"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sorting selection */}
            <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-full border border-accent">
              <select
                className="bg-transparent focus:outline-none text-sm font-medium pr-8 cursor-pointer"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="newest">Sort by: Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((skeleton) => (
              <div key={skeleton} className="animate-pulse bg-accent/20 rounded-3xl h-96" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={product.id}
                className="glass-card group overflow-hidden flex flex-col h-full"
              >
                {/* Product Image */}
                <Link to={`/product/${product.slug}`}>
                  <ProductImage
                    src={getImageUrl(product.image_url, product.name)}
                    alt={product.name}
                    categoryName={product.category_name}
                  />
                </Link>

                {/* Info & Cart Action */}
                <div className="p-8 flex flex-col flex-grow">
                  <Link to={`/product/${product.slug}`}>
                    <h3 className="text-2xl font-bold text-primary mb-2 group-hover:text-secondary transition-colors italic font-serif">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-primary/60 text-sm mb-6 line-clamp-2">{product.description}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="bg-primary text-white p-3 rounded-full hover:bg-secondary transition-colors duration-300 shadow-md"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty Search Result */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-24">
            <p className="text-xl text-primary/40 font-bold">No products found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
