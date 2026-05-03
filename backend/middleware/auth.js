const jwt = require('jsonwebtoken');

// Ensure the JWT secret is defined at runtime
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const protect = async (req, res, next) => {
    let token;
    token = req.cookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const pool = require('../config/db');
            const [users] = await pool.execute('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
            
            if (users.length === 0) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            
            req.user = users[0];
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
