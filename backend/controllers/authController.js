const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { generateToken } = require('../utils/auth');
const { z } = require('zod');

const registerSchema = z.object({
    name: z.string().trim().min(2),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(6),
    phone: z.string().trim().optional(),
    adminSecret: z.string().optional()
});

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string()
});

const validationMessage = (error) => error.issues?.[0]?.message || error.errors?.[0]?.message || error.message;

const publicAuthErrorMessage = (fallback, error) => {
    if (process.env.NODE_ENV !== 'production') return validationMessage(error);

    if (error.code === 'ER_NO_SUCH_TABLE') {
        return 'Database tables are missing. Import backend/schema.sql in phpMyAdmin.';
    }

    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        return 'Database login failed. Check DB_USER and DB_PASSWORD in Render environment variables.';
    }

    if (['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ER_DBACCESS_DENIED_ERROR'].includes(error.code)) {
        return 'Database connection failed. Check DB_HOST, DB_NAME, and Remote MySQL access.';
    }

    if (error.code === 'ER_DUP_ENTRY') {
        return 'User already exists';
    }

    return fallback;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const validated = registerSchema.parse(req.body);
        const { name, email, password, phone, adminSecret } = validated;

        // Determine role based on secret
        const role = adminSecret === 'lucasadmin123' ? 'admin' : 'user';

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
            'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone || null, role]
        );

        if (result.insertId) {
            generateToken(res, result.insertId, role);
            res.status(201).json({
                id: result.insertId,
                name,
                email,
                role: role
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration error:', validationMessage(error));
        res.status(400).json({ 
            success: false,
            message: publicAuthErrorMessage('Registration failed', error)
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
            generateToken(res, user.id, user.role);
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', validationMessage(error));
        res.status(400).json({ 
            success: false,
            message: publicAuthErrorMessage('Login failed', error)
        });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const sameSite = process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax');

    res.cookie('jwt', '', {
        httpOnly: true,
        secure: isProduction || sameSite === 'none',
        sameSite,
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
