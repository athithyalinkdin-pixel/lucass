import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, ChevronLeft, Share2 } from 'lucide-react';
import api from '../services/api';
import DOMPurify from 'dompurify';

const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/blog/${slug}`);
        setPost(data);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        // Fallback
        setPost({
          title: "Understanding Ayurveda for Modern Life",
          slug: "understanding-ayurveda",
          content: "<p>Ayurveda is an ancient health system from India that focuses on balance between body, mind, and spirit. In today's fast-paced world, Ayurvedic principles are more relevant than ever.</p><h3>The Three Doshas</h3><p>Vata, Pitta, and Kapha are the three energies that govern our physiology. Understanding your dominant dosha can help you make better lifestyle choices...</p>",
          created_at: new Date().toISOString(),
          author_name: "Dr. Lucas",
          featured_image: null
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) return <div className="pt-48 text-center min-h-screen">Loading Post...</div>;
  if (!post) return <div className="pt-48 text-center min-h-screen">Post Not Found</div>;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "image": [post.featured_image || "https://example.com/placeholder.jpg"],
    "datePublished": post.created_at,
    "author": [{
      "@type": "Person",
      "name": post.author_name
    }]
  };

  return (
    <div className="pt-32 pb-24 bg-bg-off-white min-h-screen">
      <Helmet>
        <title>{post.title} | Lucas Agro Blog</title>
        <meta name="description" content={post.title} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <Link to="/blog" className="inline-flex items-center text-primary/60 hover:text-secondary mb-12 transition-colors">
          <ChevronLeft size={20} />
          <span>Back to Blog</span>
        </Link>

        <article>
          <header className="mb-12">
            <div className="flex items-center space-x-4 mb-6 text-sm font-bold text-secondary uppercase tracking-widest">
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                {new Date(post.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <User size={16} />
                {post.author_name}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-8 italic leading-[1.1]">
              {post.title}
            </h1>
            <div className="aspect-video bg-accent/10 rounded-[2.5rem] overflow-hidden mb-12 relative">
               {post.featured_image ? (
                 <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
               ) : (
                 <div className="absolute inset-0 flex items-center justify-center text-primary/5">
                    <Calendar size={200} />
                 </div>
               )}
            </div>
          </header>

          <div 
            className="prose prose-lg prose-primary max-w-none text-primary/80 leading-relaxed 
                       [&>p]:mb-6 [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-primary [&>h3]:mt-10 [&>h3]:mb-4"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />

          <footer className="mt-16 pt-12 border-t border-accent flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white">
                <User />
              </div>
              <div>
                <p className="font-bold text-primary">{post.author_name}</p>
                <p className="text-xs text-primary/40 uppercase tracking-widest font-bold">Author & Wellness Expert</p>
              </div>
            </div>
            <button className="flex items-center gap-2 text-primary font-bold hover:text-secondary transition-colors">
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
