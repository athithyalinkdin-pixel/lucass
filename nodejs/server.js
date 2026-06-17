const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const blogRoutes = require('./routes/blogRoutes');
const adminRoutes    = require('./routes/adminRoutes');
const contactRoutes  = require('./routes/contactRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy for rate-limiting (Render, etc.)
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Basic Route (Fallback for API testing)
app.get('/api-status', (req, res) => {
    res.send('Lucas Agro & Naturals API is running...');
});

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/testimonials', testimonialRoutes);

// Serve Static Frontend (Production Deployment)
// NOTE: Commented out for Hostinger Shared Hosting as frontend is uploaded to public_html separately.
/*
if (process.env.NODE_ENV === 'production') {
    // Serve static files from the frontend's dist folder
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    // For any other route, send the index.html file so React Router handles the routing
    app.get('*', (req, res) => {
        // res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
    });
}
*/

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
