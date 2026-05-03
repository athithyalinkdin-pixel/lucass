const pool = require('../config/db');
const { z } = require('zod');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// @desc    Fetch all published blog posts
// @route   GET /api/blog
// @access  Public
const getBlogPosts = async (req, res) => {
    try {
        const [posts] = await pool.execute(`
            SELECT b.*, u.name as author_name 
            FROM blog_posts b 
            LEFT JOIN users u ON b.author_id = u.id 
            WHERE b.is_published = TRUE 
            ORDER BY b.created_at DESC
        `);
        res.json(posts);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    }
};

// @desc    Fetch single blog post by slug
// @route   GET /api/blog/:slug
// @access  Public
const getPostBySlug = async (req, res) => {
    try {
        const [posts] = await pool.execute(`
            SELECT b.*, u.name as author_name 
            FROM blog_posts b 
            LEFT JOIN users u ON b.author_id = u.id 
            WHERE b.slug = ? AND b.is_published = TRUE
        `, [req.params.slug]);

        const post = posts[0];
        if (post) {
            // Ensure content is sanitized if being sent as HTML (though usually done on frontend)
            // post.content = DOMPurify.sanitize(post.content);
            res.json(post);
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getBlogPosts,
    getPostBySlug
};
