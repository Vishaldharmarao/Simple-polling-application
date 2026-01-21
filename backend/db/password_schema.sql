-- ⚠️ WARNING: PLAIN TEXT PASSWORDS FOR EDUCATIONAL PURPOSE ONLY ⚠️
-- This schema stores passwords in plain text.
-- NEVER use this in production - use bcrypt or similar hashing!

-- Updated users table with comment
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,  -- ⚠️ PLAIN TEXT - FOR LEARNING ONLY
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add password_changed_at column for tracking
ALTER TABLE users ADD COLUMN password_changed_at TIMESTAMP NULL;

-- Sample query to view password (for testing/debugging only)
-- SELECT id, email, password, role FROM users;

-- Sample update query (plain text, for educational purposes)
-- UPDATE users SET password = 'newPassword123', password_changed_at = NOW() WHERE id = 1;

-- Index for faster lookups by email
CREATE INDEX idx_users_email ON users(email);
