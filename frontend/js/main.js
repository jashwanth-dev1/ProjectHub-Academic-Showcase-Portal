// ============================================================
// PROJECTHUB - MAIN AUTH & NAVIGATION CONTROLLER
// ============================================================

// NOTE: API_BASE is declared in api.js — do NOT redeclare it here

// ---- Session Helpers ----
function getToken() {
    return localStorage.getItem('projecthub_token');
}

function getCurrentUser() {
    try {
        const u = localStorage.getItem('projecthub_user');
        return u ? JSON.parse(u) : null;
    } catch (e) {
        return null;
    }
}

function setSession(token, user) {
    localStorage.setItem('projecthub_token', token);
    localStorage.setItem('projecthub_user', JSON.stringify(user));
}

function logout() {
    localStorage.removeItem('projecthub_token');
    localStorage.removeItem('projecthub_user');
    showToast('Logged out successfully', 'info');
    setTimeout(() => {
        window.location.href = window.location.pathname.includes('/pages/')
            ? '../index.html'
            : 'index.html';
    }, 500);
}

// ---- Auth Guards ----
function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        const loginUrl = window.location.pathname.includes('/pages/')
            ? 'login.html'
            : 'pages/login.html';
        window.location.replace(loginUrl);
        return null;
    }
    return user;
}

function redirectIfLoggedIn() {
    const user = getCurrentUser();
    if (user) {
        const dashUrl = window.location.pathname.includes('/pages/')
            ? 'dashboard.html'
            : 'pages/dashboard.html';
        window.location.replace(dashUrl);
    }
}

// ---- Toast Notifications ----
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed; bottom: 24px; right: 24px; z-index: 99999;
            display: flex; flex-direction: column; gap: 10px; pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${colors[type] || '#1f2937'}; color: white;
        padding: 12px 20px; border-radius: 8px;
        font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
        box-shadow: 0 10px 25px rgba(0,0,0,0.18);
        opacity: 0; transform: translateY(10px); transition: all 0.3s ease;
        pointer-events: auto;
    `;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ---- Mobile Menu ----
function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            menuToggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                menuToggle.textContent = '☰';
            });
        });
    }
}

// ---- Dynamic Auth Navigation Bar ----
function updateAuthNav() {
    const user = getCurrentUser();
    const isPagesDir = window.location.pathname.includes('/pages/');
    const dashboardHref = isPagesDir ? 'dashboard.html' : 'pages/dashboard.html';
    const loginHref = isPagesDir ? 'login.html' : 'pages/login.html';
    const registerHref = isPagesDir ? 'register.html' : 'pages/register.html';

    const navButtons = document.querySelectorAll('.nav-buttons');
    const mobileButtons = document.querySelectorAll('.mobile-buttons');

    if (user && user.name) {
        const roleIcon = user.role === 'faculty' ? '👨‍🏫' : '👨‍🎓';
        const roleLabel = user.role === 'faculty' ? 'Faculty' : 'Student';
        const safeName = user.name.split(' ')[0] || user.name;

        navButtons.forEach(container => {
            container.innerHTML = `
                <a href="${dashboardHref}" class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; font-weight: 700;">
                    <span>📊 Dashboard</span>
                </a>
                <div style="display: inline-flex; align-items: center; gap: 6px; background: #f1f5f9; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; color: #1e293b;">
                    <span>${roleIcon} ${safeName}</span>
                    <span style="font-size: 10px; background: #e2e8f0; padding: 2px 6px; border-radius: 10px; text-transform: uppercase;">${roleLabel}</span>
                </div>
                <button type="button" onclick="logout()" class="btn btn-outline btn-sm" style="padding: 6px 12px; font-size: 12px; cursor: pointer; color: #ef4444; border-color: #fca5a5;">
                    Logout
                </button>
            `;
            container.style.display = 'flex';
            container.style.alignItems = 'center';
            container.style.gap = '8px';
        });

        mobileButtons.forEach(container => {
            container.innerHTML = `
                <div style="padding: 10px 0; font-size: 13px; font-weight: 700; color: var(--dark); border-bottom: 1px solid var(--border); margin-bottom: 8px;">
                    ${roleIcon} Signed in as <strong>${user.name}</strong> (${roleLabel})
                </div>
                <a href="${dashboardHref}" class="btn btn-primary" style="width: 100%; justify-content: center; margin-bottom: 8px;">Go to Dashboard 📊</a>
                <button type="button" onclick="logout()" class="btn btn-outline" style="width: 100%; justify-content: center; color: #ef4444; border-color: #fca5a5;">Logout</button>
            `;
        });

        const dashReturn = document.getElementById('dashboardReturnBtn');
        if (dashReturn) {
            dashReturn.innerHTML = `
                <a href="${dashboardHref}" class="btn btn-outline btn-sm" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
                    <span>📊 Open Dashboard</span> ↗
                </a>
            `;
        }
    } else {
        const guestNavHtml = `
            <a href="${loginHref}" class="btn btn-outline">Login</a>
            <a href="${registerHref}" class="btn btn-primary">Get Started ↗</a>
        `;
        navButtons.forEach(container => {
            container.innerHTML = guestNavHtml;
        });

        mobileButtons.forEach(container => {
            container.innerHTML = `
                <a href="${loginHref}" class="btn btn-outline" style="width: 100%; justify-content: center; margin-bottom: 8px;">Login</a>
                <a href="${registerHref}" class="btn btn-primary" style="width: 100%; justify-content: center;">Get Started</a>
            `;
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    updateAuthNav();
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});
