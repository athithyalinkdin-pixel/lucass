import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import api from '../services/api';

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await api.get(`/blog/${slug}`);
        setBlog(data);
      } catch (err) {
        console.error('Error fetching blog post, using fallback:', err);
        // Fallback blog post if API is not running
        setBlog({
          title: 'Understanding Ayurveda for Modern Life',
          slug: 'understanding-ayurveda',
          content: `
            <p>Ayurveda is an ancient health system from India that focuses on balance between body, mind, and spirit. In today's fast-paced world, Ayurvedic principles are more relevant than ever.</p>
            <h3>The Three Doshas</h3>
            <p>Vata, Pitta, and Kapha are the three energies that govern our physiology. Understanding your dominant dosha can help you make better lifestyle choices and align your diet and exercise routines with your unique biological makeup.</p>
            <h3>A Daily Routine (Dinacharya)</h3>
            <p>One of the most powerful aspects of Ayurveda is the daily routine. Waking up early, consuming pure herbal extracts like Avaram Poo or Amala, and eating meals at standard times can drastically improve digestion, manage stress, and boot energy levels.</p>
          `,
          created_at: new Date().toISOString(),
          author_name: 'Dr. Lucas',
          featured_image: null,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-48 text-center min-h-screen text-primary font-bold">
        Loading Post...
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="pt-48 text-center min-h-screen text-primary font-bold">
        Post Not Found
      </div>
    );
  }

  // Schema.org Structured Data
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    image: [blog.featured_image || 'https://example.com/placeholder.jpg'],
    datePublished: blog.created_at,
    author: [
      {
        '@type': 'Person',
        name: blog.author_name || 'Lucas Admin',
      },
    ],
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="pt-32 pb-24 bg-bg-off-white min-h-screen">
      <Helmet>
        <title>{blog.title} | Lucas Agro Blog</title>
        <meta name="description" content={blog.title} />
        <script type="application/ld+json">{JSON.stringify(schemaMarkup)}</script>
      </Helmet>

      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        {/* Back Link */}
        <Link
          to="/blog"
          className="inline-flex items-center text-primary/60 hover:text-secondary mb-12 transition-colors gap-2"
        >
          <ArrowLeft size={20} />
          <span className="font-bold">Back to Blog</span>
        </Link>

        {/* Blog Article */}
        <article>
          <header className="mb-12">
            <div className="flex items-center space-x-4 mb-6 text-sm font-bold text-secondary uppercase tracking-widest">
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                {new Date(blog.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1">
                <User size={16} />
                {blog.author_name || 'Lucas Admin'}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-8 italic leading-[1.1] font-serif">
              {blog.title}
            </h1>
            <div className="aspect-video bg-accent/10 rounded-[2.5rem] overflow-hidden mb-12 relative flex items-center justify-center">
              {blog.featured_image ? (
                <img src={blog.featured_image} alt={blog.title} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-primary/5">
                  <Calendar size={200} />
                </div>
              )}
            </div>
          </header>

          {/* Article Content */}
          <div
            className="prose prose-lg prose-primary max-w-none text-primary/80 leading-relaxed 
                        [&>p]:mb-6 [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-primary [&>h3]:mt-10 [&>h3]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }}
          />

          {/* Article Footer */}
          <footer className="mt-16 pt-12 border-t border-accent flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white">
                <User />
              </div>
              <div>
                <p className="font-bold text-primary">{blog.author_name || 'Lucas Admin'}</p>
                <p className="text-xs text-primary/40 uppercase tracking-widest font-bold">
                  Author & Wellness Expert
                </p>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-primary font-bold hover:text-secondary transition-colors"
            >
              <Share2 size={20} />
              <span>Share Article</span>
            </button>
          </footer>
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;
