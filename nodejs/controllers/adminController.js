const pool = require('../config/db');
const { z } = require('zod');

// ============================================================
// Utility: Auto-generate slug from name
// ============================================================
const generateSlug = (name) =>
    name.toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

// ============================================================
// DASHBOARD STATS
// ============================================================
const getStats = async (req, res) => {
    try {
        const [sales]    = await pool.execute('SELECT SUM(total_amount) as total FROM orders WHERE status != "cancelled"');
        const [orders]   = await pool.execute('SELECT COUNT(*) as count FROM orders');
        const [products] = await pool.execute('SELECT COUNT(*) as count FROM products');
        const [users]    = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = "user"');
        const [unread]   = await pool.execute('SELECT COUNT(*) as count FROM contact_messages WHERE is_read = FALSE');

        res.json({
            totalSales:    sales[0].total || 0,
            totalOrders:   orders[0].count,
            totalProducts: products[0].count,
            totalUsers:    users[0].count,
            unreadMessages: unread[0].count,
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    }
};

// ============================================================
// ORDERS
// ============================================================
const getAllOrders = async (req, res) => {
    try {
        const [orders] = await pool.execute(`
            SELECT o.*, u.name as customer_name, u.email as customer_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `);
        res.json(orders);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    }
};

const orderStatusSchema = z.object({
    status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']),
});

const updateOrderStatus = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { status } = orderStatusSchema.parse(req.body);
        const orderId = req.params.id;

        // Fetch current order status to prevent double stock recovery
        const [orders] = await connection.execute('SELECT status FROM orders WHERE id = ?', [orderId]);
        if (orders.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const currentStatus = orders[0].status;

        // Update status
        await connection.execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);

        // If transitioning to cancelled from a non-cancelled state, restore stock
        if (status === 'cancelled' && currentStatus !== 'cancelled') {
            const [items] = await connection.execute('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId]);
            for (const item of items) {
                await connection.execute(
                    'UPDATE products SET stock = stock + ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }
        }

        await connection.commit();
        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating order status:', error.message);
        if (error instanceof z.ZodError) return res.status(400).json({ message: error.errors[0].message });
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};

// ============================================================
// PRODUCTS
// ============================================================
const productSchema = z.object({
    name:           z.string().min(2).max(255),
    price:          z.number().positive(),
    original_price: z.number().positive().nullable().optional(),
    shipping_cost:  z.number().min(0).optional().default(0.00),
    stock:          z.number().int().min(0),
    description:    z.string().min(5),
    ingredients:    z.string().optional().nullable(),
    benefits:       z.string().optional().nullable(),
    offers:         z.string().optional().nullable(),
    image_url:      z.string().url().optional().nullable().or(z.literal('')),
    subtitle:       z.string().optional().nullable(),
    rating:         z.number().min(1).max(5).optional().default(4.5),
    tag:            z.string().optional().nullable(),
    category_id:    z.number().int().positive(),
    is_active:      z.boolean().optional().default(true),
    is_featured:    z.boolean().optional().default(false),
});

const getAllProducts = async (req, res) => {
    try {
        const [products] = await pool.execute(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            ORDER BY p.created_at DESC
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

const createProduct = async (req, res) => {
    try {
        const data = productSchema.parse({
            ...req.body,
            price:          parseFloat(req.body.price),
            original_price: req.body.original_price ? parseFloat(req.body.original_price) : null,
            shipping_cost:  req.body.shipping_cost ? parseFloat(req.body.shipping_cost) : 0.00,
            stock:          parseInt(req.body.stock),
            category_id:    parseInt(req.body.category_id),
            rating:         req.body.rating ? parseFloat(req.body.rating) : 4.5,
            is_active:      req.body.is_active === 'true' || req.body.is_active === true,
            is_featured:    req.body.is_featured === 'true' || req.body.is_featured === true,
        });

        const slug = generateSlug(data.name);

        const [result] = await pool.execute(
            `INSERT INTO products 
            (name, slug, price, original_price, shipping_cost, stock, description, ingredients, benefits, offers, image_url, subtitle, rating, tag, category_id, is_active, is_featured) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [data.name, slug, data.price, data.original_price, data.shipping_cost, data.stock, data.description,
             data.ingredients, data.benefits, data.offers, data.image_url, data.subtitle, data.rating, data.tag, data.category_id, data.is_active, data.is_featured]
        );

        res.status(201).json({ id: result.insertId, message: 'Product created' });
    } catch (error) {
        console.error('Error:', error.message);
        if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: error.errors[0].message });
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'A product with this name already exists.' });
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const data = productSchema.parse({
            ...req.body,
            price:          parseFloat(req.body.price),
            original_price: req.body.original_price ? parseFloat(req.body.original_price) : null,
            shipping_cost:  req.body.shipping_cost ? parseFloat(req.body.shipping_cost) : 0.00,
            stock:          parseInt(req.body.stock),
            category_id:    parseInt(req.body.category_id),
            rating:         req.body.rating ? parseFloat(req.body.rating) : 4.5,
            is_active:      req.body.is_active === 'true' || req.body.is_active === true,
            is_featured:    req.body.is_featured === 'true' || req.body.is_featured === true,
        });

        await pool.execute(
            `UPDATE products SET 
            name=?, price=?, original_price=?, shipping_cost=?, stock=?, description=?, ingredients=?, 
            benefits=?, offers=?, image_url=?, subtitle=?, rating=?, tag=?, category_id=?, is_active=?, is_featured=?
            WHERE id=?`,
            [data.name, data.price, data.original_price, data.shipping_cost, data.stock, data.description,
             data.ingredients, data.benefits, data.offers, data.image_url, data.subtitle,
             data.rating, data.tag, data.category_id, data.is_active, data.is_featured, req.params.id]
        );

        res.json({ message: 'Product updated' });
    } catch (error) {
        console.error('Error:', error.message);
        if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: error.errors[0].message });
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product removed' });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    }
};

// ============================================================
// BLOG POSTS
// ============================================================
const blogPostSchema = z.object({
    title:           z.string().min(3).max(255),
    content:         z.string().min(10),
    featured_image:  z.string().url().optional().nullable().or(z.literal('')),
    is_published:    z.boolean().optional().default(false),
});

const getAllBlogPostsAdmin = async (req, res) => {
    try {
        const [posts] = await pool.execute(`
            SELECT b.*, u.name as author_name 
            FROM blog_posts b 
            LEFT JOIN users u ON b.author_id = u.id 
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

const createBlogPost = async (req, res) => {
    try {
        const data = blogPostSchema.parse(req.body);
        const slug = generateSlug(data.title) + '-' + Date.now();

        const [result] = await pool.execute(
            'INSERT INTO blog_posts (title, slug, content, featured_image, author_id, is_published) VALUES (?, ?, ?, ?, ?, ?)',
            [data.title, slug, data.content, data.featured_image, req.user.id, data.is_published]
        );

        res.status(201).json({ id: result.insertId, message: 'Blog post created' });
    } catch (error) {
        console.error('Error:', error.message);
        if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: error.errors[0].message });
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    }
};

const updateBlogPost = async (req, res) => {
    try {
        const data = blogPostSchema.parse(req.body);

        await pool.execute(
            'UPDATE blog_posts SET title=?, content=?, featured_image=?, is_published=? WHERE id=?',
            [data.title, data.content, data.featured_image, data.is_published, req.params.id]
        );

        res.json({ message: 'Blog post updated' });
    } catch (error) {
        console.error('Error:', error.message);
        if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: error.errors[0].message });
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    }
};

const deleteBlogPost = async (req, res) => {
    try {
        await pool.execute('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);
        res.json({ message: 'Blog post deleted' });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    }
};

// ============================================================
// CONTACT MESSAGES
// ============================================================
const getMessages = async (req, res) => {
    try {
        const [messages] = await pool.execute('SELECT * FROM contact_messages ORDER BY is_read ASC, created_at DESC');
        res.json(messages);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    }
};

const markMessageRead = async (req, res) => {
    try {
        await pool.execute('UPDATE contact_messages SET is_read = TRUE WHERE id = ?', [req.params.id]);
        res.json({ message: 'Marked as read' });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    }
};

// ============================================================
// TESTIMONIALS
// ============================================================
const testimonialSchema = z.object({
    customer_name: z.string().min(2).max(255),
    video_url:     z.string().url('Please enter a valid video URL (YouTube embed or direct link)').optional().nullable().or(z.literal('')),
    rating:        z.number().int().min(1).max(5).default(5),
    caption:       z.string().max(500).optional().nullable(),
    is_active:     z.boolean().optional().default(true),
});

const getAllTestimonialsAdmin = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM testimonials ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    }
};

const createTestimonial = async (req, res) => {
    try {
        const data = testimonialSchema.parse({
            ...req.body,
            rating: parseInt(req.body.rating),
            is_active: req.body.is_active === 'true' || req.body.is_active === true || req.body.is_active === 1 || req.body.is_active === '1',
        });

        const [result] = await pool.execute(
            'INSERT INTO testimonials (customer_name, video_url, rating, caption, is_active) VALUES (?, ?, ?, ?, ?)',
            [data.customer_name, data.video_url, data.rating, data.caption, data.is_active]
        );

        res.status(201).json({ id: result.insertId, message: 'Testimonial added' });
    } catch (error) {
        console.error('Error:', error.message);
        if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: error.errors[0].message });
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    }
};

const updateTestimonial = async (req, res) => {
    try {
        const data = testimonialSchema.parse({
            ...req.body,
            rating: parseInt(req.body.rating),
            is_active: req.body.is_active === 'true' || req.body.is_active === true || req.body.is_active === 1 || req.body.is_active === '1',
        });

        await pool.execute(
            'UPDATE testimonials SET customer_name=?, video_url=?, rating=?, caption=?, is_active=? WHERE id=?',
            [data.customer_name, data.video_url, data.rating, data.caption, data.is_active, req.params.id]
        );

        res.json({ message: 'Testimonial updated' });
    } catch (error) {
        console.error('Error:', error.message);
        if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: error.errors[0].message });
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    }
};

const deleteTestimonial = async (req, res) => {
    try {
        await pool.execute('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
        res.json({ message: 'Testimonial deleted' });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    }
};

// ============================================================
// USERS & ROLES
// ============================================================
const getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.execute('SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    }
};

const userRoleSchema = z.object({
    role: z.enum(['user', 'admin']),
});

const updateUserRole = async (req, res) => {
    try {
        const { role } = userRoleSchema.parse(req.body);
        if (req.user.id === parseInt(req.params.id)) {
            return res.status(400).json({ message: 'You cannot change your own role' });
        }
        await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        res.json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error('Error:', error.message);
        if (error instanceof z.ZodError) return res.status(400).json({ message: error.errors[0].message });
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        if (req.user.id === parseInt(req.params.id)) {
            return res.status(400).json({ message: 'You cannot delete yourself' });
        }
        await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    }
};

module.exports = {
    getStats,
    getAllOrders, updateOrderStatus,
    getAllProducts, createProduct, updateProduct, deleteProduct,
    getAllBlogPostsAdmin, createBlogPost, updateBlogPost, deleteBlogPost,
    getMessages, markMessageRead,
    getAllTestimonialsAdmin, createTestimonial, updateTestimonial, deleteTestimonial,
    getAllUsers, updateUserRole, deleteUser,
};
