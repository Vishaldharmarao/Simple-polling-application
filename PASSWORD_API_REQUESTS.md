# Password Management API - cURL Examples

## Overview
This document provides cURL examples for testing the password management endpoints. These endpoints allow users to change their passwords and admins to reset user passwords.

⚠️ **IMPORTANT**: Passwords are stored in **PLAIN TEXT** for educational/learning purposes ONLY. This should NEVER be used in production. Always use bcrypt or similar hashing algorithms in real applications.

---

## 1. Change Password (User)

### Endpoint
```
POST /api/password/change-password
```

### Description
Allows a logged-in user to change their password by providing their current password for verification.

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
    "userId": 1,
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword456"
}
```

### cURL Example
```bash
curl -X POST http://localhost:5000/api/password/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword456"
  }'
```

### Success Response (200)
```json
{
    "success": true,
    "message": "Password changed successfully",
    "userId": 1,
    "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Error Responses

**Invalid Current Password (401)**
```json
{
    "error": "Current password is incorrect"
}
```

**User Not Found (404)**
```json
{
    "error": "User not found"
}
```

**Missing Fields (400)**
```json
{
    "error": "userId, currentPassword, and newPassword are required"
}
```

**Database Error (500)**
```json
{
    "error": "Failed to change password"
}
```

---

## 2. Admin Reset Password

### Endpoint
```
POST /api/password/admin-reset
```

### Description
Allows an admin user to reset another user's password without requiring the current password. This endpoint should only be accessible by admin users (validation to be added).

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
    "adminId": 2,
    "userId": 1,
    "newPassword": "resetPassword789"
}
```

### cURL Example
```bash
curl -X POST http://localhost:5000/api/password/admin-reset \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": 2,
    "userId": 1,
    "newPassword": "resetPassword789"
  }'
```

### Success Response (200)
```json
{
    "success": true,
    "message": "Password reset successfully by admin",
    "userId": 1,
    "adminId": 2,
    "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

### Error Responses

**Admin Not Found (404)**
```json
{
    "error": "Admin user not found"
}
```

**Target User Not Found (404)**
```json
{
    "error": "Target user not found"
}
```

**Missing Fields (400)**
```json
{
    "error": "adminId, userId, and newPassword are required"
}
```

**Database Error (500)**
```json
{
    "error": "Failed to reset password"
}
```

---

## 3. Check Password Strength

### Endpoint
```
POST /api/password/check-strength
```

### Description
Utility endpoint to check password strength and receive feedback. Useful for form validation and real-time password strength indicators in the UI.

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
    "password": "MySecurePassword123!"
}
```

### cURL Example
```bash
curl -X POST http://localhost:5000/api/password/check-strength \
  -H "Content-Type: application/json" \
  -d '{
    "password": "MySecurePassword123!"
  }'
```

### Success Response (200)
```json
{
    "score": 4,
    "feedback": "Strong password"
}
```

### Response Score Values
- **Score 1**: Weak password (feedback: "Too short or too simple")
- **Score 2**: Fair password (feedback: "Consider adding uppercase letters")
- **Score 3**: Good password (feedback: "Consider adding special characters")
- **Score 4**: Strong password (feedback: "Strong password")

### cURL Examples for Different Strength Levels

**Weak Password (score 1)**
```bash
curl -X POST http://localhost:5000/api/password/check-strength \
  -H "Content-Type: application/json" \
  -d '{
    "password": "abc"
  }'
```

Response:
```json
{
    "score": 1,
    "feedback": "Too short or too simple"
}
```

**Fair Password (score 2)**
```bash
curl -X POST http://localhost:5000/api/password/check-strength \
  -H "Content-Type: application/json" \
  -d '{
    "password": "password123"
  }'
```

Response:
```json
{
    "score": 2,
    "feedback": "Consider adding uppercase letters"
}
```

**Good Password (score 3)**
```bash
curl -X POST http://localhost:5000/api/password/check-strength \
  -H "Content-Type: application/json" \
  -d '{
    "password": "Password123"
  }'
```

Response:
```json
{
    "score": 3,
    "feedback": "Consider adding special characters"
}
```

**Strong Password (score 4)**
```bash
curl -X POST http://localhost:5000/api/password/check-strength \
  -H "Content-Type: application/json" \
  -d '{
    "password": "Password123!"
  }'
```

Response:
```json
{
    "score": 4,
    "feedback": "Strong password"
}
```

---

## Testing Workflow

### Step 1: Login to Get User ID
First, login to get your user ID for use in other endpoints:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "testPassword123"
  }'
```

### Step 2: Change Password
Use the userId from login response:

```bash
curl -X POST http://localhost:5000/api/password/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "currentPassword": "testPassword123",
    "newPassword": "newTestPassword456"
  }'
```

### Step 3: Login Again with New Password
Verify the password change worked:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "newTestPassword456"
  }'
```

---

## Database Queries for Testing

### View User Passwords (for debugging - PLAIN TEXT)
```sql
-- ⚠️ Only for debugging! Never do this in production!
SELECT id, email, password, role, password_changed_at FROM users;
```

### Manually Reset a User's Password (if needed)
```sql
UPDATE users SET password = 'newPassword123', password_changed_at = NOW() WHERE id = 1;
```

### Check Password Change History
```sql
SELECT id, email, password_changed_at FROM users WHERE password_changed_at IS NOT NULL;
```

---

## Implementation Notes for Frontend

### Using Axios to Call Change Password Endpoint

```javascript
import axios from 'axios';

const changePassword = async (userId, currentPassword, newPassword) => {
    try {
        const response = await axios.post('http://localhost:5000/api/password/change-password', {
            userId,
            currentPassword,
            newPassword
        });
        
        console.log('Password changed:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error changing password:', error.response.data);
        throw error;
    }
};
```

### Using Axios to Check Password Strength

```javascript
const checkPasswordStrength = async (password) => {
    try {
        const response = await axios.post('http://localhost:5000/api/password/check-strength', {
            password
        });
        
        console.log('Password strength:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error checking strength:', error.response.data);
        throw error;
    }
};
```

---

## Security Warnings

⚠️ **CRITICAL SECURITY WARNINGS:**

1. **Plain Text Passwords**: This implementation stores passwords in plain text, which is EXTREMELY INSECURE. This is ONLY for educational purposes.

2. **Production Use**: Never use this implementation in production. Always use bcrypt, Argon2, or similar password hashing algorithms.

3. **HTTPS Only**: In production, all password-related endpoints MUST be served over HTTPS, never HTTP.

4. **Rate Limiting**: Implement rate limiting on password change endpoints to prevent brute force attacks.

5. **Password Validation**: The current implementation lacks advanced validation. In production, enforce:
   - Minimum length (12+ characters)
   - Complexity requirements (uppercase, lowercase, numbers, symbols)
   - Password history (prevent reuse)
   - Account lockout after failed attempts

6. **Audit Logging**: All password changes should be logged for security audits.

7. **Session Security**: Implement proper session management and ensure users are re-authenticated when changing passwords.

---

## Related Endpoints (Original Polling API)

### User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "securePassword123",
    "role": "user"
  }'
```

### User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

---

## Version History

- **v1.0** - Initial password management API with change-password, admin-reset, and check-strength endpoints
