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

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit to support video files
    }
});

router.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    try {
        const uploaderSecret = process.env.UPLOADER_SECRET || 'LucasAgroMediaUploaderSecret2026!';
        const hostingerUploadUrl = 'https://lucasagronaturals.com/upload.php';

        // Create FormData from memory buffer
        const formData = new FormData();
        const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
        formData.append('image', blob, req.file.originalname);

        const response = await fetch(hostingerUploadUrl, {
            method: 'POST',
            headers: {
                'X-Upload-Token': uploaderSecret
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hostinger upload failed:', errorText);
            return res.status(response.status).json({
                success: false,
                message: `Hostinger upload failed: ${response.statusText}`,
                details: errorText
            });
        }

        const data = await response.json();
        if (data && data.success) {
            return res.json({ success: true, url: data.url });
        } else {
            return res.status(500).json({
                success: false,
                message: data.message || 'Hostinger upload returned failure'
            });
        }
    } catch (error) {
        console.error('Error forwarding file to Hostinger:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while forwarding upload',
            error: error.message
        });
    }
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
