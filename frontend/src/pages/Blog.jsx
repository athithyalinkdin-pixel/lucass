import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { getImageUrl } from '../utils/imageHelper';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await api.get('/blog');
        setBlogs(data);
      } catch (err) {
        console.error('Error fetching blog posts, using fallbacks:', err);
        setBlogs([
          {
            id: 1,
            title: 'Understanding Ayurveda for Modern Life',
            slug: 'understanding-ayurveda',
            content: "Ayurveda is not just about medicine; it's a way of life. Originating in India over 5,000 years ago, it offers holistic wellness tips that help restore balance to your doshas (Vata, Pitta, and Kapha). Integrating simple herbal syrups and structured routines can help address fatigue, support digestive health, and enhance immune strength naturally.",
            created_at: new Date().toISOString(),
            author_name: 'Dr. Lucas',
            featured_image: null,
          },
          {
            id: 2,
            title: '5 Herbs for Natural Sugar Management',
            slug: 'herbs-for-sugar-management',
            content: 'Managing sugar levels naturally is possible with these 5 powerful herbs. Ayurveda recommends herbs like Avaram Poo (Senna auriculata), Jamun seed extract, and Gymnema Sylvestre to naturally aid glycemic balance. In this guide, we dive deep into how these ingredients improve insulin sensitivity and support heart health without side effects.',
            created_at: new Date().toISOString(),
            author_name: 'Dr. Lucas',
            featured_image: null,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const stripHtmlTags = (str) => {
    if (!str) return '';
    return str.replace(/<[^>]*>?/gm, '');
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-bg-off-white">
      <Helmet>
        <title>Health Guide | Lucas Agro & Naturals</title>
        <meta
          name="description"
          content="Explore our latest articles on Ayurveda, natural health, weight management, and sugar balance."
        />
      </Helmet>

      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 italic font-serif">
            Natural Health Guide
          </h1>
          <p className="text-primary/60 text-lg max-w-2xl mx-auto font-medium">
            Traditional wisdom meets modern science. Read our latest insights on Ayurvedic wellness.
          </p>
        </div>

        {/* Blog Posts Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-12">
            {[1, 2].map((skeleton) => (
              <div key={skeleton} className="animate-pulse bg-white rounded-3xl h-96 shadow-md" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-12">
            {blogs.map((blog, idx) => (
              <motion.article
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                key={blog.id}
                className="glass-card overflow-hidden group flex flex-col h-full"
              >
                {/* Featured Image */}
                <div className="aspect-video bg-accent/10 relative overflow-hidden flex items-center justify-center">
                  {blog.featured_image ? (
                    <img
                      src={getImageUrl(blog.featured_image)}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-primary/5">
                      <Calendar size={120} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-10 flex flex-col flex-grow">
                  <div className="flex items-center space-x-4 mb-6 text-xs font-bold text-secondary uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(blog.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {blog.author_name || 'Lucas Admin'}
                    </span>
                  </div>

                  <Link to={`/blog/${blog.slug}`}>
                    <h2 className="text-3xl font-bold text-primary mb-4 group-hover:text-secondary transition-colors italic font-serif leading-tight">
                      {blog.title}
                    </h2>
                  </Link>

                  <p className="text-primary/60 mb-8 line-clamp-3 leading-relaxed text-sm">
                    {stripHtmlTags(blog.content)}
                  </p>

                  <Link
                    to={`/blog/${blog.slug}`}
                    className="mt-auto flex items-center gap-2 text-primary font-bold group-hover:gap-4 transition-all"
                  >
                    <span>Read Article</span>
                    <ArrowRight size={20} className="text-secondary" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
