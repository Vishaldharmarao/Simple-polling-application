# Quick Start Guide - Polling Application

## Prerequisites
- Node.js 14+ and npm
- MySQL 8.0+
- Git (optional)

## Installation & Running (5 minutes)

### Step 1: Database Setup
```bash
# Open MySQL and create the database
mysql -u root -p

# In MySQL shell:
CREATE DATABASE polling_app;
USE polling_app;

# Exit MySQL
exit

# Load schema
mysql -u root -p polling_app < backend/db/schema.sql
```

### Step 2: Backend Setup
```bash
cd backend
npm install
npm start
# Backend runs on http://localhost:5000
```

### Step 3: Frontend Setup (New Terminal)
```bash
cd frontend
npm install
npm start
# Frontend runs on http://localhost:3000
```

## Quick Test Flow

### 1. First Time Setup
1. **Register** → Create account (any email/password)
2. **Admin Setup** → Update user in database:
   ```sql
   UPDATE users SET role='admin' WHERE id=1;
   ```

### 2. Admin Creates Poll
1. Login with admin account
2. Go to Admin Dashboard
3. Click "Create Poll"
4. Add question: "What's your favorite color?"
5. Add options: "Red", "Blue", "Green"
6. Click "Create Poll"

### 3. User Votes
1. Register/Login as different user
2. See polls on main page
3. Click "View Poll"
4. Select an option
5. Click "Submit Vote"
6. See results update

---

## Project Architecture

### Backend Architecture
```
Request → Routes → Controllers → Services → Models → Database
           ↓        ↓            ↓         ↓       ↓
         Express   Auth/Poll    Business  Query   MySQL
                   Logic        Logic     Logic
```

### Frontend Architecture
```
User → Component → Service (API Call) → Backend
                       ↓
                    Axios
                       ↓
                    REST API
```

---

## Key Technologies

### Backend
- **Express.js**: REST API framework
- **MySQL2**: Database driver
- **bcrypt**: Password hashing
- **dotenv**: Environment management

### Frontend
- **React 18**: UI library
- **React Router**: Navigation
- **Axios**: HTTP client
- **CSS3**: Styling & responsive design

---

## Core Features Implementation

### 1. Authentication
- **File**: `backend/services/authService.js`
- **Flow**:
  1. User submits email/password
  2. Backend hashes password with bcrypt
  3. Stores in database
  4. On login, compares provided password with hash
  5. Returns user object on success

### 2. One Vote Per User Per Poll
- **Database**: Unique constraint on (user_id, poll_id)
- **File**: `backend/services/voteService.js`
- **Flow**:
  1. Before storing vote, check if exists
  2. If exists, return error
  3. If not, insert vote record
  4. Frontend disables vote button after voting

### 3. Real-time Results
- **No WebSockets/Socket.IO**
- **Method**: Refresh results via API on voting
- **File**: `frontend/src/pages/VotePage.js`
- **Flow**:
  1. User votes
  2. API call submits vote
  3. On success, fetch results again
  4. Display updated counts and percentages

### 4. Role-Based Access
- **Admin Role**: Can create/edit/delete polls
- **User Role**: Can only vote
- **Implementation**: Checked in frontend routing and backend controllers

---

## Database Relationships

```
┌─────────────────────────────────────┐
│ users (id, email, password, role)   │
└──────────────┬──────────────────────┘
               │ created_by
               ↓
┌──────────────────────────────────────┐
│ polls (id, question, is_active)      │
└──────────┬──────────────────────────┘
           │ poll_id
           ↓
┌────────────────────────────────────┐
│ poll_options (id, option_text)     │
└─────────────────────────────────────┘
      ↑              ↑
      │ option_id    │
      │              │
      │         ┌────┴─────────────────┐
      └─────────┤ votes               │
                │ (user_id, poll_id)  │
                │ (unique constraint) │
                └─────────────────────┘
```

---

## API Response Examples

### Successful Poll Creation
```json
{
  "success": true,
  "message": "Poll created successfully",
  "pollId": 5
}
```

### Error: Duplicate Vote
```json
{
  "success": false,
  "error": "You have already voted on this poll"
}
```

### Poll Results
```json
{
  "success": true,
  "data": {
    "poll": {
      "id": 1,
      "question": "Best Framework?"
    },
    "totalVotes": 15,
    "results": [
      {
        "id": 1,
        "text": "React",
        "votes": 9,
        "percentage": "60.00"
      },
      {
        "id": 2,
        "text": "Vue",
        "votes": 6,
        "percentage": "40.00"
      }
    ]
  }
}
```

---

## File Descriptions

### Backend

#### `server.js`
- Main Express server
- CORS setup
- Route registration
- Error handling

#### `db/connection.js`
- MySQL pool creation
- Connection management
- Error logging

#### `models/index.js`
- User, Poll, PollOption, Vote classes
- Database query methods
- Returns raw data from DB

#### `services/*.js`
- Business logic
- Input validation
- Error handling
- Data transformation

#### `controllers/*.js`
- HTTP request/response handling
- Calls services
- Returns JSON

#### `routes/*.js`
- Express Router setup
- Maps URLs to controllers
- HTTP method definitions

### Frontend

#### `App.js`
- Route definitions
- Main app component

#### `pages/*.js`
- Full page components
- State management with hooks
- Form handling

#### `services/api.js`
- API client functions
- Axios wrapper methods
- Centralized API calls

#### `styles/*.css`
- Page-specific styles
- Responsive design
- Color scheme

---

## Common Issues & Solutions

### Issue: "Cannot GET /api/polls"
**Solution**: Backend not running
```bash
cd backend
npm start
```

### Issue: "ECONNREFUSED" error
**Solution**: Database not running
```bash
# Start MySQL server (Windows)
net start MySQL80

# Or check MySQL is installed
mysql --version
```

### Issue: "Port already in use"
**Solution**: Kill existing process
```bash
# Find and kill process on port 5000
lsof -i :5000
kill -9 <PID>
```

### Issue: Can't login
**Solution**: Check credentials
1. Verify email exists in database
2. Ensure password is correct
3. Check database connection in `.env`

---

## Performance Optimizations

### Implemented
- ✓ Database indexes on foreign keys
- ✓ Efficient SQL queries with proper joins
- ✓ Response caching with localStorage
- ✓ Lazy component loading

### Future Improvements
- Add pagination for large poll lists
- Implement query result caching
- Add admin search/filter
- Optimize database queries
- Implement CDN for static files
- Add database connection pooling

---

## Security Features

### Implemented
- ✓ Password hashing (bcrypt)
- ✓ SQL injection prevention (prepared statements)
- ✓ XSS prevention (React escaping)
- ✓ CORS protection
- ✓ Database constraints for data integrity
- ✓ Input validation

### Best Practices
- Never log passwords
- Validate all inputs server-side
- Use HTTPS in production
- Implement rate limiting
- Add authentication tokens
- Sanitize database outputs

---

## Deployment Checklist

### Backend
- [ ] Set NODE_ENV=production
- [ ] Use strong database password
- [ ] Enable HTTPS
- [ ] Set up proper CORS
- [ ] Add rate limiting
- [ ] Set up monitoring
- [ ] Enable logging
- [ ] Configure backups

### Frontend
- [ ] Build for production: `npm run build`
- [ ] Use CDN for assets
- [ ] Enable caching headers
- [ ] Minify CSS/JS
- [ ] Optimize images
- [ ] Set up error tracking

---

## Testing Scenarios

### Scenario 1: New User Registration
```
Expected: User created in database
Test: Try logging in immediately after
```

### Scenario 2: Poll Creation
```
Expected: Poll visible to all users
Test: Login as different user, see poll
```

### Scenario 3: Vote Restrictions
```
Expected: Cannot vote twice on same poll
Test: Try voting again on same poll
```

### Scenario 4: Admin Dashboard
```
Expected: Only admin sees dashboard
Test: Login as regular user, try accessing /admin-dashboard
```

### Scenario 5: Results Update
```
Expected: Results update immediately after vote
Test: Vote and check results change
```

---

## Development Tips

### Enable Console Logging
Edit `backend/server.js`:
```javascript
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});
```

### Test API Directly
Use Postman or curl:
```bash
curl -X GET http://localhost:5000/api/health
```

### Debug Database Queries
In `models/index.js`, log queries:
```javascript
console.log('SQL:', query, params);
```

### Check React State
Use React DevTools browser extension

---

## Additional Resources

- [Express Documentation](https://expressjs.com/)
- [React Hooks Documentation](https://reactjs.org/docs/hooks-intro.html)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Axios Documentation](https://axios-http.com/)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)

---

## Support & Troubleshooting

### Check Logs
```bash
# Backend logs (console output)
npm start

# Frontend logs (browser console)
F12 → Console tab
```

### Verify Database
```bash
mysql -u root -p
USE polling_app;
SELECT * FROM users;
```

### API Health Check
```bash
curl http://localhost:5000/api/health
```

---

**Ready to use! Happy polling! 🎉**

