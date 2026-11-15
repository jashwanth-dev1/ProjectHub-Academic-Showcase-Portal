# 🎓 ProjectHub - Mini Project Showcase Portal
## Hackathon Presentation & Live Demo Guide (Sidebar Dashboard Edition)

**Problem Statement 4:** Mini Project Showcase Portal  
**Architecture:** Modern Sidebar Dashboard | Node.js & Express.js REST API | MySQL 8.0 Database

---

### 🌐 Key URLs
- **Landing Gateway:** [http://localhost:5000](http://localhost:5000)
- **Sign In (Student / Faculty):** [http://localhost:5000/pages/login.html](http://localhost:5000/pages/login.html)
- **Interactive Dashboard (Sidebar Layout):** [http://localhost:5000/pages/dashboard.html](http://localhost:5000/pages/dashboard.html)
- **Presentation Slide Deck for Sir:** [http://localhost:5000/presentation/index.html](http://localhost:5000/presentation/index.html)

---

### 🔑 Demo Login Credentials (1-Click Auto-Fill Available on Login Page)

| Role | Email | Password | Sidebar Modules Available |
| :--- | :--- | :--- | :--- |
| **👨‍🎓 Student** | `student@campus.edu` | `Password123!` | 📊 Overview · ➕ Submit Project · 📁 My Projects · 🔍 Browse & Search |
| **👨‍🏫 Faculty** | `faculty@campus.edu` | `Password123!` | 📈 Analytics & Stats · ⏳ Pending Reviews · 📚 All Projects · 🔍 Explore Showcase |

---

### 🚀 3-Minute Demo Script to Show to Sir

#### Step 1: Clean First Page / Gateway (20 seconds)
1. Open [http://localhost:5000](http://localhost:5000).
2. Show Sir the clean, minimalist landing page with the overview and live database counters from MySQL.
3. Show Sir that public cluttered options are removed, and the portal is secure: users sign in to their dedicated dashboard.

#### Step 2: Student Sidebar Dashboard (60 seconds)
1. Click **"Login as Student"** on the landing page (or click **"👨‍🎓 Student Demo"** on the login page).
2. Point out the **Left Sidebar**:
   - Shows student avatar, name (`Sunny Kumar`), and `STUDENT` role badge.
   - Shows the live **MySQL 8.0 Connected** badge at the bottom.
3. Click through the **Sidebar Menu Options**:
   - 📊 **Overview:** Summary metric cards and recent submissions.
   - ➕ **Submit Project:** Fill in title, category, batch, tech stack, and GitHub link, then click submit $\rightarrow$ data is inserted into the MySQL database (`POST /api/projects/add`).
   - 📁 **My Projects:** Table showing live submission statuses (**`Pending`**, **`Approved`**, **`Rejected`**), with edit and delete capabilities.
   - 🔍 **Browse & Search:** Search bar to filter approved projects by keyword, technology, batch, and category.

#### Step 3: Faculty Evaluator Sidebar Dashboard (60 seconds)
1. In the sidebar, click **"Sign Out ⎋"** $\rightarrow$ log in using **"👨‍🏫 Faculty Demo"** (`faculty@campus.edu`).
2. Show Sir how the **Left Sidebar dynamically adapts** for the Faculty role:
   - 📈 **Analytics & Stats (Module 5):** Category-wise distribution bars and batch counts queried directly from MySQL via `GET /api/projects/stats`.
   - ⏳ **Pending Reviews (Module 3):** Shows the pending review queue with student details and GitHub links. Click **"✓ Approve Project"** to approve the student submission!
   - 📚 **All Projects:** Full repository of all campus projects stored in MySQL.
3. Switch back to **"Browse & Search"** to show that the approved project is immediately visible!

---

### 📋 API Route Designs (Problem Statement 4)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (with bcrypt & JWT)
- `POST /api/projects/add` - Student project upload
- `GET /api/projects` - Public explore & search
- `GET /api/projects/pending` - Faculty pending review queue
- `PUT /api/projects/status/:id` - Faculty approve/reject status update
- `GET /api/projects/category/:category` - Filter by category
- `GET /api/projects/:id` - Project details view
- `PUT /api/projects/:id` - Student project update (before approval)
- `DELETE /api/projects/:id` - Student project delete (before approval)
- `GET /api/projects/stats` - Category-wise and batch-wise analytics
