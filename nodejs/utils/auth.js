const jwt = require('jsonwebtoken');

// Ensure the JWT secret is defined at runtime
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const generateToken = (res, userId, role) => {
    const token = jwt.sign({ id: userId, role }, JWT_SECRET, {
        expiresIn: '30d'
    });

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    return token;
};

module.exports = { generateToken };
