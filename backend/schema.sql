-- Database Schema for Mini Project Showcase Portal
-- Problem Statement 4 - Hackathon Project

CREATE DATABASE IF NOT EXISTS project_showcase;
USE project_showcase;

-- Users Table
-- Fields: userId, name, role (student/faculty), email, password
CREATE TABLE IF NOT EXISTS users (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role ENUM('student', 'faculty') NOT NULL DEFAULT 'student',
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
-- Fields: projectId, title, description, technologies, githubLink, screenshotPath, category, batch, studentId, status (Pending/Approved/Rejected)
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
    facultyFeedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES users(userId) ON DELETE CASCADE
);

-- Initial Categories Table (Bonus feature for category management)
CREATE TABLE IF NOT EXISTS categories (
    categoryId INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) DEFAULT 'code',
    description VARCHAR(255)
);

INSERT IGNORE INTO categories (name, icon, description) VALUES
('Web Development', 'globe', 'Websites, web apps and full stack portals'),
('Artificial Intelligence', 'cpu', 'AI, Machine Learning and Deep Learning models'),
('Mobile Applications', 'smartphone', 'Android, iOS and Cross-platform Flutter/React Native apps'),
('Internet of Things', 'wifi', 'Arduino, Raspberry Pi and smart connected hardware'),
('Data Science', 'database', 'Data analytics, visualization and Big Data pipelines'),
('Cybersecurity', 'shield', 'Network security, vulnerability assessment and cryptography'),
('Cloud Computing', 'cloud', 'Microservices, serverless and cloud infrastructure'),
('Other Innovations', 'layers', 'Multidisciplinary, embedded systems and open projects');
