const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { initDatabase } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Permissive CORS & Request Logging
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Bypass-Tunnel-Reminder, ngrok-skip-browser-warning');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
});
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// 1. Static file serving: Uploads from backend
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));
app.use('/uploads', express.static(path.join(publicDir, 'uploads')));

// 2. Static file serving: Frontend assets (index.html, pages, css, js, etc.)
const frontendDir = path.join(__dirname, '../frontend');
app.use(express.static(frontendDir));
app.use('/pages', express.static(path.join(frontendDir, 'pages')));
app.use('/css', express.static(path.join(frontendDir, 'css')));
app.use('/js', express.static(path.join(frontendDir, 'js')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'online',
        app: 'ProjectHub - Mini Project Showcase Portal',
        database: 'MySQL 8.0',
        timestamp: new Date().toISOString()
    });
});

// Explicit Root Route -> Frontend Index
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendDir, 'index.html'));
});

// Start Server and Database
async function startServer() {
    try {
        await initDatabase();
        app.listen(PORT, () => {
            console.log(`====================================================`);
            console.log(`🚀 ProjectHub Showcase Portal is running!`);
            console.log(`💻 Local access (Your Laptop):     http://localhost:${PORT}`);
            console.log(`🌐 Network access (Other Laptops): http://192.168.137.222:${PORT}`);
            console.log(`📡 MySQL Database: Connected (project_showcase)`);
            console.log(`====================================================`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
}

startServer();
