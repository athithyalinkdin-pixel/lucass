import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Check, Award, FlaskConical, Leaf, Star, ChevronDown, Calendar, User } from 'lucide-react';
import api from '../services/api';

const renderTestimonialMedia = (url, name) => {
  if (!url) {
    return (
      <div className="w-full h-full bg-primary/5 flex items-center justify-center">
        <Star size={40} className="text-primary/20" />
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
      <iframe
        src={embedUrl}
        className="w-full h-full"
        title={name}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  // Check if it is a direct video link (mp4, webm, ogg, mov, m4v)
  const isVideo = /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(url) || url.includes('video');
  if (isVideo) {
    return (
      <video
        src={url}
        controls
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error("Video load error, fallback to avatar placeholder");
        }}
      />
    );
  }

  // Treat as image URL
  return (
    <img
      src={url}
      alt={name}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.target.src = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800';
      }}
    />
  );
};

const Home = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'AMALA PLUS',
      subtitle: 'Supports Heart Health',
      price: '1099',
      oldPrice: '1299',
      image_url: '',
      tag: 'Sale',
      rating: 4.8,
    },
    {
      id: 2,
      name: 'AVARAM POO PLUS',
      subtitle: 'Sugar Support Syrup',
      price: '1099',
      oldPrice: '1299',
      image_url: '',
      tag: 'Trending',
      rating: 4.9,
    },
  ]);

  const [activeFaq, setActiveFaq] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = current.clientWidth * 0.8;
      current.scrollTo({
        left: current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount),
        behavior: 'smooth',
      });
    }
  };

  const faqs = [
    {
      q: 'Is it safe for daily use?',
      a: 'Yes, our formulations are made from 100% natural herbal ingredients and are safe for daily consumption when used as directed.',
    },
    {
      q: 'When can I expect to see results?',
      a: 'Most users report feeling a difference within 4–6 weeks. However, results vary based on individual health conditions and consistency of use.',
    },
    {
      q: 'Are there any side effects?',
      a: 'There are no known side effects as our products are chemical-free. However, if you have specific health concerns, please consult your doctor.',
    },
    {
      q: 'Which product should I choose for sugar management?',
      a: 'Avaram Poo Plus is specifically formulated to support healthy sugar balance. For weight management, Amala Plus is recommended.',
    },
    {
      q: 'Can I take this alongside my prescribed medications?',
      a: 'While our products are natural, we recommend consulting your healthcare provider before combining them with other prescribed formulations.',
    },
    {
      q: 'How should I consume these products for best results?',
      a: 'For optimal absorption, we recommend taking the syrup on an empty stomach in the morning. Store in a cool, dry place.',
    },
    {
      q: 'Is it safe for long-term consumption?',
      a: 'Yes, our formulations are designed for long-term wellness and are gentle enough for sustained use without dependency.',
    },
  ];

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const { data } = await api.get('/products');
        if (data && data.length > 0) {
          const featured = data.filter(p => p.is_featured === 1 || p.is_featured === true || p.is_featured === 'true');
          setProducts(featured);
        }
      } catch (err) {
        console.error('Failed to fetch products for home page, using fallback.');
      }

      try {
        const { data } = await api.get('/testimonials');
        if (data && data.length > 0) {
          setTestimonials(data);
        }
      } catch (err) {
        console.error('Failed to fetch testimonials, using fallback.');
      }

      try {
        const { data } = await api.get('/blog');
        if (data && data.length > 0) {
          setBlogs(data.slice(0, 2));
        }
      } catch (err) {
        console.error('Failed to fetch blog posts.');
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="overflow-x-hidden bg-bg-off-white">
      <Helmet>
        <title>Lucas Agro & Naturals | Premium Ayurvedic Solutions</title>
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-primary pt-20">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=2000"
            className="w-full h-full object-cover brightness-[0.4] scale-110"
            alt="Nature Background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/40 to-transparent" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white py-12"
            >
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 mb-8">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Pure Ayurvedic Formulation</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black leading-[0.95] tracking-tighter mb-8 font-sans">
                The Power <br />
                <span className="text-secondary italic font-serif">of</span> Nature <br />
                <span className="text-white/40">in Every Bottle</span>
              </h1>
              <p className="text-white/70 text-lg md:text-xl mb-12 max-w-xl leading-relaxed font-medium">
                Reclaim your health with standardized herbal extracts. Scientifically formulated to help you support weight management and maintain healthy sugar levels naturally.
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <Link
                  to="/shop"
                  className="bg-secondary text-white px-12 py-5 rounded-full font-black text-lg hover:bg-white hover:text-primary transition-all shadow-lg group flex items-center gap-3"
                >
                  Explore Products <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </Link>
                <div className="flex items-center gap-4 text-white/60">
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
                    <Award size={20} className="text-secondary" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest leading-snug">
                    Certified <br /> Purity
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Images and Animations */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-secondary/10 rounded-full blur-3xl -z-10 animate-pulse" />
              <div className="relative z-10 w-full max-w-3xl ml-auto">
                <motion.img
                  initial={{ opacity: 0, scale: 0.5, rotate: 15 }}
                  animate={{ opacity: 1, scale: 1, rotate: -12 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  src="/assets/media__1777492006143.png"
                  alt="Roots Clear Product"
                  className="w-full h-auto drop-shadow-[0_80px_80px_rgba(0,0,0,0.7)] transform hover:rotate-0 transition-transform duration-1000 relative z-20"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1512061659335-288e5f84c3f5?auto=format&fit=crop&q=80&w=1000';
                  }}
                />
                <div className="absolute -top-16 -left-12 w-48 h-48 rounded-full border-8 border-white/10 backdrop-blur-md overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)] z-40 hidden lg:block animate-float">
                  <img
                    src="/assets/media__1777521578330.jpg"
                    className="w-full h-full object-cover scale-110"
                    alt="Herbal Medley"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1540331547168-8b63109225b7?auto=format&fit=crop&q=80&w=600';
                    }}
                  />
                </div>
                <div className="absolute bottom-10 -left-40 w-56 h-56 rounded-full border-8 border-white/10 backdrop-blur-md overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)] z-40 hidden lg:block animate-float-delayed">
                  <img
                    src="/assets/media__1777521578395.jpg"
                    className="w-full h-full object-cover scale-110"
                    alt="Traditional Mortar"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?auto=format&fit=crop&q=80&w=600';
                    }}
                  />
                </div>
                <div className="absolute -bottom-16 right-1/3 w-40 h-40 rounded-full border-8 border-white/10 backdrop-blur-md overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)] z-30 hidden lg:block animate-float">
                  <img
                    src="/assets/media__1777521578363.jpg"
                    className="w-full h-full object-cover scale-110"
                    alt="Moody Craft"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600';
                    }}
                  />
                </div>
              </div>

              {/* Stat Card 1 */}
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute top-10 right-10 bg-white/10 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.4)] animate-float z-30 min-w-[200px]"
              >
                <p className="text-4xl font-black text-secondary leading-tight">100%</p>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">Organic</p>
              </motion.div>

              {/* Stat Card 2 */}
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="absolute bottom-32 right-20 bg-white/10 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.4)] animate-float-delayed z-30 min-w-[240px]"
              >
                <p className="text-4xl font-black text-secondary leading-tight">20k +</p>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">Trusted Customers</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust & Quality Certs */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-primary italic mb-4">
              Certified Trust & <span className="text-secondary">Proven Quality</span>
            </h2>
            <div className="w-24 h-1 bg-secondary mx-auto rounded-full mb-8" />
            <p className="text-primary/60 max-w-2xl mx-auto font-medium">
              We uphold the highest standards of safety and purity. Every Lucas Agro & Naturals product is manufactured in certified facilities and undergoes rigorous testing.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {[
              { name: 'FSSAI', label: 'Food Safety', url: 'fssai_cert.png' },
              { name: 'GMP', label: 'Manufacturing', url: 'gmp_cert.jpg' },
              { name: 'ISO', label: 'Quality Mgmt', url: 'iso_cert.png' },
              { name: 'MSME', label: 'Govt Recognized', url: 'msme_cert.png' },
              { name: '100% Natural', label: 'Pure Product', url: 'natural_product.png' },
              { name: 'Trademark', label: 'Registered Brand', url: 'trademark_new.png' },
            ].map((cert, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -15, scale: 1.1 }}
                className="group relative flex flex-col items-center"
              >
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white flex items-center justify-center p-6 border-2 border-accent/30 shadow-md transition-all duration-500 group-hover:shadow-secondary/30 group-hover:border-secondary overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img
                    src={`/assets/${cert.url}`}
                    alt={cert.name}
                    className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                    onError={(e) => {
                      e.target.src = `https://placehold.co/200x200?text=${cert.name}`;
                    }}
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{cert.name}</p>
                  <p className="text-[8px] font-bold text-secondary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    {cert.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Ayurveda Section */}
      <section className="py-32 bg-bg-warm relative overflow-hidden">
        <div className="absolute top-10 right-0 opacity-10 pointer-events-none">
          <Leaf size={300} className="text-secondary rotate-45" />
        </div>
        <div className="absolute bottom-10 left-0 opacity-10 pointer-events-none">
          <Leaf size={250} className="text-secondary -rotate-45" />
        </div>

        <div className="container mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-20 items-center">
          {/* Left Column (Images Stack) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative w-4/5 aspect-square rounded-lg overflow-hidden shadow-xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800"
                className="w-full h-full object-cover"
                alt="Ayurvedic Heritage"
              />
            </div>
            <div className="absolute -bottom-10 -right-4 w-3/5 aspect-square rounded-lg overflow-hidden shadow-2xl border-[12px] border-white z-10">
              <img
                src="/assets/ayurvedic-wellness-prep.png"
                className="w-full h-full object-cover"
                alt="Ayurvedic Wellness Preparation"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1615840287214-7ff58936c4cf?auto=format&fit=crop&q=80&w=600';
                }}
              />
            </div>
            <div className="absolute -bottom-6 left-10 z-20">
              <div className="bg-secondary text-white px-8 py-6 rounded-full shadow-lg relative transform -rotate-6">
                <p className="text-2xl font-black mb-0">12+</p>
                <p className="text-[10px] font-bold uppercase tracking-widest leading-none">
                  Premium <br /> Formulas
                </p>
                <div className="absolute top-1/2 -right-6 -translate-y-1/2 w-12 h-8 bg-secondary clip-ribbon transform rotate-6" />
              </div>
            </div>
          </motion.div>

          {/* Right Column (Info) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-secondary font-serif italic text-2xl mb-4 block">About Us</span>
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-6 leading-tight font-sans">
              Rooted in Ayurveda. <br />
              <span className="text-secondary">Built for Modern Health Challenges.</span>
            </h2>
            <p className="text-primary/60 font-bold mb-8 leading-relaxed">
              Lucas Agro & Naturals combines traditional herbal wisdom with modern quality standards to support your wellness journey.
            </p>

            <div className="space-y-8 mb-12">
              {[
                {
                  title: 'Pure & Natural',
                  desc: '100% Herbal Ingredients. No chemicals, only pure Ayurvedic herbs sourced responsibly.',
                  icon: <Leaf className="text-secondary group-hover:text-white transition-colors duration-500" size={24} />,
                },
                {
                  title: 'Scientifically Formulated',
                  desc: 'Traditional wisdom meets modern research. Every blend is standardized for consistency.',
                  icon: <FlaskConical className="text-secondary group-hover:text-white transition-colors duration-500" size={24} />,
                },
                {
                  title: 'Certified Quality',
                  desc: 'Manufactured in certified facilities. Strict checks ensure global standards.',
                  icon: <Award className="text-secondary group-hover:text-white transition-colors duration-500" size={24} />,
                },
              ].map((item, index) => (
                <div key={index} className="flex gap-6 items-start group cursor-default">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:bg-secondary group-hover:shadow-lg transition-all duration-500 transform group-hover:-translate-y-2">
                    {item.icon}
                  </div>
                  <div className="transform transition-transform duration-500 group-hover:translate-x-2">
                    <h4 className="text-lg font-black text-primary mb-1 uppercase tracking-tight">{item.title}</h4>
                    <p className="text-sm text-primary/60 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-secondary p-5 rounded-2xl flex items-center gap-4 text-white shadow-lg transform hover:scale-105 transition-transform duration-500 cursor-default">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
                <Check size={20} className="text-white" />
              </div>
              <p className="font-bold uppercase tracking-widest text-sm leading-tight">
                Top-Quality Organic Healthy <br /> Solutions Production
              </p>
            </div>
          </motion.div>
        </div>

        {/* Story Sub-card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 md:px-8 mt-32 max-w-5xl relative z-10"
        >
          <div className="bg-white/80 backdrop-blur-2xl p-12 md:p-16 border-l-8 border-secondary shadow-[0_30px_60px_rgba(0,0,0,0.05)] rounded-r-3xl relative overflow-hidden group hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-shadow duration-700">
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 group-hover:scale-150 transition-all duration-1000 -z-10" />
            <h3 className="text-4xl font-black text-primary mb-8 italic flex items-center gap-4">
              Our Story
              <div className="h-1 flex-1 bg-gradient-to-r from-secondary/30 to-transparent rounded-full" />
            </h3>
            <div className="grid md:grid-cols-2 gap-12">
              <p className="text-primary/70 text-lg leading-relaxed font-medium">
                In a world where lifestyle diseases like weight gain, sugar imbalance, and low energy are increasing rapidly, finding safe, natural solutions can be challenging.
              </p>
              <p className="text-primary/70 text-lg leading-relaxed font-medium">
                We created <span className="font-bold text-secondary">Lucas Agro & Naturals</span> to bridge the gap between ancient Ayurvedic principles and modern living. Our formulations are designed to support your body's natural healing processes without harsh chemicals.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-white relative z-20 overflow-hidden">
        <div className="container mx-auto px-4 mb-16 max-w-5xl text-center md:text-left">
          <span className="text-secondary font-bold uppercase tracking-[0.3em] text-xs mb-2 block">Trusted by Thousands</span>
          <h2 className="text-4xl md:text-5xl font-bold text-primary italic font-serif">Featured Products</h2>
        </div>

        <div className="relative max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 py-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -10 }}
                className="glass-card group overflow-hidden flex flex-col h-full border border-accent/20 bg-white"
              >
                <div className="relative w-full aspect-[4/5] bg-bg-off-white flex items-center justify-center p-6 overflow-hidden border-b border-accent/10">
                  <div className="absolute top-4 left-4 z-10">
                    {product.tag && (
                      <span className="bg-secondary text-white px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full">
                        {product.tag}
                      </span>
                    )}
                  </div>
                  <img
                    src={product.image_url || `https://placehold.co/400x600?text=${product.name}`}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 drop-shadow-xl"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/400x600?text=Ayurveda+Product';
                    }}
                  />
                </div>

                <div className="p-8 text-center flex flex-col justify-between flex-grow">
                  <div>
                    <div className="flex justify-center gap-1 text-secondary mb-4">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <Star
                          key={starVal}
                          size={14}
                          fill={starVal <= Math.round(product.rating || 5) ? 'currentColor' : 'none'}
                          className={starVal <= Math.round(product.rating || 5) ? 'text-secondary' : 'text-primary/20'}
                        />
                      ))}
                      <span className="text-xs font-bold text-primary/40 ml-2">({product.rating || 4.5})</span>
                    </div>
                    <h3 className="text-3xl font-bold text-primary mb-2 italic font-serif">{product.name}</h3>
                    <p className="text-sm font-bold text-primary/50 mb-6 uppercase tracking-widest">
                      {product.subtitle || 'Premium Ayurvedic Care'}
                    </p>
                  </div>

                  <div>
                    <p className="text-secondary font-bold text-3xl tracking-tighter mb-8">
                      ₹{product.price}
                      {product.oldPrice && (
                        <span className="text-primary/20 text-lg line-through ml-2">₹{product.oldPrice}</span>
                      )}
                    </p>
                    <Link
                      to={`/product/${product.slug || product.name.toLowerCase().replace(/ /g, '-')}`}
                      className="btn-primary w-full inline-block !bg-primary group-hover:!bg-secondary transition-all"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <Link to="/shop" className="btn-secondary px-10">
            View All Products
          </Link>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-accent/10 rounded-full blur-[80px]" />
        </div>

        <div className="container mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Media image stack */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-secondary/20 rounded-3xl transform rotate-3 scale-105 transition-transform duration-700 hover:rotate-0" />
            <img
              src="https://images.unsplash.com/photo-1705601117024-34fd1224bbcb?q=80&w=1170&auto=format&fit=crop"
              className="rounded-3xl shadow-2xl relative z-10 object-cover w-full aspect-[4/5] md:aspect-square hover:scale-105 transition-transform duration-700"
              alt="Ayurvedic Herbs"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1540331547168-8b63109225b7?auto=format&fit=crop&q=80&w=1000';
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-8 -right-8 bg-white p-6 rounded-2xl shadow-lg z-20 items-center gap-4 hidden md:flex"
            >
              <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center text-secondary">
                <Award size={30} />
              </div>
              <div>
                <p className="font-black text-primary text-xl">100% Pure</p>
                <p className="text-xs font-bold uppercase tracking-widest text-primary/40">Guaranteed Quality</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-secondary font-bold uppercase tracking-[0.3em] text-xs mb-4 block"
            >
              Why Choose Us
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-black mb-6 leading-tight italic"
            >
              Holistic Health <br />
              <span className="text-secondary">Benefits</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/70 text-lg md:text-xl leading-relaxed mb-12 font-medium"
            >
              Experience the natural difference with our premium Ayurvedic formulations.
            </motion.p>

            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
              {[
                'Helps manage sugar levels',
                'Supports natural fat reduction',
                'Detoxifies the body',
                'Supports heart health',
                'Improves digestion',
                'Boosts daily energy',
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 group cursor-default"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors duration-300 flex-shrink-0">
                    <Check size={16} />
                  </div>
                  <span className="font-bold text-white/90 group-hover:text-white transition-colors">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-14"
            >
              <Link
                to="/shop"
                className="btn-secondary w-full sm:w-auto inline-flex justify-center items-center gap-3 group !text-white !border-white/20 hover:!bg-white hover:!text-primary transition-all"
              >
                Start Your Journey <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-bg-off-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="text-center mb-16">
            <span className="text-secondary font-bold uppercase tracking-[0.3em] text-xs mb-4 block">Got Questions?</span>
            <h2 className="text-4xl md:text-5xl font-black text-primary italic mb-6">Frequently Asked Questions</h2>
            <p className="text-primary/60 text-lg max-w-2xl mx-auto font-medium">
              Everything you need to know about our Ayurvedic formulations and how they can benefit your health journey.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-accent/20 shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 md:px-8 text-left focus:outline-none"
                >
                  <span
                    className={`font-bold text-lg pr-4 transition-colors ${
                      activeFaq === index ? 'text-secondary' : 'text-primary group-hover:text-secondary'
                    }`}
                  >
                    {index + 1}. {faq.q}
                  </span>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      activeFaq === index
                        ? 'bg-secondary text-white'
                        : 'bg-primary/5 text-primary group-hover:bg-secondary/10 group-hover:text-secondary'
                    }`}
                  >
                    <ChevronDown
                      size={20}
                      className={`transform transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="p-6 md:px-8 pt-0 text-primary/70 leading-relaxed font-medium">
                        <div className="h-px w-full bg-gradient-to-r from-primary/10 to-transparent mb-6" />
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center"
          >
            <p className="text-primary/60 mb-4 font-bold">Still have questions?</p>
            <Link to="/contact" className="text-secondary font-bold hover:underline inline-flex items-center gap-2">
              Contact our support team <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-secondary font-bold uppercase tracking-[0.3em] text-xs mb-4 block">Real Stories</span>
            <h2 className="text-4xl md:text-5xl font-black text-primary italic mb-6">
              Customer <span className="text-secondary">Testimonials</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {testimonials.length === 0 ? (
              <div className="col-span-2 text-center py-16 text-primary/40 bg-bg-off-white rounded-3xl border border-primary/5">
                <Star size={40} className="mx-auto mb-4 opacity-20" />
                <p className="font-bold">Customer testimonials will appear here once added from the admin panel.</p>
              </div>
            ) : (
              testimonials
                .filter((t) => t.is_active)
                .map((t) => (
                  <motion.div
                    key={t.id}
                    whileHover={{ y: -10 }}
                    className="bg-bg-off-white rounded-3xl overflow-hidden shadow-lg border border-primary/5 group flex flex-col"
                  >
                    <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                      {renderTestimonialMedia(t.video_url, t.customer_name)}
                    </div>
                    <div className="p-8 text-center flex-1 flex flex-col justify-center">
                      <div className="flex justify-center text-secondary mb-4">
                        {[1, 2, 3, 4, 5].map((starVal) => (
                          <Star
                            key={starVal}
                            size={16}
                            fill={starVal <= (t.rating || 5) ? 'currentColor' : 'none'}
                            className={starVal <= (t.rating || 5) ? 'text-secondary' : 'text-primary/20'}
                          />
                        ))}
                      </div>
                      {t.caption && <p className="text-primary/70 italic mb-4 text-sm">"{t.caption}"</p>}
                      <div className="w-12 h-1 bg-secondary mx-auto rounded-full mb-4" />
                      <p className="font-bold text-primary text-lg">{t.customer_name}</p>
                      <p className="text-xs text-secondary font-bold uppercase tracking-widest mt-1">Verified Customer</p>
                    </div>
                  </motion.div>
                ))
            )}
          </div>
        </div>
      </section>

      {/* Blog/Journal Section */}
      <section className="py-32 bg-bg-warm relative overflow-hidden">
        <div className="absolute top-20 right-0 opacity-5 pointer-events-none">
          <Leaf size={400} className="text-secondary rotate-45" />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-20 border-b border-primary/10 pb-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-secondary font-bold uppercase tracking-[0.3em] text-xs mb-4 flex items-center gap-2">
                <div className="w-8 h-[1px] bg-secondary" /> Our Journal
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-primary italic leading-tight">
                Ayurvedic <span className="text-secondary">Insights</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Link
                to="/blog"
                className="group flex items-center gap-3 text-primary font-bold hover:text-secondary transition-colors"
              >
                <span>Explore Library</span>
                <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center group-hover:border-secondary transition-colors">
                  <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {blogs.length === 0 ? (
              <div className="col-span-2 text-center py-16 text-primary/40 bg-white rounded-3xl shadow-sm border border-primary/5">
                <p className="font-bold">Blog posts will appear here once published from the admin panel.</p>
              </div>
            ) : (
              blogs.map((blog, idx) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="group bg-white rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500 border border-transparent hover:border-secondary/20 flex flex-col"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={blog.featured_image || 'https://images.unsplash.com/photo-1540331547168-8b63109225b7?auto=format&fit=crop&q=80&w=800'}
                      alt={blog.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1540331547168-8b63109225b7?auto=format&fit=crop&q=80&w=800';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  <div className="p-10 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-6 text-xs font-bold text-primary/40 uppercase tracking-widest mb-6">
                        <span className="flex items-center gap-2">
                          <Calendar size={14} className="text-secondary" />
                          {new Date(blog.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-2">
                          <User size={14} className="text-secondary" />
                          {blog.author_name || 'Lucas Admin'}
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-primary mb-6 italic leading-tight group-hover:text-secondary transition-colors duration-300">
                        {blog.title}
                      </h3>
                    </div>

                    <Link to={`/blog/${blog.slug}`} className="inline-flex items-center gap-2 text-primary font-bold group/link mt-4">
                      <span className="relative overflow-hidden">
                        Read Article
                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-secondary transform -translate-x-[101%] group-hover/link:translate-x-0 transition-transform duration-300" />
                      </span>
                      <ArrowUpRight size={16} className="text-secondary transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
