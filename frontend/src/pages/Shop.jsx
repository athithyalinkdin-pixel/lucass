import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { Search, Filter, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [prodData, catData] = await Promise.all([
          api.get('/products'),
          api.get('/products/categories')
        ]);
        setProducts(prodData.data);
        setCategories(catData.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback mock data for demo if API fails
        const mockData = [
          { id: 1, name: "AMALA PLUS", subtitle: "Sip & Slim", price: 1099, slug: "amala-plus", description: "Premium Ayurvedic blend for natural fat reduction.", category_id: 1, category_name: "Weight Management", image_url: "/assets/amala-plus.jpg" },
          { id: 2, name: "AVARAM POO PLUS", subtitle: "Sugar Killer", price: 1099, slug: "avaram-poo-plus", description: "Traditional support for healthy sugar balance.", category_id: 2, category_name: "Sugar Balance", image_url: "/assets/avaram-poo-plus.jpg" }
        ];
        setProducts(mockData);
        setCategories([{ id: 1, name: "Weight Management" }, { id: 2, name: "Sugar Balance" }]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Search
    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category_id === parseInt(selectedCategory));
    }

    // Sort
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);

    return result;
  }, [searchTerm, sortBy, selectedCategory, products]);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-bg-off-white">
      <Helmet>
        <title>Shop Natural Health Solutions | Lucas Agro & Naturals</title>
        <meta name="description" content="Shop premium Ayurvedic products for weight management, sugar support, and heart health. Safe and effective herbal solutions from Lucas Agro & Naturals." />
      </Helmet>

      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 italic">Begin Your Wellness Journey</h1>
          <p className="text-primary/60 text-lg">Premium Ayurvedic products | Safe and effective</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-white border border-accent rounded-full py-3 pl-12 pr-6 focus:outline-none focus:border-secondary transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            {/* Category Filter */}
            <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-full border border-accent">
              <Filter size={18} className="text-primary/40" />
              <select
                className="bg-transparent focus:outline-none text-sm font-medium"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-full border border-accent">
              <select
                className="bg-transparent focus:outline-none text-sm font-medium"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Sort by: Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-accent/20 rounded-3xl h-96"></div>
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
                <Link to={`/product/${product.slug}`} className="relative aspect-square bg-white flex items-center justify-center p-10 overflow-hidden">
                  <img
                    src={product.image_url || product.image}
                    alt={product.name}
                    className="h-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-lg"
                    onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=Ayurveda'; }}
                  />
                  {/* Floating category tag */}
                  <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-secondary">
                    {product.category_name || 'Ayurveda'}
                  </div>
                </Link>
                <div className="p-8 flex flex-col flex-grow">
                  <Link to={`/product/${product.slug}`}>
                    <h3 className="text-2xl font-bold text-primary mb-2 group-hover:text-secondary transition-colors italic">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-primary/60 text-sm mb-6 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-primary text-white p-3 rounded-full hover:bg-secondary transition-colors duration-300 shadow-lg"
                    >
                      <ShoppingBag size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-24">
            <p className="text-xl text-primary/40">No products found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
