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

    const isProduction = process.env.NODE_ENV === 'production';
    const sameSite = process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax');

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: isProduction || sameSite === 'none',
        sameSite,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
};

module.exports = { generateToken };
