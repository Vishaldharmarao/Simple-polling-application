# Polling Application - Technical Architecture & Implementation Guide

## System Overview

This is a full-stack polling application built with:
- **Backend**: Node.js + Express.js + MySQL
- **Frontend**: React 18 + React Router + Axios
- **Communication**: REST APIs (no WebSockets)
- **Authentication**: bcrypt password hashing with localStorage

---

## Backend Architecture

### Folder Structure
```
backend/
├── db/
│   ├── connection.js         # MySQL connection pool
│   └── schema.sql            # Database schema
├── models/
│   └── index.js              # Data models (User, Poll, Vote)
├── controllers/
│   ├── authController.js     # Handle auth requests
│   ├── pollController.js     # Handle poll CRUD
│   └── voteController.js     # Handle voting
├── services/
│   ├── authService.js        # Auth business logic
│   ├── pollService.js        # Poll business logic
│   └── voteService.js        # Vote business logic
├── routes/
│   ├── authRoutes.js         # Auth endpoints
│   ├── pollRoutes.js         # Poll endpoints
│   └── voteRoutes.js         # Vote endpoints
├── server.js                 # Express app setup
├── package.json              # Dependencies
└── .env                      # Environment variables
```

### Request Flow

```
User Request
    ↓
Express Router (routes/*.js)
    ↓
Controller (controllers/*.js) - Validates request
    ↓
Service (services/*.js) - Business logic & validation
    ↓
Model (models/index.js) - Database queries
    ↓
MySQL Database
    ↓
Response sent back
```

### Example: User Voting

```javascript
// 1. Frontend sends request
POST /api/votes
{ userId: 1, pollId: 5, optionId: 3 }

// 2. Route receives it
app.post('/votes', VoteController.submitVote)

// 3. Controller validates
if (!userId || !pollId || !optionId) return error

// 4. Service processes
- Check if poll exists and is active
- Check if user already voted
- Validate option exists
- Submit vote

// 5. Model executes query
INSERT INTO votes (user_id, poll_id, option_id) VALUES (?, ?, ?)

// 6. Response sent
{ success: true, voteId: 42 }
```

---

## Frontend Architecture

### Component Tree
```
App (Router setup)
├── Login (Authentication page)
├── Register (Registration page)
├── PollList (Shows all polls)
│   └── Poll Card (Individual poll)
├── VotePage (Voting interface)
│   ├── Options List (Radio buttons)
│   └── Results Display (Progress bars)
└── AdminDashboard (Admin panel)
    ├── Sidebar Navigation
    ├── View Polls Tab
    │   └── Polls Table
    └── Create Poll Tab
        └── Poll Form
```

### State Management
```javascript
// No Redux/Context - using local component state with hooks

PollList.js:
- polls: Array of poll objects
- loading: Boolean
- error: String

VotePage.js:
- poll: Current poll object
- selectedOption: User's selection
- hasVoted: Boolean
- results: Poll results

AdminDashboard.js:
- polls: All polls
- activeTab: 'view' or 'create'
- formData: New poll data
```

### Data Flow
```
Component renders
    ↓
useEffect runs on mount
    ↓
API call via axios
    ↓
Response received
    ↓
setState updates UI
    ↓
Component re-renders
```

---

## Database Design

### Tables & Relationships

#### Users Table
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,        -- bcrypt hash
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Polls Table
```sql
CREATE TABLE polls (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question VARCHAR(500) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,               -- FK to users
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### Poll Options Table
```sql
CREATE TABLE poll_options (
    id INT PRIMARY KEY AUTO_INCREMENT,
    poll_id INT NOT NULL,                  -- FK to polls
    option_text VARCHAR(255) NOT NULL,
    FOREIGN KEY (poll_id) REFERENCES polls(id)
);
```

#### Votes Table
```sql
CREATE TABLE votes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,                  -- FK to users
    poll_id INT NOT NULL,                  -- FK to polls
    option_id INT NOT NULL,                -- FK to poll_options
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (poll_id) REFERENCES polls(id),
    FOREIGN KEY (option_id) REFERENCES poll_options(id),
    UNIQUE KEY unique_user_poll (user_id, poll_id)  -- One vote per user per poll
);
```

### Key Constraints
- **UNIQUE on email**: Prevents duplicate user accounts
- **UNIQUE on (user_id, poll_id)**: Enforces one vote per user per poll
- **Foreign Keys**: Maintains referential integrity
- **Cascading Delete**: Deleting user/poll removes related records

---

## Authentication Flow

### Registration
```
User Input: email, password
    ↓
Validation (email format, password length)
    ↓
Check if email exists
    ↓
Hash password with bcrypt
    ↓
Insert into database
    ↓
Return userId
```

### Login
```
User Input: email, password
    ↓
Find user by email
    ↓
Compare password with bcrypt hash
    ↓
If match: Return user object (id, email, role)
    ↓
Frontend stores user in localStorage
    ↓
Route to appropriate page (user dashboard or admin dashboard)
```

### Authorization
```
Frontend checks user.role
    ↓
If admin: Allow access to /admin-dashboard
    ↓
If user: Show /polls page
    ↓
Backend also validates role for admin endpoints
```

---

## Vote Management System

### Duplicate Vote Prevention

#### Database Level
```sql
UNIQUE KEY unique_user_poll (user_id, poll_id)
```
- MySQL prevents inserting duplicate (user_id, poll_id)
- Throws error on duplicate attempt

#### Application Level
```javascript
// voteService.js
static async submitVote(userId, pollId, optionId) {
    // Check if already voted
    const hasVoted = await Vote.userHasVoted(userId, pollId);
    if (hasVoted) {
        throw new Error('You have already voted on this poll');
    }
    // Insert vote
    return await Vote.create(userId, pollId, optionId);
}
```

#### Frontend Level
```javascript
// VotePage.js
if (hasVoted) {
    // Show message and disable voting
    return <div>Already voted</div>;
}
```

### Vote Counting & Results

```javascript
// Poll results calculation
const results = options.map(option => {
    const votes = voteMap[option.id] || 0;
    const percentage = (votes / totalVotes * 100).toFixed(2);
    return { option, votes, percentage };
});
```

---

## API Design

### RESTful Principles Used
- **GET**: Retrieve data
- **POST**: Create data
- **PUT**: Update data
- **DELETE**: Remove data

### Consistent Response Format
```javascript
// Success
{ success: true, message: "...", data: {} }

// Error
{ success: false, error: "Error description" }
```

### HTTP Status Codes
- **200**: OK
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **404**: Not Found
- **500**: Server Error

---

## Error Handling

### Validation Errors
```javascript
// Input validation in services
if (!email || !password) {
    throw new Error('Email and password are required');
}
```

### Business Logic Errors
```javascript
// Vote validation
if (hasVoted) {
    throw new Error('You have already voted on this poll');
}
```

### Database Errors
```javascript
// Caught and returned as JSON
catch (err) {
    res.status(500).json({ error: err.message });
}
```

---

## Security Implementation

### Password Security
```javascript
// Registration: Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Login: Compare password
const isValid = await bcrypt.compare(password, storedHash);
```

### SQL Injection Prevention
```javascript
// Using prepared statements
const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email]  // Parameter bound, not concatenated
);
```

### XSS Prevention
```javascript
// React automatically escapes values
<h1>{poll.question}</h1>  // Safe - even if question has HTML
```

### CORS Protection
```javascript
app.use(cors());  // Only allow same origin or configure whitelist
```

---

## Performance Considerations

### Database Optimization
```sql
-- Indexes for faster queries
CREATE INDEX idx_polls_created_by ON polls(created_by);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_poll_id ON votes(poll_id);
```

### Connection Pooling
```javascript
const pool = mysql.createPool({
    connectionLimit: 10,
    queueLimit: 0
});
```

### Frontend Optimization
```javascript
// Lazy loading with React Router
const AdminDashboard = lazy(() => import('./AdminDashboard'));

// Memoization for expensive calculations
const results = useMemo(() => calculateResults(votes), [votes]);
```

---

## Scalability Considerations

### Current Limitations
- Single server (no load balancing)
- Single database (no replication)
- No caching layer

### Future Improvements
- Add Redis for caching
- Implement CDN for static files
- Use database read replicas
- Add message queues (RabbitMQ)
- Implement microservices

---

## Development Workflow

### 1. Feature Development
```
1. Create database migration
2. Add model methods
3. Create/update service
4. Create/update controller
5. Create/update routes
6. Create frontend component
7. Test endpoints
8. Test UI
```

### 2. Testing the Vote Feature
```
1. Create poll via admin
2. Register new user
3. Vote on poll
4. Check results updated
5. Try voting again (should fail)
6. Check database records
```

### 3. Code Quality
```
- Use consistent naming
- Add comments for complex logic
- Validate all inputs
- Handle errors gracefully
- Test edge cases
```

---

## Debugging Guide

### Backend Debugging
```javascript
// Add logging
console.log('Query:', query, 'Params:', params);

// Check request data
console.log('Body:', req.body);

// Error logging
console.error('Error:', error.message);
```

### Frontend Debugging
```javascript
// React DevTools Browser Extension
// Console tab for errors
// Network tab to inspect API calls

// Manual logging
console.log('State:', polls);
console.log('API Response:', response.data);
```

### Database Debugging
```sql
-- Check data
SELECT * FROM users;
SELECT * FROM votes WHERE poll_id = 1;

-- Check constraints
SHOW CREATE TABLE votes;

-- Check query execution
EXPLAIN SELECT * FROM polls WHERE is_active = 1;
```

---

## Deployment Steps

### 1. Environment Setup
```bash
# Create .env with production values
DB_HOST=production-server
DB_USER=prod_user
DB_PASSWORD=secure_password
NODE_ENV=production
```

### 2. Backend Deployment
```bash
npm install --production
npm start

# Or use PM2 for process management
pm2 start server.js --name "polling-api"
```

### 3. Frontend Deployment
```bash
npm run build

# Serve build directory via nginx or upload to S3
```

### 4. Database Setup
```bash
mysql -u root -p < db/schema.sql
```

---

## Maintenance

### Regular Tasks
- Monitor error logs
- Check database performance
- Update dependencies
- Backup database
- Review user feedback

### Monitoring
```
- API response times
- Database query performance
- Error rates
- Active users
- Vote submission success rate
```

---

## Future Features

### Phase 2
- User profiles
- Poll analytics
- Export results to CSV
- Poll scheduling
- Real-time updates (WebSockets)

### Phase 3
- Mobile app
- Social sharing
- Advanced analytics
- A/B testing
- Admin notifications

---

## Conclusion

This polling application demonstrates:
✓ Full-stack development with modern technologies
✓ Clean separation of concerns
✓ Secure password handling
✓ Database integrity constraints
✓ RESTful API design
✓ Responsive React components
✓ Error handling and validation
✓ Production-ready code structure

Ready for enhancement and scaling! 🚀

