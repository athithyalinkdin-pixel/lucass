import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getProductBySlug } from '../services/api';
import { useCart } from '../context/CartContext';
import { ShoppingCart, ShieldCheck, Leaf, RefreshCw, ChevronLeft } from 'lucide-react';

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductBySlug(slug);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        // Fallback for demo
        if (slug === 'amala-plus') {
            setProduct({
                id: 1, name: "AMALA PLUS", subtitle: "Sip & Slim", price: 1099, slug: "amala-plus", 
                image: "/assets/amala-plus.jpg",
                description: "Experience the power of nature with Amala Plus. Our unique Ayurvedic formulation is designed to support natural fat reduction and detoxification. Made with 100% pure herbal extracts, it's gentle on your body but effective for long-term wellness.",
                benefits: ["Supports natural fat reduction", "Detoxifies the body", "Improves digestion"],
                category_name: "Weight Management"
            });
        } else {
            setProduct({
                id: 2, name: "AVARAM POO PLUS", subtitle: "Sugar Killer", price: 1099, slug: "avaram-poo-plus", 
                image: "/assets/avaram-poo-plus.jpg",
                description: "Avaram Poo Plus is a traditional Ayurvedic syrup formulated to support healthy sugar balance and heart health. It combines ancient wisdom with modern quality standards to provide a safe, effective solution for modern lifestyle challenges.",
                benefits: ["Helps manage sugar levels", "Supports heart health", "Boosts daily energy"],
                category_name: "Sugar Balance"
            });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) return <div className="pt-48 text-center min-h-screen">Loading Product...</div>;
  if (!product) return <div className="pt-48 text-center min-h-screen">Product Not Found</div>;

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": product.price,
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <div className="pt-32 pb-24 bg-bg-off-white min-h-screen">
      <Helmet>
        <title>{product.name} | Lucas Agro & Naturals</title>
        <meta name="description" content={product.description} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="container mx-auto px-4 md:px-8">
        <Link to="/shop" className="inline-flex items-center text-primary/60 hover:text-secondary mb-8 transition-colors">
          <ChevronLeft size={20} />
          <span>Back to Shop</span>
        </Link>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Image Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card aspect-square bg-white flex items-center justify-center overflow-hidden shadow-premium"
          >
            <img 
              src={product.image_url || product.image} 
              alt={product.name} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
              onError={(e) => { e.target.src = 'https://placehold.co/600x800?text=Premium+Ayurveda'; }}
            />
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-secondary font-bold tracking-widest uppercase text-xs mb-4 block">
              {product.category_name || 'Ayurvedic Formula'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 italic">{product.name}</h1>
            <p className="text-3xl font-bold text-secondary mb-2">₹{product.price}</p>
            {product.original_price && (
              <p className="text-sm text-primary/40 line-through mb-8">Original Price: ₹{product.original_price}</p>
            )}
            
            <p className="text-primary/70 text-lg leading-relaxed mb-8">
              {product.description}
            </p>

            {(() => {
              // Benefits can be a newline-separated string from DB or an array
              const benefits = Array.isArray(product.benefits)
                ? product.benefits
                : (product.benefits || '').split('\n').filter(Boolean);
              return benefits.length > 0 ? (
                <div className="mb-8">
                  <h4 className="font-bold text-primary mb-4">Key Benefits:</h4>
                  <ul className="grid grid-cols-1 gap-3">
                    {benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center space-x-3 text-primary/80">
                        <ShieldCheck className="text-secondary flex-shrink-0" size={20} />
                        <span>{benefit.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null;
            })()}

            {/* Ingredients */}
            {product.ingredients && (
              <div className="mb-8 p-5 bg-secondary/5 rounded-2xl border border-secondary/10">
                <h4 className="font-bold text-primary mb-2 flex items-center gap-2"><Leaf size={18} className="text-secondary" />Ingredients</h4>
                <p className="text-sm text-primary/70 leading-relaxed">{product.ingredients}</p>
              </div>
            )}

            {/* Offers */}
            {product.offers && (
              <div className="mb-8 p-5 bg-amber-50 rounded-2xl border border-amber-100">
                <h4 className="font-bold text-amber-700 mb-2">🎁 Special Offer</h4>
                <p className="text-sm text-amber-700/80 leading-relaxed">{product.offers}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-6 items-center border-t border-accent pt-8">
              <div className="flex items-center border border-accent rounded-full bg-white px-4 py-2">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 text-primary">-</button>
                <input 
                  type="number" 
                  value={qty} 
                  onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                  className="w-12 text-center bg-transparent font-bold focus:outline-none"
                />
                <button onClick={() => setQty(qty + 1)} className="p-2 text-primary">+</button>
              </div>
              <button 
                onClick={() => addToCart(product, qty)}
                className="btn-primary flex items-center justify-center space-x-3 w-full"
              >
                <ShoppingCart size={20} />
                <span>Add to Cart</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-accent">
              <div className="text-center">
                <div className="flex justify-center text-secondary mb-2"><Leaf size={24} /></div>
                <p className="text-[10px] font-bold uppercase text-primary/60">100% Herbal</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center text-secondary mb-2"><ShieldCheck size={24} /></div>
                <p className="text-[10px] font-bold uppercase text-primary/60">Certified Safe</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center text-secondary mb-2"><RefreshCw size={24} /></div>
                <p className="text-[10px] font-bold uppercase text-primary/60">Visible Results</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Disclaimer Section */}
        <div className="mt-24 p-8 bg-primary/5 rounded-3xl border border-primary/5">
          <h4 className="font-bold text-primary mb-4">Medical Disclaimer</h4>
          <p className="text-sm text-primary/60 leading-relaxed italic">
            "These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease. Consult your healthcare provider before use, especially if pregnant, nursing, or on medication."
          </p>
        </div>
      </div>
      
      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md p-4 border-t border-accent z-40">
          <button 
            onClick={() => addToCart(product, qty)}
            className="btn-primary w-full flex items-center justify-center space-x-3"
          >
            <ShoppingCart size={20} />
            <span>Add to Cart - ₹{product.price}</span>
          </button>
      </div>
    </div>
  );
};

export default ProductDetail;
