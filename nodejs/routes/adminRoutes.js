const express = require('express');
const router = express.Router();
const {
    getStats,
    getAllOrders, updateOrderStatus,
    getAllProducts, createProduct, updateProduct, deleteProduct,
    getAllBlogPostsAdmin, createBlogPost, updateBlogPost, deleteBlogPost,
    getMessages, markMessageRead,
    getAllTestimonialsAdmin, createTestimonial, updateTestimonial, deleteTestimonial,
    getAllUsers, updateUserRole, deleteUser,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All routes require authentication AND admin role
router.use(protect);
router.use(admin);

// ── File Upload Configuration ──────────────────────
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit to support video files
    }
});

router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ success: true, url: fileUrl });
});

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

// ── Users & Roles ──────────────────────────────────
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
