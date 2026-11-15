const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'project_showcase_jwt_secret_hackathon_2026_key';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') 
        ? authHeader.split(' ')[1] 
        : req.headers['x-access-token'];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication required. Please login.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { userId, name, email, role }
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
    }
}

function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') 
        ? authHeader.split(' ')[1] 
        : req.headers['x-access-token'];

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        } catch (e) {
            // Token invalid, proceed as guest
        }
    }
    next();
}

function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
        
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Access denied. Requires role: ${roles.join(' or ')}.` 
            });
        }
        next();
    };
}

module.exports = {
    authenticateToken,
    optionalAuth,
    requireRole
};
