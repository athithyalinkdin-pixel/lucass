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

const saveLocally = (req, res) => {
    const uploadPath = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(req.file.originalname) || '.png';
    const filename = uniqueSuffix + ext;
    const destPath = path.join(uploadPath, filename);
    
    fs.writeFileSync(destPath, req.file.buffer);
    
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    return res.json({ success: true, url: fileUrl, fallback: true });
};

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
            console.warn('Hostinger upload failed, falling back to local storage:', errorText.substring(0, 500));
            return saveLocally(req, res);
        }

        const data = await response.json();
        if (data && data.success) {
            return res.json({ success: true, url: data.url });
        } else {
            console.warn('Hostinger uploader returned success:false, falling back to local storage:', data.message);
            return saveLocally(req, res);
        }
    } catch (error) {
        console.warn('Error forwarding file to Hostinger, falling back to local storage:', error.message);
        try {
            return saveLocally(req, res);
        } catch (localError) {
            return res.status(500).json({
                success: false,
                message: 'Upload failed on both Hostinger and local storage fallback.',
                error: localError.message
            });
        }
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
