const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateToken, optionalAuth, requireRole } = require('../middleware/authMiddleware');

// 1. Get All Approved Projects (Browse/Search) - GET /api/projects
router.get('/', optionalAuth, projectController.getAllProjects);

// 2. Add Project - POST /api/projects/add (Student)
router.post('/add', authenticateToken, requireRole('student'), projectController.addProject);

// 3. Get Pending Projects - GET /api/projects/pending (Faculty)
router.get('/pending', authenticateToken, requireRole('faculty'), projectController.getPendingProjects);

// 4. Approve / Reject Project - PUT /api/projects/status/:id (Faculty)
router.put('/status/:id', authenticateToken, requireRole('faculty'), projectController.updateProjectStatus);

// 5. Get Dashboard Stats - GET /api/projects/stats (Faculty or Public summary)
router.get('/stats', optionalAuth, projectController.getDashboardStats);

// 6. Get Current Student's Own Projects - GET /api/projects/my (Student)
router.get('/my', authenticateToken, projectController.getMyProjects);

// 7. Get Projects by Category - GET /api/projects/category/:category (All)
router.get('/category/:category', optionalAuth, projectController.getProjectsByCategory);

// 8. Get Project by ID - GET /api/projects/:id (All)
router.get('/:id', optionalAuth, projectController.getProjectById);

// 9. Update Project - PUT /api/projects/:id (Student)
router.put('/:id', authenticateToken, requireRole(['student', 'faculty']), projectController.updateProject);

// 10. Delete Project - DELETE /api/projects/:id (Student)
router.delete('/:id', authenticateToken, requireRole(['student', 'faculty']), projectController.deleteProject);

// 11. Upload Project Screenshot - POST /api/projects/upload (Authenticated)
router.post('/upload', authenticateToken, projectController.uploadScreenshot);

module.exports = router;
