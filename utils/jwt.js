const jwt = require("jsonwebtoken");

// ========================================
// Generate JWT Token
// ========================================

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};

// ========================================
// Verify JWT Token
// ========================================

const verifyToken = (token) => {
    return jwt.verify(
        token,
        process.env.JWT_SECRET
    );
};

// ========================================
// Decode JWT (Without Verification)
// ========================================

const decodeToken = (token) => {
    return jwt.decode(token);
};

module.exports = {
    generateToken,
    verifyToken,
    decodeToken
};