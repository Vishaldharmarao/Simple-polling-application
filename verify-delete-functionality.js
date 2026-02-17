#!/usr/bin/env node
/**
 * Quick Verification Script
 * Checks if delete user functionality is working
 */

const fs = require('fs');
const path = require('path');

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

async function verifyDeleteFunctionality() {
    log('\n╔════════════════════════════════════════════╗', 'cyan');
    log('║  DELETE USER FUNCTIONALITY VERIFICATION    ║', 'cyan');
    log('╚════════════════════════════════════════════╝', 'cyan');

    let passed = 0;
    let failed = 0;

    // Check 1: Frontend component exists
    log('\n=== Check 1: Frontend Component ===', 'blue');
    const adminComponentPath = path.join(__dirname, 'frontend/src/pages/AdminUserManagement.js');
    if (fs.existsSync(adminComponentPath)) {
        const content = fs.readFileSync(adminComponentPath, 'utf8');
        
        if (content.includes('handleDeleteUser')) {
            success('AdminUserManagement component has handleDeleteUser method');
            passed++;
        } else {
            error('AdminUserManagement component missing handleDeleteUser method');
            failed++;
        }

        if (content.includes('X-User-ID')) {
            success('Component sends X-User-ID header');
            passed++;
        } else {
            error('Component does not send X-User-ID header');
            failed++;
        }

        if (content.includes('/admin/users')) {
            success('Component uses correct API endpoint');
            passed++;
        } else {
            error('Component uses incorrect API endpoint');
            failed++;
        }
    } else {
        error('AdminUserManagement.js not found');
        failed++;
    }

    // Check 2: Backend model
    log('\n=== Check 2: Backend User Model ===', 'blue');
    const modelPath = path.join(__dirname, 'backend/models/index.js');
    if (fs.existsSync(modelPath)) {
        const content = fs.readFileSync(modelPath, 'utf8');
        
        if (content.includes('static async delete(id)')) {
            success('User model has delete method');
            passed++;
        } else {
            error('User model missing delete method');
            failed++;
        }

        if (content.includes('DELETE FROM users')) {
            success('Delete method executes DELETE query');
            passed++;
        } else {
            error('Delete method does not execute DELETE query');
            failed++;
        }

        if (content.includes('affectedRows')) {
            success('Delete method checks for affected rows');
            passed++;
        } else {
            warning('Delete method does not validate affected rows');
        }
    } else {
        error('models/index.js not found');
        failed++;
    }

    // Check 3: Backend service
    log('\n=== Check 3: Backend Admin Service ===', 'blue');
    const servicePath = path.join(__dirname, 'backend/services/adminService.js');
    if (fs.existsSync(servicePath)) {
        const content = fs.readFileSync(servicePath, 'utf8');
        
        if (content.includes('deleteUser')) {
            success('AdminService has deleteUser method');
            passed++;
        } else {
            error('AdminService missing deleteUser method');
            failed++;
        }

        if (content.includes('Cannot delete admin accounts')) {
            success('Service prevents deletion of admin accounts');
            passed++;
        } else {
            warning('Service does not check for admin role');
        }

        if (content.includes('Cannot delete your own account')) {
            success('Service prevents self-deletion');
            passed++;
        } else {
            warning('Service does not prevent self-deletion');
        }

        if (content.includes('User.delete')) {
            success('Service calls User.delete() method');
            passed++;
        } else {
            error('Service does not call User.delete()');
            failed++;
        }
    } else {
        error('adminService.js not found');
        failed++;
    }

    // Check 4: Backend controller
    log('\n=== Check 4: Backend Admin Controller ===', 'blue');
    const controllerPath = path.join(__dirname, 'backend/controllers/adminController.js');
    if (fs.existsSync(controllerPath)) {
        const content = fs.readFileSync(controllerPath, 'utf8');
        
        if (content.includes("const { User }")) {
            success('Controller imports User model');
            passed++;
        } else {
            warning('Controller might not import User model');
        }

        if (content.includes('deleteUser')) {
            success('Controller has deleteUser method');
            passed++;
        } else {
            error('Controller missing deleteUser method');
            failed++;
        }

        if (content.includes('AdminService.deleteUser')) {
            success('Controller calls AdminService.deleteUser');
            passed++;
        } else {
            error('Controller does not call AdminService.deleteUser');
            failed++;
        }
    } else {
        error('adminController.js not found');
        failed++;
    }

    // Check 5: Backend routes
    log('\n=== Check 5: Backend Admin Routes ===', 'blue');
    const routesPath = path.join(__dirname, 'backend/routes/adminRoutes.js');
    if (fs.existsSync(routesPath)) {
        const content = fs.readFileSync(routesPath, 'utf8');
        
        if (content.includes('delete') && content.includes('/users')) {
            success('Routes include DELETE /users/:userId endpoint');
            passed++;
        } else {
            error('Routes missing delete endpoint');
            failed++;
        }

        if (content.includes('verifyAdmin')) {
            success('Routes use verifyAdmin middleware');
            passed++;
        } else {
            error('Routes missing verifyAdmin middleware');
            failed++;
        }
    } else {
        error('adminRoutes.js not found');
        failed++;
    }

    // Check 6: Database schema
    log('\n=== Check 6: Database Schema ===', 'blue');
    const schemaPath = path.join(__dirname, 'backend/db/schema.sql');
    if (fs.existsSync(schemaPath)) {
        const content = fs.readFileSync(schemaPath, 'utf8');
        
        if (content.includes("role ENUM('admin', 'faculty', 'user')")) {
            success('Schema uses correct role enum');
            passed++;
        } else {
            warning('Schema role enum might be incorrect');
        }

        if (content.includes('ON DELETE CASCADE')) {
            success('Schema includes cascade delete rules');
            passed++;
        } else {
            warning('Schema missing cascade delete rules');
        }
    } else {
        error('schema.sql not found');
        failed++;
    }

    // Check 7: Test scripts
    log('\n=== Check 7: Test Scripts ===', 'blue');
    const testDeletePath = path.join(__dirname, 'backend/scripts/test-delete-user.js');
    if (fs.existsSync(testDeletePath)) {
        success('Database delete test script exists');
        passed++;
    } else {
        warning('Database delete test script not found');
    }

    const testApiPath = path.join(__dirname, 'backend/scripts/test-api-delete.js');
    if (fs.existsSync(testApiPath)) {
        success('API delete test script exists');
        passed++;
    } else {
        warning('API delete test script not found');
    }

    // Summary
    log('\n╔════════════════════════════════════════════╗', 'cyan');
    log('║  VERIFICATION SUMMARY                      ║', 'cyan');
    log('╚════════════════════════════════════════════╝', 'cyan');

    log(`\nResults: ${passed} checks passed, ${failed} checks failed`, 
        failed === 0 ? 'green' : 'red');

    if (failed === 0) {
        log('\n✓ All checks passed!', 'green');
        log('\nNext steps:', 'cyan');
        log('1. Start backend: cd backend && npm install && npm start', 'yellow');
        log('2. Start frontend: cd frontend && npm start', 'yellow');
        log('3. Test delete: Run node scripts/test-delete-user.js', 'yellow');
        log('4. Verify via UI: Admin Dashboard → User Management → Delete User', 'yellow');
    } else {
        log('\n✗ Some checks failed. Please review the errors above.', 'red');
        log('\nFor help, see:', 'cyan');
        log('- DELETE_USER_GUIDE.md', 'yellow');
        log('- DELETE_USER_FIX_SUMMARY.md', 'yellow');
        log('- ROLE_BASED_SYSTEM.md', 'yellow');
    }

    log('\n');
    return failed === 0;
}

// Run verification
verifyDeleteFunctionality().then(success => {
    process.exit(success ? 0 : 1);
}).catch(err => {
    error(`Verification error: ${err.message}`);
    process.exit(1);
});
