-- Polling Application Database Schema
-- MySQL Database

-- Create Database
CREATE DATABASE IF NOT EXISTS polling_app;
USE polling_app;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'faculty', 'user') DEFAULT 'user',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Polls Table
CREATE TABLE IF NOT EXISTS polls (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question VARCHAR(500) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    start_time DATETIME,
    end_time DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Poll Options Table
CREATE TABLE IF NOT EXISTS poll_options (
    id INT PRIMARY KEY AUTO_INCREMENT,
    poll_id INT NOT NULL,
    option_text VARCHAR(255) NOT NULL,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

-- Votes Table
CREATE TABLE IF NOT EXISTS votes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    poll_id INT NOT NULL,
    option_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_poll (user_id, poll_id)
);

-- Create Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_polls_created_by ON polls(created_by);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_option_id ON votes(option_id);

-- Sample Data (Optional - for testing)
INSERT INTO users (email, password, role) VALUES 
('admin@polling.com', '$2b$10$YourHashedPasswordHere', 'admin'),
('user1@polling.com', '$2b$10$YourHashedPasswordHere', 'user');

INSERT INTO polls (question, is_active, created_by) VALUES 
('What is your favorite programming language?', TRUE, 1),
('Which is the best frontend framework?', TRUE, 1);

INSERT INTO poll_options (poll_id, option_text) VALUES 
(1, 'JavaScript'),
(1, 'Python'),
(1, 'Java'),
(1, 'Go'),
(2, 'React'),
(2, 'Vue'),
(2, 'Angular');
