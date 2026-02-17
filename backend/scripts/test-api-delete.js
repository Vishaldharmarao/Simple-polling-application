/**
 * Test API Delete User Endpoint
 * Simulates actual API calls to test delete functionality
 */

const http = require('http');

// Configuration
const API_HOST = 'localhost';
const API_PORT = 5000;

// Colors
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

/**
 * Make HTTP request
 */
function makeRequest(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...headers
        };

        let body = '';
        if (data) {
            body = JSON.stringify(data);
            defaultHeaders['Content-Length'] = Buffer.byteLength(body);
        }

        const options = {
            hostname: API_HOST,
            port: API_PORT,
            path: path,
            method: method,
            headers: defaultHeaders
        };

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    statusMessage: res.statusMessage,
                    headers: res.headers,
                    body: responseData ? JSON.parse(responseData) : null
                });
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (body) {
            req.write(body);
        }

        req.end();
    });
}

/**
 * Run API tests
 */
async function runAPITests() {
    log('\n╔════════════════════════════════════════════╗', 'cyan');
    log('║  DELETE USER API ENDPOINT TEST             ║', 'cyan');
    log('╚════════════════════════════════════════════╝', 'cyan');

    info('\nNote: Make sure backend server is running on localhost:5000');
    info('Run: cd backend && npm start\n');

    try {
        // Step 1: Create test users
        log('\n=== Step 1: Getting Admin User ===', 'blue');
        const loginResponse = await makeRequest('POST', '/api/auth/login', {
            email: 'admin@polling.com',
            password: 'admin123'
        });

        if (loginResponse.status !== 200) {
            warning('Default admin account not found or incorrect password');
            warning('Please create admin account: admin@polling.com / admin123');
            return;
        }

        const adminId = loginResponse.body.user.id;
        success(`Logged in as admin (ID: ${adminId})`);
        info(`Response: ${JSON.stringify(loginResponse.body)}`);

        // Step 2: Create a test student to delete
        log('\n=== Step 2: Creating Test Student ===', 'blue');
        const createResponse = await makeRequest('POST', '/api/admin/users', 
            {
                email: `test-student-${Date.now()}@polling.com`,
                password: 'testpass123',
                role: 'user'
            },
            { 'X-User-ID': adminId.toString() }
        );

        if (createResponse.status !== 201) {
            error(`Failed to create student: ${createResponse.status}`);
            error(`Response: ${JSON.stringify(createResponse.body)}`);
            return;
        }

        const studentId = createResponse.body.userId;
        const studentEmail = `test-student-${Date.now()}@polling.com`;
        success(`Created test student (ID: ${studentId}, Email: ${studentEmail})`);
        info(`Response: ${JSON.stringify(createResponse.body)}`);

        // Step 3: Verify student exists
        log('\n=== Step 3: Verify Student Exists ===', 'blue');
        const getResponse = await makeRequest('GET', `/api/admin/users/${studentId}`,
            null,
            { 'X-User-ID': adminId.toString() }
        );

        if (getResponse.status !== 200) {
            error(`Failed to get student: ${getResponse.status}`);
            return;
        }

        success(`Student exists: ${getResponse.body.user.email} (role: ${getResponse.body.user.role})`);

        // Step 4: Delete student
        log('\n=== Step 4: Delete Student User ===', 'blue');
        info(`Sending DELETE request to /api/admin/users/${studentId}`);
        info(`With header: X-User-ID: ${adminId}`);
        
        const deleteResponse = await makeRequest('DELETE', `/api/admin/users/${studentId}`,
            null,
            { 'X-User-ID': adminId.toString() }
        );

        if (deleteResponse.status === 200 && deleteResponse.body.success) {
            success(`Successfully deleted student (ID: ${studentId})`);
            success(`Response message: ${deleteResponse.body.message}`);
            info(`Full response: ${JSON.stringify(deleteResponse.body)}`);
        } else {
            error(`Failed to delete student`);
            error(`Status: ${deleteResponse.status}`);
            error(`Response: ${JSON.stringify(deleteResponse.body)}`);
            error(`Did the admin have proper permissions? Check middleware logs.`);
        }

        // Step 5: Verify deletion
        log('\n=== Step 5: Verify Deletion ===', 'blue');
        const verifyResponse = await makeRequest('GET', `/api/admin/users/${studentId}`,
            null,
            { 'X-User-ID': adminId.toString() }
        );

        if (verifyResponse.status === 404) {
            success(`Confirmed: Student user no longer exists`);
        } else if (verifyResponse.status === 200) {
            error(`Student user still exists in database`);
            error(`This indicates the DELETE request did not work properly`);
        } else {
            warning(`Unexpected response status: ${verifyResponse.status}`);
        }

        // Test 2: Create and delete faculty
        log('\n=== Test 2: Create and Delete Faculty ===', 'blue');
        const createFacultyResponse = await makeRequest('POST', '/api/admin/users',
            {
                email: `test-faculty-${Date.now()}@polling.com`,
                password: 'testpass123',
                role: 'faculty'
            },
            { 'X-User-ID': adminId.toString() }
        );

        if (createFacultyResponse.status === 201) {
            const facultyId = createFacultyResponse.body.userId;
            success(`Created test faculty (ID: ${facultyId})`);

            const deleteFacultyResponse = await makeRequest('DELETE', `/api/admin/users/${facultyId}`,
                null,
                { 'X-User-ID': adminId.toString() }
            );

            if (deleteFacultyResponse.status === 200) {
                success(`Successfully deleted faculty (ID: ${facultyId})`);
            } else {
                error(`Failed to delete faculty: ${deleteFacultyResponse.status}`);
                error(`Response: ${JSON.stringify(deleteFacultyResponse.body)}`);
            }
        }

        // Summary
        log('\n╔════════════════════════════════════════════╗', 'cyan');
        log('║  TEST SUMMARY                              ║', 'cyan');
        log('╚════════════════════════════════════════════╝', 'cyan');
        
        log('\nIf deletion fails, check:', 'yellow');
        log('1. Backend server is running on port 5000', 'yellow');
        log('2. Admin user exists with correct credentials', 'yellow');
        log('3. X-User-ID header is being sent', 'yellow');
        log('4. Middleware is properly extracting userId', 'yellow');
        log('5. AdminService.deleteUser() logic is correct', 'yellow');
        log('6. Check console logs on backend for errors\n', 'yellow');

    } catch (err) {
        error(`\nConnection error: ${err.message}`);
        error(`Make sure backend is running: cd backend && npm start`);
        error(`Backend should be accessible at http://localhost:5000`);
    }
}

// Run tests
runAPITests();
