// ============================================================
// PROJECTHUB - API CLIENT
// Routes match Problem Statement exactly
// Always targets http://localhost:5000/api
// ============================================================

// Universal API Base: Works on localhost, local Wi-Fi IP, and live cloud deployment (Railway/Render)
const API_BASE = (typeof window !== 'undefined' && window.location.origin && window.location.origin.startsWith('http'))
    ? (window.location.port === '5000' || !window.location.port || window.location.port === '80' || window.location.port === '443')
        ? `${window.location.origin}/api`
        : `http://${window.location.hostname || 'localhost'}:5000/api`
    : 'http://localhost:5000/api';

// ---- Core fetch wrapper ----
async function request(endpoint, options = {}) {
    const token = localStorage.getItem('projecthub_token');
    const headers = { 
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true',
        'ngrok-skip-browser-warning': 'true'
    };

    if (options.body instanceof FormData) {
        delete headers['Content-Type']; // Let browser set multipart boundary
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Merge caller headers
    Object.assign(headers, options.headers || {});

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: options.method || 'GET',
            headers,
            body: options.body || undefined
        });

        // Verify response is valid JSON
        const contentType = response.headers.get('content-type') || '';
        let data;
        if (contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const rawText = await response.text();
            try {
                data = JSON.parse(rawText);
            } catch (jsonErr) {
                if (rawText.includes('localtunnel') || rawText.includes('Friendly Reminder')) {
                    throw new Error('LocalTunnel warning page blocked this API request. Please use Pinggy or reload.');
                }
                throw new Error('Server returned invalid data format: ' + rawText.substring(0, 100));
            }
        }

        if (!response.ok) {
            throw new Error(data.message || data.error || `Server error: ${response.status}`);
        }

        return data;
    } catch (err) {
        if (err.message && err.message.includes('Failed to fetch')) {
            throw new Error('Cannot connect to backend server. Make sure "node server.js" is running on port 5000!');
        }
        throw err;
    }
}

// ============================================================
// EXPORTED API OBJECT — Matching Problem Statement API Routes
// ============================================================
const ProjectHubAPI = {
    // 1. Authentication
    // POST /api/auth/register
    register: (data) => request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // POST /api/auth/login
    login: (data) => request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // GET /api/auth/me
    getCurrentUser: () => request('/auth/me'),

    // 2. Project Management (Student)
    // POST /api/projects/add
    addProject: (data) => request('/projects/add', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // GET /api/projects/my
    getMyProjects: () => request('/projects/my'),

    // PUT /api/projects/:id
    updateProject: (id, data) => request(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    // DELETE /api/projects/:id
    deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

    // 3. Approval Workflow (Faculty)
    // GET /api/projects/pending
    getPendingProjects: () => request('/projects/pending'),

    // PUT /api/projects/status/:id
    updateProjectStatus: (id, status, feedback = '') =>
        request(`/projects/status/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status, feedback })
        }),

    // 4. Search & Browse
    // GET /api/projects  (with optional ?search=&category=&batch=&technology=)
    getAllProjects: (params = {}) => {
        const q = new URLSearchParams(
            Object.fromEntries(Object.entries(params).filter(([, v]) => v))
        ).toString();
        return request(`/projects${q ? '?' + q : ''}`);
    },

    // GET /api/projects/category/:category
    getProjectsByCategory: (category) =>
        request(`/projects/category/${encodeURIComponent(category)}`),

    // GET /api/projects/:id
    getProjectById: (id) => request(`/projects/${id}`),

    // 5. Dashboard & Analytics (Faculty)
    // GET /api/projects/stats
    getDashboardStats: () => request('/projects/stats')
};

window.ProjectHubAPI = ProjectHubAPI;
window.API_BASE = API_BASE;
