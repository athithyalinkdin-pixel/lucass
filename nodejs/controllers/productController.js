const pool = require('../config/db');
const { z } = require('zod');

const productSchema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    price: z.number().positive(),
    stock: z.number().int().nonnegative(),
    description: z.string().optional(),
    image_url: z.string().url().optional(),
    category_id: z.number().int().optional()
});

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const [products] = await pool.execute(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.is_active = TRUE
        `);
        res.json(products);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    }
};

// @desc    Fetch single product by slug
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = async (req, res) => {
    try {
        const [products] = await pool.execute(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.slug = ? AND p.is_active = TRUE
        `, [req.params.slug]);
        
        const product = products[0];
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch all categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const [categories] = await pool.execute('SELECT * FROM categories ORDER BY name');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductBySlug,
    getCategories
};
