import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, ArrowRight } from 'lucide-react';
import api from '../services/api';

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await api.get('/blog');
        setPosts(data);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        // Fallback mock data
        setPosts([
          {
            id: 1,
            title: "Understanding Ayurveda for Modern Life",
            slug: "understanding-ayurveda",
            content: "Ayurveda is not just about medicine; it's a way of life...",
            created_at: new Date().toISOString(),
            author_name: "Dr. Lucas",
            featured_image: null
          },
          {
            id: 2,
            title: "5 Herbs for Natural Sugar Management",
            slug: "herbs-for-sugar-management",
            content: "Managing sugar levels naturally is possible with these 5 powerful herbs...",
            created_at: new Date().toISOString(),
            author_name: "Dr. Lucas",
            featured_image: null
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-bg-off-white">
      <Helmet>
        <title>Health Guide | Lucas Agro & Naturals</title>
        <meta name="description" content="Explore our latest articles on Ayurveda, natural health, weight management, and sugar balance." />
      </Helmet>

      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 italic">Natural Health Guide</h1>
          <p className="text-primary/60 text-lg max-w-2xl mx-auto">
            Traditional wisdom meets modern science. Read our latest insights on Ayurvedic wellness.
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-12">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-3xl h-96 shadow-premium"></div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-12">
            {posts.map((post, idx) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card overflow-hidden group flex flex-col"
              >
                <div className="aspect-video bg-accent/10 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-primary/5">
                    <Calendar size={120} />
                  </div>
                  {post.featured_image && (
                    <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  )}
                </div>
                <div className="p-10 flex flex-col flex-grow">
                  <div className="flex items-center space-x-4 mb-6 text-xs font-bold text-secondary uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {post.author_name}
                    </span>
                  </div>
                  <Link to={`/blog/${post.slug}`}>
                    <h2 className="text-3xl font-bold text-primary mb-4 group-hover:text-secondary transition-colors italic leading-tight">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-primary/60 mb-8 line-clamp-3">
                    {post.content.replace(/<[^>]*>?/gm, '')}
                  </p>
                  <Link
                    to={`/blog/${post.slug}`}
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

export default BlogList;
