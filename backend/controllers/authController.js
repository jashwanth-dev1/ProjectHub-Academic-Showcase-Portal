const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'project_showcase_jwt_secret_hackathon_2026_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Register User (Student or Faculty)
 * POST /api/auth/register
 */
async function register(req, res) {
    try {
        const { name, email, password, role } = req.body;
        console.log(`[AUTH REGISTER] Attempt: name=${name}, email=${email}, role=${role}`);

        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields (name, email, password) are required.' 
            });
        }

        // Validate role: default to student if not provided
        const userRole = (role && (role.toLowerCase() === 'faculty' || role.toLowerCase() === 'student'))
            ? role.toLowerCase() 
            : 'student';

        const pool = getPool();

        // Check if user already exists
        const [existing] = await pool.query('SELECT userId FROM users WHERE email = ?', [email.trim().toLowerCase()]);
        if (existing.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: 'An account with this email address already exists. Please log in.' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const [result] = await pool.query(
            'INSERT INTO users (name, role, email, password) VALUES (?, ?, ?, ?)',
            [name.trim(), userRole, email.trim().toLowerCase(), hashedPassword]
        );

        const newUserId = result.insertId;

        // Create JWT token
        const token = jwt.sign(
            { userId: newUserId, name: name.trim(), email: email.trim().toLowerCase(), role: userRole },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(201).json({
            success: true,
            message: `Account created successfully as ${userRole}.`,
            token,
            user: {
                userId: newUserId,
                name: name.trim(),
                email: email.trim().toLowerCase(),
                role: userRole
            }
        });

    } catch (error) {
        console.error('[Auth Register Error]:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error during registration. Please try again.' 
        });
    }
}

/**
 * Login User (Student or Faculty)
 * POST /api/auth/login
 */
async function login(req, res) {
    try {
        const { email, password, role } = req.body;
        console.log(`[AUTH LOGIN] Attempt: email=${email}, role=${role}`);

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required.' 
            });
        }

        const pool = getPool();

        // Find user by email
        const [rows] = await pool.query(
            'SELECT userId, name, email, password, role FROM users WHERE email = ?',
            [email.trim().toLowerCase()]
        );

        if (rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password.' 
            });
        }

        const user = rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password.' 
            });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.userId, name: user.name, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(200).json({
            success: true,
            message: `Welcome back, ${user.name}!`,
            token,
            user: {
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('[Auth Login Error]:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error during login. Please try again.' 
        });
    }
}

/**
 * Get Current Logged-in User
 * GET /api/auth/me
 */
async function getCurrentUser(req, res) {
    try {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT userId, name, email, role, created_at FROM users WHERE userId = ?',
            [req.user.userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        return res.json({
            success: true,
            user: rows[0]
        });
    } catch (error) {
        console.error('[Get Current User Error]:', error);
        return res.status(500).json({ success: false, message: 'Server error retrieving user data.' });
    }
}

module.exports = {
    register,
    login,
    getCurrentUser
};
