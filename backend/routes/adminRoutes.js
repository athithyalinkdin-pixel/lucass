const express = require('express');
const router = express.Router();
const {
    getStats,
    getAllOrders, updateOrderStatus,
    getAllProducts, createProduct, updateProduct, deleteProduct,
    getAllBlogPostsAdmin, createBlogPost, updateBlogPost, deleteBlogPost,
    getMessages, markMessageRead,
    getAllTestimonialsAdmin, createTestimonial, updateTestimonial, deleteTestimonial,
    getAllUsersAdmin, updateUserRole, createUserAdmin,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes require authentication AND admin role
router.use(protect);
router.use(admin);

// ── Stats ──────────────────────────────────────────
router.get('/stats', getStats);

// ── Orders ─────────────────────────────────────────
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// ── Products ───────────────────────────────────────
router.get('/products', getAllProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// ── Blog Posts ─────────────────────────────────────
router.get('/blog', getAllBlogPostsAdmin);
router.post('/blog', createBlogPost);
router.put('/blog/:id', updateBlogPost);
router.delete('/blog/:id', deleteBlogPost);

// ── Contact Messages ───────────────────────────────
router.get('/messages', getMessages);
router.put('/messages/:id/read', markMessageRead);

// ── Testimonials ───────────────────────────────────
router.get('/testimonials', getAllTestimonialsAdmin);
router.post('/testimonials', createTestimonial);
router.put('/testimonials/:id', updateTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);

// ── Users ──────────────────────────────────────────
router.get('/users', getAllUsersAdmin);
router.post('/users', createUserAdmin);
router.put('/users/:id/role', updateUserRole);

// ── Uploads ──────────────────────────────────────────
router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ success: true, url });
});

module.exports = router;
