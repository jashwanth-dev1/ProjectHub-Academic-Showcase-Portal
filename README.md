# 🎓 ProjectHub — Academic Mini Project Showcase Portal

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-Backend-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT%20%26%20Bcrypt-FF4F8B?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![JavaScript](https://img.shields.io/badge/Frontend-Vanilla%20JS%20%26%20CSS3-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/)

> **Problem Statement 4 | Hackathon 2026**  
> A full-stack academic web platform where students upload and showcase academic mini projects, faculty review, verify code quality and approve submissions, and visitors can browse projects category-wise and batch-wise.

---

## 🚀 How to Run in VS Code

### 1. Open Integrated Terminal in VS Code
Press **`Ctrl + ~`** (or go to **Terminal** ➔ **New Terminal**).

### 2. Navigate to Backend and Run Server
```bash
cd backend
node server.js
```
*(Or simply run `npm start` from either the root or backend folder)*

You will see:
```text
[Database] MySQL connected & tables initialized successfully in database: project_showcase
====================================================
🚀 ProjectHub Showcase Portal running at:
   http://localhost:5000
📡 MySQL Database: Connected (project_showcase)
====================================================
```

### 3. Open in Browser
Open your browser and visit:
👉 **`http://localhost:5000`**

---

## 🔐 Demo Credentials

| Role | Email | Password | Quick Login |
|------|-------|----------|-------------|
| **Student** | `student@campus.edu` | `Password123!` | Click **👨‍🎓 Student Demo** |
| **Faculty** | `faculty@campus.edu` | `Password123!` | Click **👨‍🏫 Faculty Demo** |

---

## 🗂️ Clean VS Code Project Structure

```text
A:\Hackthon - work\
│
├── backend/                       # 🟢 ALL BACKEND & DATABASE CODE
│   ├── config/
│   │   └── db.js                  # MySQL pool & auto-table creator
│   ├── controllers/
│   │   ├── authController.js       # Register, Login, JWT auth
│   │   └── projectController.js    # CRUD, status approvals, stats
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT & role verification
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth routes
│   │   └── projectRoutes.js        # /api/projects routes
│   ├── public/
│   │   └── uploads/               # Uploaded project screenshots
│   ├── .env                       # Database & JWT configurations
│   ├── package.json               # Backend dependencies & scripts
│   ├── schema.sql                 # Reference database schema
│   ├── seed.js                    # Database seeder (sample data)
│   └── server.js                  # Express main server (port 5000)
│
├── frontend/                      # 🔵 ALL FRONTEND CLIENT CODE
│   ├── css/
│   │   ├── app-style.css          # Auth, tables, forms, badges
│   │   └── sidebar-dashboard.css  # Fixed sidebar navigation layout
│   ├── js/
│   │   ├── api.js                 # ProjectHubAPI client (all 11 routes)
│   │   └── main.js                # Auth helpers, session storage, toasts
│   ├── pages/
│   │   ├── dashboard.html         # 🏠 MAIN SIDEBAR DASHBOARD (Single Page)
│   │   ├── explore.html           # Public repository browse view
│   │   ├── faculty-dashboard.html # Redirect shim to dashboard.html
│   │   ├── login.html             # Clean gateway login (Student/Faculty)
│   │   ├── project-details.html   # Dedicated project viewer
│   │   ├── register.html          # Clean registration page
│   │   └── student-dashboard.html # Redirect shim to dashboard.html
│   ├── index.html                 # Gateway landing page
│   └── style.css                  # Design system (DM Sans & Manrope)
│
├── presentation/
│   └── index.html                 # 5-Slide interactive hackathon presentation deck
│
├── DEMO_GUIDE.md                  # Quick evaluation walkthrough guide
├── package.json                   # Root package script helper
└── README.md                      # Project documentation
```

---

## 📡 API Routes (Matches Problem Statement Design)

| Purpose | Route | Method | Role |
|---------|-------|--------|------|
| Register | `/api/auth/register` | POST | Both |
| Login | `/api/auth/login` | POST | Both |
| Get Current User | `/api/auth/me` | GET | Both |
| Add Project | `/api/projects/add` | POST | Student |
| Get All Projects | `/api/projects` | GET | Both |
| Get Pending Projects | `/api/projects/pending` | GET | Faculty |
| Approve/Reject Project | `/api/projects/status/:id` | PUT | Faculty |
| Get Projects by Category | `/api/projects/category/:category` | GET | All |
| Get Project by ID | `/api/projects/:id` | GET | All |
| Update Project | `/api/projects/:id` | PUT | Student |
| Delete Project | `/api/projects/:id` | DELETE | Student |
| Get Dashboard Stats | `/api/projects/stats` | GET | Faculty |

---

## 🗄️ Database Design (MySQL 8.0)

**Database:** `project_showcase`

- **Table `users`:** `userId`, `name`, `role` (student/faculty), `email`, `password` (bcrypt), `created_at`
- **Table `projects`:** `projectId`, `title`, `description`, `technologies`, `githubLink`, `screenshotPath`, `category`, `batch`, `studentId`, `status` (Pending/Approved/Rejected), `feedback`, `created_at`
- **Table `categories`:** Pre-seeded categories (Web, AI, IoT, Mobile, Cybersecurity, Cloud, Blockchain)
