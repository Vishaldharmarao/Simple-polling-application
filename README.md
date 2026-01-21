# Polling Application - Complete Setup Guide

## Project Structure

```
├── backend/
│   ├── db/
│   │   ├── connection.js          # Database connection setup
│   │   └── schema.sql             # SQL schema
│   ├── controllers/
│   │   ├── authController.js      # Authentication logic
│   │   ├── pollController.js      # Poll management
│   │   └── voteController.js      # Vote management
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── pollRoutes.js
│   │   └── voteRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── pollService.js
│   │   └── voteService.js
│   ├── models/
│   │   └── index.js               # Database models
│   ├── package.json
│   ├── .env
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── PollList.js
    │   │   ├── VotePage.js
    │   │   └── AdminDashboard.js
    │   ├── services/
    │   │   ├── apiClient.js
    │   │   └── api.js
    │   ├── styles/
    │   │   ├── global.css
    │   │   ├── auth.css
    │   │   ├── polls.css
    │   │   ├── vote.css
    │   │   └── admin.css
    │   ├── App.js
    │   └── index.js
    ├── public/
    │   └── index.html
    └── package.json
```

## Backend Setup

### 1. Database Setup

```bash
# Install MySQL server (Windows)
# Download from: https://dev.mysql.com/downloads/mysql/

# Create database
mysql -u root -p < backend/db/schema.sql
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment

Create `.env` file in backend folder:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=vishal
DB_NAME=polling_app
PORT=5000
NODE_ENV=development
```

### 4. Start Backend Server

```bash
npm start
# OR for development with auto-reload
npm run dev
```

Server will run at `http://localhost:5000`

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Frontend

```bash
npm start
```

Frontend will open at `http://localhost:3000`

---

## API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123"
}

Response 201:
{
    "success": true,
    "message": "User registered successfully",
    "userId": 1
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123"
}

Response 200:
{
    "success": true,
    "message": "Login successful",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "role": "user"
    }
}
```

#### Get Profile
```http
POST /api/auth/profile
Content-Type: application/json

{
    "userId": 1
}

Response 200:
{
    "success": true,
    "user": {
        "id": 1,
        "email": "user@example.com",
        "role": "user",
        "created_at": "2024-01-20T10:30:00Z"
    }
}
```

---

### Polls

#### Get All Polls
```http
GET /api/polls
Query Parameters:
- isActive=true (optional)

Response 200:
{
    "success": true,
    "polls": [
        {
            "id": 1,
            "question": "What is your favorite language?",
            "is_active": true,
            "created_by": 1,
            "created_at": "2024-01-20T10:00:00Z"
        }
    ]
}
```

#### Get Poll with Options
```http
GET /api/polls/1

Response 200:
{
    "success": true,
    "poll": {
        "id": 1,
        "question": "What is your favorite language?",
        "is_active": true,
        "created_by": 1,
        "created_at": "2024-01-20T10:00:00Z",
        "options": [
            {
                "id": 1,
                "poll_id": 1,
                "option_text": "JavaScript"
            },
            {
                "id": 2,
                "poll_id": 1,
                "option_text": "Python"
            }
        ]
    }
}
```

#### Get Poll Results
```http
GET /api/polls/1/results

Response 200:
{
    "success": true,
    "data": {
        "poll": {
            "id": 1,
            "question": "What is your favorite language?"
        },
        "totalVotes": 10,
        "results": [
            {
                "id": 1,
                "text": "JavaScript",
                "votes": 6,
                "percentage": "60.00"
            },
            {
                "id": 2,
                "text": "Python",
                "votes": 4,
                "percentage": "40.00"
            }
        ]
    }
}
```

#### Create Poll (Admin)
```http
POST /api/polls
Content-Type: application/json

{
    "question": "What is your favorite framework?",
    "options": ["React", "Vue", "Angular"],
    "createdBy": 1
}

Response 201:
{
    "success": true,
    "message": "Poll created successfully",
    "pollId": 2
}
```

#### Update Poll (Admin)
```http
PUT /api/polls/1
Content-Type: application/json

{
    "question": "Updated question?",
    "isActive": false
}

Response 200:
{
    "success": true,
    "message": "Poll updated successfully"
}
```

#### Delete Poll (Admin)
```http
DELETE /api/polls/1

Response 200:
{
    "success": true,
    "message": "Poll deleted successfully"
}
```

#### Add Option to Poll (Admin)
```http
POST /api/polls/1/options
Content-Type: application/json

{
    "optionText": "Go"
}

Response 201:
{
    "success": true,
    "message": "Option added successfully",
    "optionId": 5
}
```

#### Update Option (Admin)
```http
PUT /api/polls/options/1
Content-Type: application/json

{
    "optionText": "Updated Option Text"
}

Response 200:
{
    "success": true,
    "message": "Option updated successfully"
}
```

#### Delete Option (Admin)
```http
DELETE /api/polls/options/1

Response 200:
{
    "success": true,
    "message": "Option deleted successfully"
}
```

#### Reset Votes (Admin)
```http
POST /api/polls/1/reset-votes

Response 200:
{
    "success": true,
    "message": "Poll votes have been reset"
}
```

---

### Votes

#### Submit Vote
```http
POST /api/votes
Content-Type: application/json

{
    "userId": 1,
    "pollId": 1,
    "optionId": 2
}

Response 201:
{
    "success": true,
    "message": "Vote submitted successfully",
    "voteId": 5
}
```

#### Check User Vote
```http
GET /api/votes/check?userId=1&pollId=1

Response 200:
{
    "success": true,
    "hasVoted": true
}
```

---

## Features

### User Features
- ✓ Register with email and password
- ✓ Login/Logout
- ✓ View active polls
- ✓ Vote on polls (one vote per user per poll)
- ✓ View real-time poll results
- ✓ Responsive mobile UI

### Admin Features
- ✓ Admin login/logout
- ✓ Dashboard overview of all polls
- ✓ Create new polls with multiple options
- ✓ Edit poll questions
- ✓ Add/edit/delete poll options
- ✓ Activate/deactivate polls
- ✓ View poll results with vote counts and percentages
- ✓ Reset votes for a poll
- ✓ Delete polls
- ✓ Monitor voting activity

### Security Features
- ✓ Password hashing with bcrypt
- ✓ One vote per user per poll (database constraint)
- ✓ Server-side validation for all inputs
- ✓ Role-based access control
- ✓ SQL injection prevention via prepared statements

### UI/UX Features
- ✓ Clean, minimal design
- ✓ Mobile-responsive layout
- ✓ Real-time poll results display
- ✓ Progress bars for vote visualization
- ✓ Error messages and success notifications
- ✓ Loading indicators
- ✓ Intuitive navigation

---

## Database Schema

### Users Table
- `id`: Primary key
- `email`: Unique email address
- `password`: Hashed password
- `role`: 'user' or 'admin'
- `created_at`: Timestamp

### Polls Table
- `id`: Primary key
- `question`: Poll question
- `is_active`: Boolean (default true)
- `created_by`: Foreign key to users
- `created_at`: Timestamp

### Poll Options Table
- `id`: Primary key
- `poll_id`: Foreign key to polls
- `option_text`: Option text

### Votes Table
- `id`: Primary key
- `user_id`: Foreign key to users
- `poll_id`: Foreign key to polls
- `option_id`: Foreign key to poll_options
- `created_at`: Timestamp
- **Unique Constraint**: (user_id, poll_id) - ensures one vote per user per poll

---

## Testing the Application

### 1. Create Admin Account
```
Email: admin@polling.com
Password: admin123
```

### 2. Create User Account
```
Email: user@polling.com
Password: user123
```

### 3. Create a Poll (As Admin)
1. Go to Admin Dashboard
2. Navigate to "Create Poll"
3. Add question and options
4. Click "Create Poll"

### 4. Vote on Poll (As User)
1. Login as user
2. Click on a poll
3. Select an option
4. Click "Submit Vote"
5. View results

### 5. Test Duplicate Vote Prevention
- Try voting again on the same poll
- Should see error: "You have already voted on this poll"

---

## Error Handling

All API responses follow a consistent format:

**Success Response:**
```json
{
    "success": true,
    "message": "Operation successful",
    "data": {}
}
```

**Error Response:**
```json
{
    "success": false,
    "error": "Error message describing what went wrong"
}
```

---

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS
- [ ] Set up CORS properly
- [ ] Add rate limiting
- [ ] Add input validation and sanitization
- [ ] Set up error logging
- [ ] Set up database backups
- [ ] Use strong password hashing
- [ ] Add session timeout

---

## Troubleshooting

### Database Connection Error
- Ensure MySQL is running
- Check database credentials in `.env`
- Verify database exists: `mysql -u root -p < backend/db/schema.sql`

### Port Already in Use
- Backend: Kill the process using port 5000
- Frontend: Kill the process using port 3000

### CORS Errors
- Ensure backend is running
- Check CORS configuration in `server.js`
- Clear browser cache

---

## Support

For issues or questions, check the error messages and logs in:
- Backend console output
- Browser developer console (F12)
- Network tab in browser DevTools
#   S i m p l e - P o l l i n g - A p p l i c a t i o n  
 