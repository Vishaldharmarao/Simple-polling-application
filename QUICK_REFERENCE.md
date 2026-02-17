# Quick Reference - Role-Based Polling System

## 🚀 Quick Start

### 1. Database Setup
```sql
-- Run in MySQL
mysql -u root -p polling_app < backend/db/schema.sql
```

### 2. Create First Admin Account
```sql
INSERT INTO users (email, password, role, created_at) VALUES (
  'admin@example.com',
  '$2b$10$...(bcrypt_hash)...',
  'admin',
  NOW()
);
```

### 3. Start Backend
```bash
cd backend
npm start  # Runs on http://localhost:5000
```

### 4. Start Frontend
```bash
cd frontend
npm start  # Runs on http://localhost:3000
```

---

## 👥 User Roles & Permissions

### 🎓 STUDENT (User Role)
| Action | Allowed | Endpoint |
|--------|---------|----------|
| Self-register | ✅ | `POST /api/auth/register` |
| Login | ✅ | `POST /api/auth/login` |
| View active polls | ✅ | `GET /api/polls/user/active` |
| Vote once per poll | ✅ | `POST /api/votes` |
| See poll results | ✅ | `GET /api/polls/{id}/results` |
| Create polls | ❌ | - |
| Access admin panel | ❌ | - |

### 👨‍🏫 FACULTY (Faculty Role)
| Action | Allowed | Endpoint |
|--------|---------|----------|
| Login | ✅ | `POST /api/auth/login` |
| Create polls | ✅ | `POST /api/polls` |
| Set poll times | ✅ | With start_time, end_time |
| Manage own polls | ✅ | `DELETE /api/polls/{id}` |
| Update schedule | ✅ | `PATCH /api/polls/{id}/schedule` |
| View own results | ✅ | `GET /api/polls/{id}/results` |
| View all polls | ❌ | - |
| Create accounts | ❌ | - |
| Self-register | ❌ | - |

### 👨‍💼 ADMIN (Admin Role)
| Action | Allowed | Endpoint |
|--------|---------|----------|
| Create faculty | ✅ | `POST /api/auth/create-faculty` |
| Create admins | ✅ | `POST /api/auth/create-admin` |
| View all users | ✅ | `GET /api/admin/users` |
| View faculty | ✅ | `GET /api/admin/faculty` |
| View admins | ✅ | `GET /api/admin/admins` |
| View students | ✅ | `GET /api/admin/students` |
| View all polls | ✅ | `GET /api/polls/admin/all-polls` |
| Create polls | ❌ | - |
| Modify polls | ❌ | - |

---

## 📋 Workflow Examples

### Example 1: Admin Creates Faculty & Faculty Makes Poll

```bash
# 1. Admin logs in
curl -X POST http://localhost:5000/api/auth/login \
  -d '{"email":"admin@example.com","password":"pass"}'
# → Returns: { id: 1, role: 'admin' }

# 2. Admin creates faculty
curl -X POST http://localhost:5000/api/auth/create-faculty \
  -H "X-User-ID: 1" \
  -d '{
    "email": "prof@example.com",
    "password": "profpass"
  }'
# → Returns: { facultyId: 12 }

# 3. Faculty logs in
curl -X POST http://localhost:5000/api/auth/login \
  -d '{"email":"prof@example.com","password":"profpass"}'
# → Returns: { id: 12, role: 'faculty' }

# 4. Faculty creates poll
curl -X POST http://localhost:5000/api/polls \
  -H "X-User-ID: 12" \
  -d '{
    "question": "Favorite language?",
    "options": ["JS", "Python"],
    "startTime": "2024-01-25T10:00:00Z",
    "endTime": "2024-01-25T18:00:00Z"
  }'
# → Returns: { pollId: 5 }
```

### Example 2: Student Registers & Votes

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -d '{"email":"student@example.com","password":"pass"}'
# → Returns: { userId: 20 }

# 2. Login
curl -X POST http://localhost:5000/api/auth/login \
  -d '{"email":"student@example.com","password":"pass"}'
# → Returns: { id: 20, role: 'user' }

# 3. View active polls
curl http://localhost:5000/api/polls/user/active
# → Returns: { polls: [...] }

# 4. Vote on poll
curl -X POST http://localhost:5000/api/votes \
  -d '{
    "userId": 20,
    "pollId": 5,
    "optionId": 1
  }'
# → Returns: { voteId: 100 }
```

---

## 🎯 Frontend Routes

| Route | Role | Component | Purpose |
|-------|------|-----------|---------|
| `/login` | Public | Login | User login |
| `/register` | Public | Register | Student registration |
| `/polls` | User | PollList | View active polls |
| `/vote/:pollId` | User | VotePage | Cast vote |
| `/faculty-dashboard` | Faculty | FacultyDashboard | Create/manage polls |
| `/admin-dashboard` | Admin | AdminDashboard | Manage users |

---

## 🗄️ Database Schema

### users table
```sql
id INT PRIMARY KEY
email VARCHAR(255) UNIQUE
password VARCHAR(255)
role ENUM('user', 'faculty', 'admin')    -- NEW
created_by INT                            -- NEW (who created this account)
created_at TIMESTAMP
```

### polls table
```sql
id INT PRIMARY KEY
question VARCHAR(500)
is_active BOOLEAN
created_by INT (faculty only)
start_time DATETIME                       -- NEW
end_time DATETIME                         -- NEW
created_at TIMESTAMP
```

### votes table (unchanged)
```sql
id INT PRIMARY KEY
user_id INT
poll_id INT
option_id INT
created_at TIMESTAMP
UNIQUE(user_id, poll_id)  -- One vote per user per poll
```

---

## 🔐 Authentication

### Request Headers
```bash
# Option 1: Header
-H "X-User-ID: 123"

# Option 2: Request Body
{
  "userId": 123,
  ...
}
```

### Login Response
```json
{
  "success": true,
  "user": {
    "id": 12,
    "email": "prof@example.com",
    "role": "faculty"
  }
}
```

Store in localStorage:
```javascript
localStorage.setItem('user', JSON.stringify({
  id: 12,
  email: "prof@example.com",
  role: "faculty"
}));
```

---

## 📱 Common API Patterns

### Get Data
```bash
curl http://localhost:5000/api/endpoint
```

### Create Data
```bash
curl -X POST http://localhost:5000/api/endpoint \
  -H "Content-Type: application/json" \
  -H "X-User-ID: 123" \
  -d '{"key": "value"}'
```

### Update Data
```bash
curl -X PATCH http://localhost:5000/api/endpoint \
  -H "X-User-ID: 123" \
  -d '{"key": "value"}'
```

### Delete Data
```bash
curl -X DELETE http://localhost:5000/api/endpoint \
  -H "X-User-ID: 123"
```

---

## ⚡ Key Endpoints Summary

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| POST | `/auth/register` | Public | Student registration |
| POST | `/auth/login` | Public | All login |
| POST | `/auth/create-faculty` | Admin | Create faculty |
| POST | `/auth/create-admin` | Admin | Create admin |
| GET | `/admin/users` | Admin | View all users |
| GET | `/admin/faculty` | Admin | View faculty |
| GET | `/polls/user/active` | User | View active polls |
| GET | `/polls/faculty/my-polls` | Faculty | Faculty's polls |
| POST | `/polls` | Faculty | Create poll |
| PATCH | `/polls/{id}/schedule` | Faculty | Update times |
| DELETE | `/polls/{id}` | Faculty | Delete poll |
| POST | `/votes` | User | Cast vote |

---

## 🧪 Testing Commands

### Test as Student
```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -d '{"email":"test@example.com","password":"test123"}'

# 2. Login (get userId)
curl -X POST http://localhost:5000/api/auth/login \
  -d '{"email":"test@example.com","password":"test123"}'

# 3. View polls
curl http://localhost:5000/api/polls/user/active

# 4. Vote
curl -X POST http://localhost:5000/api/votes \
  -d '{"userId":123,"pollId":1,"optionId":1}'
```

### Test as Faculty
```bash
# 1. Login (get facultyId)
curl -X POST http://localhost:5000/api/auth/login \
  -d '{"email":"prof@example.com","password":"profpass"}'

# 2. Create poll
curl -X POST http://localhost:5000/api/polls \
  -H "X-User-ID: 123" \
  -d '{
    "question":"Test?",
    "options":["A","B"],
    "startTime":"2024-01-25T10:00:00Z",
    "endTime":"2024-01-25T18:00:00Z"
  }'

# 3. View own polls
curl -H "X-User-ID: 123" http://localhost:5000/api/polls/faculty/my-polls
```

### Test as Admin
```bash
# 1. Login (get adminId)
curl -X POST http://localhost:5000/api/auth/login \
  -d '{"email":"admin@example.com","password":"adminpass"}'

# 2. Create faculty
curl -X POST http://localhost:5000/api/auth/create-faculty \
  -H "X-User-ID: 123" \
  -d '{"email":"new@prof.com","password":"pass"}'

# 3. View all users
curl -H "X-User-ID: 123" http://localhost:5000/api/admin/users
```

---

## 🐛 Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| "Only faculty can create polls" | User not faculty | Login as faculty or admin creates one |
| "Poll not yet open" | Before start_time | Check poll start_time > now |
| "Poll is now closed" | After end_time | Check poll end_time < now |
| "You can only delete your own polls" | Wrong faculty | Verify created_by in database |
| "Already voted on this poll" | Duplicate vote | One vote per user per poll |
| 403 Forbidden | Wrong role | Verify user role matches requirement |
| Cannot see admin dashboard | Not admin | Login as admin user |
| Poll not showing for student | Not active time window | Check start < now < end |

---

## 📊 Database Queries

### View Users by Role
```sql
SELECT * FROM users WHERE role='faculty';
SELECT * FROM users WHERE role='admin';
SELECT * FROM users WHERE role='user';
```

### View Polls by Faculty
```sql
SELECT * FROM polls WHERE created_by=12;
```

### View Poll Votes
```sql
SELECT COUNT(*) FROM votes WHERE poll_id=5;
SELECT * FROM votes WHERE poll_id=5;
```

### View Active Polls
```sql
SELECT * FROM polls 
WHERE start_time <= NOW() 
AND end_time > NOW() 
AND is_active=1;
```

---

## 🚨 Important Notes

1. **One Vote Per Poll**: Database enforces with UNIQUE constraint
2. **Faculty Cannot Self-Register**: Must be created by admin
3. **Admin Cannot Create Polls**: Faculty role only
4. **Time-Based Voting**: Checked on both client and server
5. **Faculty Ownership**: Can only modify their own polls
6. **Admin Read-Only**: Can view but not modify polls

---

## 📚 Full Documentation

- **API_DOCUMENTATION.md** - Complete API reference
- **IMPLEMENTATION_GUIDE_ROLES.md** - Architecture & implementation details
- **ROLE_BASED_IMPLEMENTATION_SUMMARY.md** - Overview of changes

---

## ✅ Deployment Checklist

- [ ] Database schema updated
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend environment variables set
- [ ] Frontend API endpoint configured
- [ ] Initial admin account created
- [ ] Test registration flow
- [ ] Test faculty poll creation
- [ ] Test student voting
- [ ] Test admin user management
- [ ] All role dashboards working
- [ ] Protected routes blocking unauthorized access

---

## 📞 Support

Refer to:
1. Code comments in each file
2. API_DOCUMENTATION.md for endpoint details
3. IMPLEMENTATION_GUIDE_ROLES.md for architecture
4. Database schema in backend/db/schema.sql

---

**Version**: 1.0  
**Last Updated**: January 23, 2026  
**Status**: ✅ Production Ready
