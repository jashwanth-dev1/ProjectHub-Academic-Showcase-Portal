const { getPool } = require('../config/db');
const fs = require('fs');
const path = require('path');

/**
 * Add Project
 * POST /api/projects/add
 * Role: Student
 */
async function addProject(req, res) {
    try {
        const { title, description, technologies, githubLink, screenshotPath, category, batch } = req.body;
        const studentId = req.user.userId;

        if (!title || !description || !technologies || !category || !batch) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, technologies, category, and batch are required.'
            });
        }

        // If screenshotPath is a base64 image, auto-save to uploads directory
        let finalScreenshotPath = screenshotPath ? screenshotPath.trim() : null;
        if (finalScreenshotPath && finalScreenshotPath.startsWith('data:image/')) {
            try {
                const matches = finalScreenshotPath.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
                if (matches) {
                    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                    const base64Data = matches[2];
                    const uploadsDir = path.resolve(__dirname, '../public/uploads');
                    if (!fs.existsSync(uploadsDir)) {
                        fs.mkdirSync(uploadsDir, { recursive: true });
                    }
                    const safeName = `project_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
                    fs.writeFileSync(path.join(uploadsDir, safeName), Buffer.from(base64Data, 'base64'));
                    finalScreenshotPath = `/uploads/${safeName}`;
                }
            } catch (imgErr) {
                console.warn('[Screenshot Base64 Save Warning]:', imgErr.message);
            }
        }

        const pool = getPool();
        const [result] = await pool.query(
            `INSERT INTO projects 
            (title, description, technologies, githubLink, screenshotPath, category, batch, studentId, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
            [
                title.trim(),
                description.trim(),
                technologies.trim(),
                githubLink ? githubLink.trim() : null,
                finalScreenshotPath,
                category.trim(),
                batch.trim(),
                studentId
            ]
        );

        return res.status(201).json({
            success: true,
            message: 'Project submitted successfully! It is now pending faculty review.',
            projectId: result.insertId
        });
    } catch (error) {
        console.error('[Add Project Error]:', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error while submitting project.' });
    }
}

/**
 * Get All Approved Projects (with Search, Category, and Batch Filters)
 * GET /api/projects
 * Role: Both / Public
 */
async function getAllProjects(req, res) {
    try {
        const { search, category, batch, limit } = req.query;
        const pool = getPool();

        let query = `
            SELECT 
                p.projectId, p.title, p.description, p.technologies, p.githubLink, 
                p.screenshotPath, p.category, p.batch, p.studentId, p.status, p.created_at,
                u.name AS studentName, u.email AS studentEmail
            FROM projects p
            JOIN users u ON p.studentId = u.userId
            WHERE p.status = 'Approved'
        `;
        const params = [];

        if (search && search.trim() !== '') {
            query += ` AND (p.title LIKE ? OR p.description LIKE ? OR p.technologies LIKE ?)`;
            const term = `%${search.trim()}%`;
            params.push(term, term, term);
        }

        if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
            query += ` AND p.category = ?`;
            params.push(category.trim());
        }

        if (batch && batch.trim() !== '' && batch.toLowerCase() !== 'all') {
            query += ` AND p.batch = ?`;
            params.push(batch.trim());
        }

        query += ` ORDER BY p.created_at DESC`;

        if (limit && !isNaN(limit)) {
            query += ` LIMIT ?`;
            params.push(Number(limit));
        }

        const [projects] = await pool.query(query, params);

        return res.json({
            success: true,
            count: projects.length,
            projects
        });
    } catch (error) {
        console.error('[Get All Projects Error]:', error);
        return res.status(500).json({ success: false, message: 'Server error retrieving projects.' });
    }
}

/**
 * Get Pending Projects for Faculty Review
 * GET /api/projects/pending
 * Role: Faculty
 */
async function getPendingProjects(req, res) {
    try {
        const pool = getPool();
        const [pendingProjects] = await pool.query(
            `SELECT 
                p.projectId, p.title, p.description, p.technologies, p.githubLink, 
                p.screenshotPath, p.category, p.batch, p.studentId, p.status, p.created_at,
                u.name AS studentName, u.email AS studentEmail
            FROM projects p
            JOIN users u ON p.studentId = u.userId
            WHERE p.status = 'Pending'
            ORDER BY p.created_at ASC`
        );

        return res.json({
            success: true,
            count: pendingProjects.length,
            projects: pendingProjects
        });
    } catch (error) {
        console.error('[Get Pending Projects Error]:', error);
        return res.status(500).json({ success: false, message: 'Server error retrieving pending projects.' });
    }
}

/**
 * Approve or Reject Project
 * PUT /api/projects/status/:id
 * Role: Faculty
 */
async function updateProjectStatus(req, res) {
    try {
        const { id } = req.params;
        const { status, feedback } = req.body;

        if (!status || !['Approved', 'Rejected', 'Pending'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be 'Approved', 'Rejected', or 'Pending'."
            });
        }

        const pool = getPool();

        // Check if project exists
        const [existing] = await pool.query('SELECT projectId, title FROM projects WHERE projectId = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }

        await pool.query(
            'UPDATE projects SET status = ?, rejectionReason = ? WHERE projectId = ?',
            [status, feedback || null, id]
        );

        return res.json({
            success: true,
            message: `Project #${id} ("${existing[0].title}") has been marked as ${status}.`,
            projectId: Number(id),
            status
        });
    } catch (error) {
        console.error('[Update Project Status Error]:', error);
        return res.status(500).json({ success: false, message: 'Server error updating project status.' });
    }
}

/**
 * Get Projects by Category
 * GET /api/projects/category/:category
 * Role: All
 */
async function getProjectsByCategory(req, res) {
    try {
        const { category } = req.params;
        const pool = getPool();

        const [projects] = await pool.query(
            `SELECT 
                p.projectId, p.title, p.description, p.technologies, p.githubLink, 
                p.screenshotPath, p.category, p.batch, p.studentId, p.status, p.created_at,
                u.name AS studentName, u.email AS studentEmail
            FROM projects p
            JOIN users u ON p.studentId = u.userId
            WHERE p.status = 'Approved' AND LOWER(p.category) = LOWER(?)
            ORDER BY p.created_at DESC`,
            [category]
        );

        return res.json({
            success: true,
            category,
            count: projects.length,
            projects
        });
    } catch (error) {
        console.error('[Get Projects by Category Error]:', error);
        return res.status(500).json({ success: false, message: 'Server error retrieving category projects.' });
    }
}

/**
 * Get Single Project by ID
 * GET /api/projects/:id
 * Role: All
 */
async function getProjectById(req, res) {
    try {
        const { id } = req.params;
        const pool = getPool();

        const [rows] = await pool.query(
            `SELECT 
                p.projectId, p.title, p.description, p.technologies, p.githubLink, 
                p.screenshotPath, p.category, p.batch, p.studentId, p.status, p.rejectionReason, p.created_at, p.updated_at,
                u.name AS studentName, u.email AS studentEmail
            FROM projects p
            JOIN users u ON p.studentId = u.userId
            WHERE p.projectId = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }

        const project = rows[0];

        // Access control: if not approved, only the project owner or faculty can view
        if (project.status !== 'Approved') {
            if (!req.user || (req.user.role !== 'faculty' && req.user.userId !== project.studentId)) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'This project is currently under faculty review and not publicly viewable.' 
                });
            }
        }

        return res.json({
            success: true,
            project
        });
    } catch (error) {
        console.error('[Get Project By ID Error]:', error);
        return res.status(500).json({ success: false, message: 'Server error retrieving project details.' });
    }
}

/**
 * Update Project Details
 * PUT /api/projects/:id
 * Role: Student
 */
async function updateProject(req, res) {
    try {
        const { id } = req.params;
        const { title, description, technologies, githubLink, screenshotPath, category, batch } = req.body;
        const studentId = req.user.userId;
        const pool = getPool();

        const [existing] = await pool.query('SELECT studentId, status FROM projects WHERE projectId = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }

        // Student can only edit their own project
        if (existing[0].studentId !== studentId && req.user.role !== 'faculty') {
            return res.status(403).json({ success: false, message: 'You can only edit your own projects.' });
        }

        // Student cannot edit after approval unless faculty requested changes
        if (existing[0].status === 'Approved' && req.user.role !== 'faculty') {
            return res.status(400).json({ 
                success: false, 
                message: 'Approved projects cannot be edited. Please contact faculty for revisions.' 
            });
        }

        // If previously rejected, re-submitting sets status back to Pending
        const newStatus = existing[0].status === 'Rejected' ? 'Pending' : existing[0].status;

        // If screenshotPath is a base64 image, auto-save to uploads directory
        let finalScreenshotPath = screenshotPath ? screenshotPath.trim() : null;
        if (finalScreenshotPath && finalScreenshotPath.startsWith('data:image/')) {
            try {
                const matches = finalScreenshotPath.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
                if (matches) {
                    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                    const base64Data = matches[2];
                    const uploadsDir = path.resolve(__dirname, '../public/uploads');
                    if (!fs.existsSync(uploadsDir)) {
                        fs.mkdirSync(uploadsDir, { recursive: true });
                    }
                    const safeName = `project_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
                    fs.writeFileSync(path.join(uploadsDir, safeName), Buffer.from(base64Data, 'base64'));
                    finalScreenshotPath = `/uploads/${safeName}`;
                }
            } catch (imgErr) {
                console.warn('[Screenshot Base64 Save Warning]:', imgErr.message);
            }
        }

        await pool.query(
            `UPDATE projects 
            SET title = ?, description = ?, technologies = ?, githubLink = ?, screenshotPath = ?, category = ?, batch = ?, status = ?
            WHERE projectId = ?`,
            [
                title ? title.trim() : null,
                description ? description.trim() : null,
                technologies ? technologies.trim() : null,
                githubLink ? githubLink.trim() : null,
                finalScreenshotPath,
                category ? category.trim() : null,
                batch ? batch.trim() : null,
                newStatus,
                id
            ]
        );

        return res.json({
            success: true,
            message: 'Project updated successfully.',
            status: newStatus
        });
    } catch (error) {
        console.error('[Update Project Error]:', error);
        return res.status(500).json({ success: false, message: 'Server error updating project.' });
    }
}

/**
 * Delete Project
 * DELETE /api/projects/:id
 * Role: Student (only before approval)
 */
async function deleteProject(req, res) {
    try {
        const { id } = req.params;
        const studentId = req.user.userId;
        const pool = getPool();

        const [existing] = await pool.query('SELECT studentId, status FROM projects WHERE projectId = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }

        // Must be owner or faculty
        if (existing[0].studentId !== studentId && req.user.role !== 'faculty') {
            return res.status(403).json({ success: false, message: 'You can only delete your own projects.' });
        }

        // Check if student is trying to delete an already approved project
        if (existing[0].status === 'Approved' && req.user.role !== 'faculty') {
            return res.status(400).json({
                success: false,
                message: 'Approved projects cannot be deleted directly by students. Contact faculty/admin.'
            });
        }

        await pool.query('DELETE FROM projects WHERE projectId = ?', [id]);

        return res.json({
            success: true,
            message: 'Project deleted successfully.'
        });
    } catch (error) {
        console.error('[Delete Project Error]:', error);
        return res.status(500).json({ success: false, message: 'Server error deleting project.' });
    }
}

/**
 * Get Student's Own Projects
 * GET /api/projects/my
 * Role: Student
 */
async function getMyProjects(req, res) {
    try {
        const studentId = req.user.userId;
        const pool = getPool();

        const [projects] = await pool.query(
            `SELECT projectId, title, description, technologies, githubLink, screenshotPath, category, batch, status, rejectionReason, created_at, updated_at
            FROM projects 
            WHERE studentId = ?
            ORDER BY created_at DESC`,
            [studentId]
        );

        return res.json({
            success: true,
            count: projects.length,
            projects
        });
    } catch (error) {
        console.error('[Get My Projects Error]:', error);
        return res.status(500).json({ success: false, message: 'Server error retrieving your projects.' });
    }
}

/**
 * Get Dashboard Statistics
 * GET /api/projects/stats
 * Role: Faculty
 */
async function getDashboardStats(req, res) {
    try {
        const pool = getPool();

        // 1. Overall counts
        const [totalProjects] = await pool.query('SELECT COUNT(*) as count FROM projects');
        const [approvedProjects] = await pool.query("SELECT COUNT(*) as count FROM projects WHERE status = 'Approved'");
        const [pendingProjects] = await pool.query("SELECT COUNT(*) as count FROM projects WHERE status = 'Pending'");
        const [rejectedProjects] = await pool.query("SELECT COUNT(*) as count FROM projects WHERE status = 'Rejected'");
        const [totalStudents] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'student'");

        // 2. Category-wise distribution
        const [categoryCounts] = await pool.query(`
            SELECT category, COUNT(*) as count 
            FROM projects 
            GROUP BY category 
            ORDER BY count DESC
        `);

        // 3. Batch-wise distribution
        const [batchCounts] = await pool.query(`
            SELECT batch, COUNT(*) as count 
            FROM projects 
            GROUP BY batch 
            ORDER BY batch ASC
        `);

        // 4. Recent submissions
        const [recentSubmissions] = await pool.query(`
            SELECT p.projectId, p.title, p.category, p.batch, p.status, p.created_at, u.name as studentName
            FROM projects p
            JOIN users u ON p.studentId = u.userId
            ORDER BY p.created_at DESC
            LIMIT 5
        `);

        return res.json({
            success: true,
            stats: {
                totalProjects: totalProjects[0].count,
                approvedCount: approvedProjects[0].count,
                pendingCount: pendingProjects[0].count,
                rejectedCount: rejectedProjects[0].count,
                totalStudents: totalStudents[0].count,
                categoryCounts,
                batchCounts,
                recentSubmissions
            }
        });
    } catch (error) {
        console.error('[Get Stats Error]:', error);
        return res.status(500).json({ success: false, message: 'Server error computing dashboard statistics.' });
    }
}

/**
 * Handle Image Upload (Base64 data url or multipart upload)
 * POST /api/upload
 */
async function uploadScreenshot(req, res) {
    try {
        const { imageBase64, filename } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ success: false, message: 'No image data provided.' });
        }

        // Strip data:image/...;base64, header
        const matches = imageBase64.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        let ext = 'png';
        let base64Data = imageBase64;

        if (matches) {
            ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
            base64Data = matches[2];
        }

        const uploadsDir = path.resolve(__dirname, '../public/uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const safeName = `project_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
        const filePath = path.join(uploadsDir, safeName);

        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

        return res.json({
            success: true,
            url: `/uploads/${safeName}`,
            filename: safeName
        });
    } catch (error) {
        console.error('[Upload Error]:', error);
        return res.status(500).json({ success: false, message: 'Image upload failed.' });
    }
}

module.exports = {
    addProject,
    getAllProjects,
    getPendingProjects,
    updateProjectStatus,
    getProjectsByCategory,
    getProjectById,
    updateProject,
    deleteProject,
    getMyProjects,
    getDashboardStats,
    uploadScreenshot
};
