const pool = require('../config/db');

// @desc    Get all active testimonials (public)
// @route   GET /api/testimonials
// @access  Public
const getActiveTestimonials = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM testimonials WHERE is_active = TRUE ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    }
};

module.exports = { getActiveTestimonials };
