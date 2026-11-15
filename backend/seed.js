const bcrypt = require('bcryptjs');
const { initDatabase, getPool } = require('./config/db');

async function seedData() {
    try {
        console.log('[Seed] Connecting to MySQL and preparing seed data...');
        await initDatabase();
        const pool = getPool();

        // 1. Clear existing sample data if desired or create if not present
        const salt = await bcrypt.genSalt(10);
        const demoPassword = await bcrypt.hash('Password123!', salt);

        // Check if users already exist
        const [existingUsers] = await pool.query('SELECT email FROM users');
        const emails = existingUsers.map(u => u.email);

        let facultyId, student1Id, student2Id;

        if (!emails.includes('faculty@campus.edu')) {
            const [fRes] = await pool.query(
                'INSERT INTO users (name, role, email, password) VALUES (?, ?, ?, ?)',
                ['Dr. Ramesh Sharma (Faculty Lead)', 'faculty', 'faculty@campus.edu', demoPassword]
            );
            facultyId = fRes.insertId;
        } else {
            const [f] = await pool.query("SELECT userId FROM users WHERE email = 'faculty@campus.edu'");
            facultyId = f[0].userId;
        }

        if (!emails.includes('student@campus.edu')) {
            const [s1Res] = await pool.query(
                'INSERT INTO users (name, role, email, password) VALUES (?, ?, ?, ?)',
                ['Sunny Kumar (2503A52893)', 'student', 'student@campus.edu', demoPassword]
            );
            student1Id = s1Res.insertId;
        } else {
            const [s1] = await pool.query("SELECT userId FROM users WHERE email = 'student@campus.edu'");
            student1Id = s1[0].userId;
        }

        if (!emails.includes('priya@campus.edu')) {
            const [s2Res] = await pool.query(
                'INSERT INTO users (name, role, email, password) VALUES (?, ?, ?, ?)',
                ['Priya Verma (CSE 2026)', 'student', 'priya@campus.edu', demoPassword]
            );
            student2Id = s2Res.insertId;
        } else {
            const [s2] = await pool.query("SELECT userId FROM users WHERE email = 'priya@campus.edu'");
            student2Id = s2[0].userId;
        }

        // 2. Check if projects exist
        const [projectRows] = await pool.query('SELECT COUNT(*) as count FROM projects');
        if (projectRows[0].count === 0) {
            console.log('[Seed] Seeding sample academic projects...');

            const sampleProjects = [
                {
                    title: 'Campus Insights & Attendance Dashboard',
                    description: 'A comprehensive web analytics dashboard for campus administrators and professors to track real-time lecture attendance, test grade trends, and department performance metrics.',
                    technologies: 'Node.js, Express, Chart.js, MySQL, HTML5/CSS3',
                    githubLink: 'https://github.com/campus-projects/campus-insights',
                    screenshotPath: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60',
                    category: 'Web Development',
                    batch: '2023-2027',
                    studentId: student1Id,
                    status: 'Approved'
                },
                {
                    title: 'Smart Campus AI Assistant',
                    description: 'An AI-powered contextual conversational assistant answering queries regarding course schedules, exam seating, syllabus outlines, and laboratory timings with semantic search.',
                    technologies: 'Python, FastAPI, LangChain, React, SQLite, Vector DB',
                    githubLink: 'https://github.com/campus-projects/smart-campus-assistant',
                    screenshotPath: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
                    category: 'Artificial Intelligence',
                    batch: '2023-2027',
                    studentId: student1Id,
                    status: 'Approved'
                },
                {
                    title: 'IoT Smart Water Quality & Level Monitor',
                    description: 'An embedded hardware prototype that continuously logs pH, turbidity, and ultrasonic water level readings across campus overhead reservoirs and triggers automated alerts to maintenance teams.',
                    technologies: 'ESP32, Arduino, MQTT, Node.js, C++',
                    githubLink: 'https://github.com/campus-projects/smart-water-monitor',
                    screenshotPath: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=60',
                    category: 'Internet of Things',
                    batch: '2022-2026',
                    studentId: student2Id,
                    status: 'Approved'
                },
                {
                    title: 'Student Companion Mobile App',
                    description: 'Cross-platform mobile application providing offline timetable reminders, campus bus GPS tracking, cafeteria meal menus, and peer note exchange.',
                    technologies: 'Flutter, Dart, Firebase, Cloud Firestore',
                    githubLink: 'https://github.com/campus-projects/student-companion-app',
                    screenshotPath: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=60',
                    category: 'Mobile Applications',
                    batch: '2023-2027',
                    studentId: student2Id,
                    status: 'Approved'
                },
                {
                    title: 'PhishGuard - Suspicious URL Safety Checker',
                    description: 'Machine learning based browser extension that detects zero-day phishing links, URL typo-squatting, and malicious redirects targeting students during online exam portals.',
                    technologies: 'Python, Scikit-Learn, Chrome Extensions API, Flask',
                    githubLink: 'https://github.com/campus-projects/phishguard-checker',
                    screenshotPath: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60',
                    category: 'Cybersecurity',
                    batch: '2022-2026',
                    studentId: student1Id,
                    status: 'Approved'
                },
                // PENDING PROJECTS (Ready for live faculty approval demo!)
                {
                    title: 'Automated Solar Panel Tilt Tracking System',
                    description: 'Dual-axis servo-motor solar tracking controller with LDR sensors that aligns photovoltaic panels toward peak sunlight intensity, increasing energy yield by up to 34%.',
                    technologies: 'Arduino Uno, C++, LDR Sensors, Servo Motors, Eagle CAD',
                    githubLink: 'https://github.com/campus-projects/solar-tracker-system',
                    screenshotPath: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=60',
                    category: 'Internet of Things',
                    batch: '2023-2027',
                    studentId: student1Id,
                    status: 'Pending'
                },
                {
                    title: 'Smart Library Book Locator & Recommendation Engine',
                    description: 'A responsive web portal allowing students to search book catalog shelves, find exact aisle coordinates, and receive AI-generated reading recommendations based on past borrowing history.',
                    technologies: 'Node.js, Express, MySQL, Bootstrap 5, Scikit-Learn',
                    githubLink: 'https://github.com/campus-projects/smartlib-locator',
                    screenshotPath: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&auto=format&fit=crop&q=60',
                    category: 'Web Development',
                    batch: '2023-2027',
                    studentId: student2Id,
                    status: 'Pending'
                }
            ];

            for (const p of sampleProjects) {
                await pool.query(
                    `INSERT INTO projects (title, description, technologies, githubLink, screenshotPath, category, batch, studentId, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [p.title, p.description, p.technologies, p.githubLink, p.screenshotPath, p.category, p.batch, p.studentId, p.status]
                );
            }
            console.log(`[Seed] Inserted ${sampleProjects.length} sample projects successfully!`);
        }

        console.log('====================================================');
        console.log('✅ DATABASE SEEDING COMPLETED');
        console.log('Faculty Login : faculty@campus.edu / Password123!');
        console.log('Student Login : student@campus.edu / Password123!');
        console.log('====================================================');
        process.exit(0);

    } catch (err) {
        console.error('[Seed Error]:', err.message);
        process.exit(1);
    }
}

seedData();
