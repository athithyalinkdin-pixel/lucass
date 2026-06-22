const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { generateToken } = require('../utils/auth');
const { z } = require('zod');

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional()
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const validated = registerSchema.parse(req.body);
        const { name, email, password, phone } = validated;

        // Check if user exists
        const [existing] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, phone || null]
        );

        if (result.insertId) {
            const token = generateToken(res, result.insertId, 'user');
            res.status(201).json({
                id: result.insertId,
                name,
                email,
                role: 'user',
                token
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Error:', error.message);
        res.status(400).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Registration failed' : error.message 
        });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const validated = loginSchema.parse(req.body);
        const { email, password } = validated;

        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = generateToken(res, user.id, user.role);
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error:', error.message);
        res.status(400).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Login failed' : error.message 
        });
    }
};

const logoutUser = (req, res) => {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('jwt', '', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const [users] = await pool.execute('SELECT id, name, email, role, phone FROM users WHERE id = ?', [req.user.id]);
    const user = users[0];

    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile
};
