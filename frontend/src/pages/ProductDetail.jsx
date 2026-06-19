import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Leaf, Award, Activity, ShoppingCart } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageHelper';

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product, using fallback:', err);
        // Fallback product data if backend API is not available
        if (slug === 'amala-plus') {
          setProduct({
            id: 1,
            name: 'AMALA PLUS',
            subtitle: 'Sip & Slim',
            price: 1099,
            original_price: 1299,
            shipping_cost: 0,
            slug: 'amala-plus',
            image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop',
            description: "Experience the power of nature with Amala Plus. Our unique Ayurvedic formulation is designed to support natural fat reduction and detoxification. Made with 100% pure herbal extracts, it's gentle on your body but effective for long-term wellness.",
            benefits: 'Supports natural fat reduction\nDetoxifies the body\nImproves digestion',
            ingredients: 'Amla (Phyllanthus emblica), Garcinia Cambogia, Green Tea Extract, Honey, and Lemon juice base.',
            offers: 'Get 15% off on buying a pack of 2!',
            category_name: 'Weight Management',
          });
        } else if (slug === 'avaram-poo-plus') {
          setProduct({
            id: 2,
            name: 'AVARAM POO PLUS',
            subtitle: 'Sugar Killer',
            price: 1099,
            original_price: 1299,
            shipping_cost: 0,
            slug: 'avaram-poo-plus',
            image_url: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=500&auto=format&fit=crop',
            description: 'Avaram Poo Plus is a traditional Ayurvedic syrup formulated to support healthy sugar balance and heart health. It combines ancient wisdom with modern quality standards to provide a safe, effective solution for modern lifestyle challenges.',
            benefits: 'Helps manage sugar levels\nSupports heart health\nBoosts daily energy',
            ingredients: 'Avaram Poo (Senna auriculata), Jamun Seed, Fenugreek, Gymnema Sylvestre, and organic syrup base.',
            offers: 'Free delivery on prepaid orders above ₹1500!',
            category_name: 'Sugar Balance',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-48 text-center min-h-screen text-primary font-bold">
        Loading Product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-48 text-center min-h-screen text-primary font-bold">
        Product Not Found
      </div>
    );
  }

  // Schema.org Structured Data
  const schemaMarkup = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.price,
      availability: 'https://schema.org/InStock',
    },
  };

  // Process benefits list from string or array
  const benefitsList = Array.isArray(product.benefits)
    ? product.benefits
    : (product.benefits || '').split('\n').filter(Boolean);

  return (
    <div className="pt-32 pb-24 bg-bg-off-white min-h-screen">
      <Helmet>
        <title>{product.name} | Lucas Agro & Naturals</title>
        <meta name="description" content={product.description} />
        <script type="application/ld+json">{JSON.stringify(schemaMarkup)}</script>
      </Helmet>

      <div className="container mx-auto px-4 md:px-8">
        {/* Back Link */}
        <Link
          to="/shop"
          className="inline-flex items-center text-primary/60 hover:text-secondary mb-8 transition-colors gap-2"
        >
          <ArrowLeft size={20} />
          <span className="font-bold">Back to Shop</span>
        </Link>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left: Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card w-full aspect-square bg-white flex items-center justify-center p-4 overflow-hidden shadow-premium max-w-[600px] mx-auto relative"
          >
            {!imageLoaded && (
              <div className="absolute inset-0 bg-accent/10 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin" />
              </div>
            )}
            <img
              src={getImageUrl(product.image_url, product.name)}
              alt={product.name}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-all duration-1000 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onError={(e) => {
                e.target.src = 'https://placehold.co/400x400?text=Premium+Ayurveda';
                setImageLoaded(true);
              }}
            />
          </motion.div>

          {/* Right: Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-secondary font-bold tracking-widest uppercase text-xs mb-4 block">
              {product.category_name || 'Ayurvedic Formula'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 italic font-serif">
              {product.name}
            </h1>
            <p className="text-3xl font-bold text-secondary mb-2">₹{product.price}</p>
            {product.original_price && (
              <p className="text-sm text-primary/40 line-through mb-8">
                Original Price: ₹{product.original_price}
              </p>
            )}
            <p className="text-primary/70 text-lg leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Benefits List */}
            {benefitsList.length > 0 && (
              <div className="mb-8">
                <h4 className="font-bold text-primary mb-4">Key Benefits:</h4>
                <ul className="grid grid-cols-1 gap-3">
                  {benefitsList.map((benefit, idx) => (
                    <li key={idx} className="flex items-center space-x-3 text-primary/80">
                      <Check className="text-secondary flex-shrink-0" size={20} />
                      <span className="font-semibold text-sm">{benefit.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ingredients Callout */}
            {product.ingredients && (
              <div className="mb-8 p-5 bg-secondary/5 rounded-2xl border border-secondary/10">
                <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                  <Leaf size={18} className="text-secondary" />
                  Ingredients
                </h4>
                <p className="text-sm text-primary/70 leading-relaxed font-medium">
                  {product.ingredients}
                </p>
              </div>
            )}

            {/* Offers Callout */}
            {product.offers && (
              <div className="mb-8 p-5 bg-amber-50 rounded-2xl border border-amber-100">
                <h4 className="font-bold text-amber-700 mb-2">🎁 Special Offer</h4>
                <p className="text-sm text-amber-700/80 leading-relaxed font-semibold">
                  {product.offers}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-6 items-center border-t border-accent pt-8">
              <div className="flex items-center border border-accent rounded-full bg-white px-4 py-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-primary font-bold text-lg hover:text-secondary transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-12 text-center bg-transparent font-bold text-primary focus:outline-none"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-primary font-bold text-lg hover:text-secondary transition-colors"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => addToCart(product, quantity)}
                className="btn-primary flex items-center justify-center space-x-3 w-full py-4"
              >
                <ShoppingCart size={20} />
                <span>Add to Cart</span>
              </button>
            </div>

            {/* Footer trust items */}
            <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-accent">
              <div className="text-center">
                <div className="flex justify-center text-secondary mb-2">
                  <Leaf size={24} />
                </div>
                <p className="text-[10px] font-bold uppercase text-primary/60">100% Herbal</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center text-secondary mb-2">
                  <Award size={24} />
                </div>
                <p className="text-[10px] font-bold uppercase text-primary/60">Certified Safe</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center text-secondary mb-2">
                  <Activity size={24} />
                </div>
                <p className="text-[10px] font-bold uppercase text-primary/60">Visible Results</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Disclaimer */}
        <div className="mt-24 p-8 bg-primary/5 rounded-3xl border border-primary/5">
          <h4 className="font-bold text-primary mb-4">Medical Disclaimer</h4>
          <p className="text-sm text-primary/60 leading-relaxed italic">
            "These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease. Consult your healthcare provider before use, especially if pregnant, nursing, or on medication."
          </p>
        </div>
      </div>

      {/* Mobile Sticky Add to Cart */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md p-4 border-t border-accent z-40">
        <button
          onClick={() => addToCart(product, quantity)}
          className="btn-primary w-full flex items-center justify-center space-x-3"
        >
          <ShoppingCart size={20} />
          <span>Add to Cart - ₹{product.price * quantity}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
