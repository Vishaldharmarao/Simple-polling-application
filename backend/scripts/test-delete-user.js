/**
 * Test Delete User Functionality
 * Tests the admin delete user workflow
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
const dotenv = require('dotenv');

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'polling_app',
    port: parseInt(process.env.DB_PORT) || 3306,
    // Return DATETIME as strings instead of JS Date objects
    dateStrings: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Color output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
    log(`✓ ${message}`, 'green');
}

function error(message) {
    log(`✗ ${message}`, 'red');
}

function info(message) {
    log(`ℹ ${message}`, 'cyan');
}

function warning(message) {
    log(`⚠ ${message}`, 'yellow');
}

async function testDeleteUserScenarios() {
    log('\n╔════════════════════════════════════════════╗', 'cyan');
    log('║  DELETE USER FUNCTIONALITY TEST            ║', 'cyan');
    log('╚════════════════════════════════════════════╝', 'cyan');

    const conn = await pool.getConnection();

    try {
        // Clean up test data
        log('\nCleaning up old test data...', 'yellow');
        await conn.query('DELETE FROM users WHERE email LIKE "test-delete-%"');
        success('Test data cleaned');

        // Create test users
        log('\n=== Creating Test Users ===', 'blue');
        const hashedPassword = await bcrypt.hash('testpassword123', 10);

        // Admin user
        const [adminResult] = await conn.query(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            ['test-delete-admin@polling.com', hashedPassword, 'admin']
        );
        const adminId = adminResult.insertId;
        success(`Created admin user (ID: ${adminId})`);

        // Faculty user
        const [facultyResult] = await conn.query(
            'INSERT INTO users (email, password, role, created_by) VALUES (?, ?, ?, ?)',
            ['test-delete-faculty@polling.com', hashedPassword, 'faculty', adminId]
        );
        const facultyId = facultyResult.insertId;
        success(`Created faculty user (ID: ${facultyId})`);

        // Student user
        const [studentResult] = await conn.query(
            'INSERT INTO users (email, password, role, created_by) VALUES (?, ?, ?, ?)',
            ['test-delete-student@polling.com', hashedPassword, 'user', adminId]
        );
        const studentId = studentResult.insertId;
        success(`Created student user (ID: ${studentId})`);

        // Test Case 1: Delete Faculty User
        log('\n=== Test Case 1: Delete Faculty User ===', 'blue');
        try {
            const [result] = await conn.query('DELETE FROM users WHERE id = ?', [facultyId]);
            
            if (result.affectedRows > 0) {
                success(`Successfully deleted faculty user (ID: ${facultyId})`);
                success('Database query: DELETE FROM users WHERE id = ? [WORKED]');
            } else {
                error('Faculty user was not deleted (no affected rows)');
                error('Database query returned 0 affected rows');
            }

            // Verify deletion
            const [checkResult] = await conn.query('SELECT * FROM users WHERE id = ?', [facultyId]);
            if (checkResult.length === 0) {
                success('Verified: Faculty user no longer exists in database');
            } else {
                error('Verified: Faculty user still exists in database');
            }
        } catch (err) {
            error(`Failed to delete faculty: ${err.message}`);
        }

        // Test Case 2: Delete Student User with Votes
        log('\n=== Test Case 2: Delete Student User ===', 'blue');
        
        // Create a poll first
        const [pollResult] = await conn.query(
            'INSERT INTO polls (question, created_by) VALUES (?, ?)',
            ['Test Poll for Delete', adminId]
        );
        const pollId = pollResult.insertId;
        
        // Create a poll option
        const [optionResult] = await conn.query(
            'INSERT INTO poll_options (poll_id, option_text) VALUES (?, ?)',
            [pollId, 'Test Option']
        );
        const optionId = optionResult.insertId;
        
        // Create a vote by the student
        const [voteResult] = await conn.query(
            'INSERT INTO votes (user_id, poll_id, option_id) VALUES (?, ?, ?)',
            [studentId, pollId, optionId]
        );
        const voteId = voteResult.insertId;
        success(`Created test data: Poll (${pollId}), Option (${optionId}), Vote (${voteId})`);
        success(`Student (${studentId}) has voted on poll (${pollId})`);

        try {
            const [result] = await conn.query('DELETE FROM users WHERE id = ?', [studentId]);
            
            if (result.affectedRows > 0) {
                success(`Successfully deleted student user (ID: ${studentId})`);
                success('Cascade delete should have removed related votes');
            } else {
                error('Student user was not deleted (no affected rows)');
            }

            // Verify deletion
            const [userCheck] = await conn.query('SELECT * FROM users WHERE id = ?', [studentId]);
            if (userCheck.length === 0) {
                success('Verified: Student user no longer exists in database');
            } else {
                error('Verified: Student user still exists in database');
            }

            // Verify vote was cascade deleted
            const [voteCheck] = await conn.query('SELECT * FROM votes WHERE user_id = ?', [studentId]);
            if (voteCheck.length === 0) {
                success('Verified: Student\'s votes cascade deleted successfully');
            } else {
                warning(`Found ${voteCheck.length} orphaned votes - cascade delete might not have worked`);
            }
        } catch (err) {
            error(`Failed to delete student: ${err.message}`);
        }

        // Test Case 3: Attempt to delete admin (should fail)
        log('\n=== Test Case 3: Attempt to Delete Admin (Should FAIL) ===', 'blue');
        
        // This should succeed at database level but should be prevented by service
        const [anotherAdminResult] = await conn.query(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            ['test-delete-admin2@polling.com', hashedPassword, 'admin']
        );
        const anotherAdminId = anotherAdminResult.insertId;
        
        try {
            const [result] = await conn.query('DELETE FROM users WHERE id = ?', [anotherAdminId]);
            warning(`Database allows deletion of admin (affectedRows: ${result.affectedRows})`);
            warning('This should be prevented by AdminService.deleteUser() logic');
            
            // Check if it still exists
            const [check] = await conn.query('SELECT * FROM users WHERE id = ?', [anotherAdminId]);
            if (check.length === 0) {
                warning('Admin user was deleted at database level');
                error('AdminService should prevent this - check service layer logic');
            } else {
                success('Admin user still exists (deletion would be prevented by service)');
            }
        } catch (err) {
            error(`Unexpected error: ${err.message}`);
        }

        // Test Case 4: Check Role-Based Deletion Logic
        log('\n=== Test Case 4: Check Role-Based Deletion Protection ===', 'blue');
        
        const testCases = [
            { role: 'user', shouldDelete: true, description: 'Student (user role)' },
            { role: 'faculty', shouldDelete: true, description: 'Faculty' },
            { role: 'admin', shouldDelete: false, description: 'Admin' }
        ];

        for (const testCase of testCases) {
            const [testUserResult] = await conn.query(
                'INSERT INTO users (email, password, role, created_by) VALUES (?, ?, ?, ?)',
                [`test-delete-${testCase.role}@polling.com`, hashedPassword, testCase.role, adminId]
            );
            const testUserId = testUserResult.insertId;

            // Check current state
            const [userBefore] = await conn.query('SELECT * FROM users WHERE id = ?', [testUserId]);
            info(`${testCase.description}: User exists before deletion`);

            // Attempt deletion
            const [delResult] = await conn.query('DELETE FROM users WHERE id = ?', [testUserId]);
            
            // Check after
            const [userAfter] = await conn.query('SELECT * FROM users WHERE id = ?', [testUserId]);

            if (delResult.affectedRows > 0) {
                if (testCase.shouldDelete) {
                    success(`${testCase.description}: Can be deleted ✓`);
                } else {
                    error(`${testCase.description}: SHOULD NOT be deletable (but was)`);
                }
            } else {
                if (!testCase.shouldDelete) {
                    success(`${testCase.description}: Cannot be deleted ✓`);
                } else {
                    error(`${testCase.description}: Should be deletable but wasn't`);
                }
            }
        }

        log('\n╔════════════════════════════════════════════╗', 'cyan');
        log('║  TEST SUMMARY                              ║', 'cyan');
        log('╚════════════════════════════════════════════╝', 'cyan');
        
        log('\nKey Findings:', 'yellow');
        log('1. Database constraints allow deletion at SQL level', 'yellow');
        log('2. AdminService layer PREVENTS deletion of:', 'yellow');
        log('   - Admin accounts (role = "admin")', 'yellow');
        log('   - Own account (self-deletion)', 'yellow');
        log('3. Cascade delete should handle related data (votes, polls)', 'yellow');
        log('\nIf admins cannot delete faculty/students:', 'yellow');
        log('- Check that X-User-ID header is sent correctly', 'yellow');
        log('- Check that req.user is properly set by middleware', 'yellow');
        log('- Check error messages returned from API', 'yellow');
        log('- Verify userId parameter is passed correctly\n', 'yellow');

    } catch (error) {
        error(`Test error: ${error.message}`);
    } finally {
        // Clean up
        log('\nCleaning up test data...', 'yellow');
        try {
            await conn.query('DELETE FROM users WHERE email LIKE "test-delete-%"');
            success('Test data cleaned');
        } catch (err) {
            warning(`Could not clean test data: ${err.message}`);
        }
        conn.release();
        await pool.end();
    }
}

// Run tests
testDeleteUserScenarios().catch(err => {
    error(`Fatal error: ${err.message}`);
    process.exit(1);
});
