# API Request Examples

## Authentication

### 1. Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "secure123"
  }'
```

### 2. Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "secure123"
  }'
```

### 3. Get User Profile
```bash
curl -X POST http://localhost:5000/api/auth/profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1
  }'
```

---

## Polls Management

### 4. Get All Active Polls
```bash
curl -X GET "http://localhost:5000/api/polls?isActive=true"
```

### 5. Get Specific Poll with Options
```bash
curl -X GET http://localhost:5000/api/polls/1
```

### 6. Get Poll Results
```bash
curl -X GET http://localhost:5000/api/polls/1/results
```

### 7. Create New Poll (Admin Only)
```bash
curl -X POST http://localhost:5000/api/polls \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is your favorite backend framework?",
    "options": ["Express", "Django", "Spring", "ASP.NET"],
    "createdBy": 1
  }'
```

### 8. Update Poll (Admin Only)
```bash
curl -X PUT http://localhost:5000/api/polls/1 \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Updated: What is your favorite backend framework?",
    "isActive": true
  }'
```

### 9. Deactivate Poll (Admin Only)
```bash
curl -X PUT http://localhost:5000/api/polls/1 \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is your favorite backend framework?",
    "isActive": false
  }'
```

### 10. Delete Poll (Admin Only)
```bash
curl -X DELETE http://localhost:5000/api/polls/1
```

### 11. Reset Votes (Admin Only)
```bash
curl -X POST http://localhost:5000/api/polls/1/reset-votes
```

---

## Poll Options Management

### 12. Add Option to Poll (Admin Only)
```bash
curl -X POST http://localhost:5000/api/polls/1/options \
  -H "Content-Type: application/json" \
  -d '{
    "optionText": "Fastify"
  }'
```

### 13. Update Option (Admin Only)
```bash
curl -X PUT http://localhost:5000/api/polls/options/1 \
  -H "Content-Type: application/json" \
  -d '{
    "optionText": "Express.js"
  }'
```

### 14. Delete Option (Admin Only)
```bash
curl -X DELETE http://localhost:5000/api/polls/options/1
```

---

## Voting

### 15. Submit a Vote
```bash
curl -X POST http://localhost:5000/api/votes \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "pollId": 1,
    "optionId": 3
  }'
```

### 16. Check if User Already Voted
```bash
curl -X GET "http://localhost:5000/api/votes/check?userId=2&pollId=1"
```

---

## Example Workflow

### Flow 1: Admin Creates Poll
```bash
# 1. Admin logs in
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@polling.com", "password": "admin123"}'

# Response includes userId: 1

# 2. Admin creates poll
curl -X POST http://localhost:5000/api/polls \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Best Programming Language?",
    "options": ["Python", "JavaScript", "Java", "Go"],
    "createdBy": 1
  }'

# Response includes pollId: 5
```

### Flow 2: User Votes on Poll
```bash
# 1. User registers
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "password": "alice123"}'

# Response includes userId: 2

# 2. User logs in
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "password": "alice123"}'

# 3. User views polls
curl -X GET "http://localhost:5000/api/polls?isActive=true"

# 4. User views poll details
curl -X GET http://localhost:5000/api/polls/5

# 5. User submits vote
curl -X POST http://localhost:5000/api/votes \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "pollId": 5,
    "optionId": 1
  }'

# 6. User views results
curl -X GET http://localhost:5000/api/polls/5/results
```

### Flow 3: Duplicate Vote Prevention
```bash
# 1. User tries to vote again on same poll
curl -X POST http://localhost:5000/api/votes \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "pollId": 5,
    "optionId": 2
  }'

# Response: Error - "You have already voted on this poll"
```

---

## Using Axios in Frontend

```javascript
import { authService, pollService, voteService } from './services/api';

// Register
const response = await authService.register('user@example.com', 'password123');
console.log(response.data.userId);

// Login
const response = await authService.login('user@example.com', 'password123');
const user = response.data.user; // { id, email, role }

// Get polls
const response = await pollService.getAllPolls(true);
const polls = response.data.polls;

// Submit vote
const response = await voteService.submitVote(userId, pollId, optionId);
console.log('Vote submitted:', response.data.voteId);

// Check vote status
const response = await voteService.checkUserVote(userId, pollId);
console.log('Has voted:', response.data.hasVoted);
```

