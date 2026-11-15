const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DB_NAME = process.env.DB_NAME || 'project_showcase';

// Support both individual env variables and cloud connection strings (Railway, Render, Aiven)
const dbConfig = process.env.MYSQL_URL || process.env.DATABASE_URL || {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'newroot',
    password: process.env.DB_PASSWORD || 'YourStrongPassword123!!',
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;

async function initDatabase() {
    try {
        // Step 1: Attempt to ensure DB exists (ignored on managed cloud databases where DB already exists)
        if (typeof dbConfig === 'object' && !dbConfig.database) {
            try {
                const rootConn = await mysql.createConnection(dbConfig);
                await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
                await rootConn.end();
            } catch (createErr) {
                console.log('[Database Notice] Cloud database in use:', createErr.message);
            }
        }

        // Step 2: Initialize connection pool pointing to project_showcase
        pool = mysql.createPool(
            typeof dbConfig === 'string' 
                ? dbConfig 
                : { ...dbConfig, database: dbConfig.database || DB_NAME }
        );

        // Step 3: Create Users table as per Problem Statement
        // Fields: userId, name, role (student/faculty), email, password
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                userId INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(120) NOT NULL,
                role ENUM('student', 'faculty') NOT NULL DEFAULT 'student',
                email VARCHAR(150) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);

        // Step 4: Create Projects table as per Problem Statement
        // Fields: projectId, title, description, technologies, githubLink, screenshotPath, category, batch, studentId, status (Pending/Approved/Rejected)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS projects (
                projectId INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                technologies TEXT NOT NULL,
                githubLink TEXT,
                screenshotPath LONGTEXT,
                category VARCHAR(100) NOT NULL,
                batch VARCHAR(50) NOT NULL,
                studentId INT NOT NULL,
                status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
                rejectionReason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (studentId) REFERENCES users(userId) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        // Step 5: Optional Categories table for managing categories
        await pool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                categoryId INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                description VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);

        // Insert default categories if empty
        const [catCount] = await pool.query('SELECT COUNT(*) as count FROM categories');
        if (catCount[0].count === 0) {
            const defaultCategories = [
                ['Web Development', 'Full-stack web applications, frontends, APIs and portals'],
                ['Artificial Intelligence', 'Machine learning, NLP, computer vision and smart assistants'],
                ['Mobile Applications', 'Android, iOS, Flutter and React Native apps'],
                ['Internet of Things', 'Smart hardware, microcontrollers, Arduino and sensor networks'],
                ['Data Science & Analytics', 'Data visualization, big data processing and business intelligence'],
                ['Cybersecurity', 'Network security, secure auth systems and cryptography'],
                ['Cloud & DevOps', 'Microservices, Docker, CI/CD pipelines and distributed systems']
            ];
            await pool.query('INSERT INTO categories (name, description) VALUES ?', [defaultCategories]);
        }

        console.log(`[Database] MySQL connected & tables initialized successfully in database: ${DB_NAME}`);
        return pool;
    } catch (error) {
        console.error('[Database Error] Failed to initialize MySQL:', error.message);
        throw error;
    }
}

function getPool() {
    if (!pool) {
        throw new Error('Database pool not initialized. Call initDatabase() first.');
    }
    return pool;
}

module.exports = {
    initDatabase,
    getPool
};
