# PASTEBIN LITE - BACKEND README

**Express.js + MongoDB + Vercel**

## OVERVIEW

Pastebin Lite Backend is a RESTful API built with Express.js that handles:
- Creating text pastes with expiry time and view limits
- Retrieving paste data in JSON format
- Rendering pastes as HTML pages
- MongoDB database integration
- CORS handling for frontend communication


## 🛠️ TECH STACK

**Core Framework:**
- Express.js (Node.js)
- JavaScript (ES6+ Modules)

**Database:**
- MongoDB (Atlas)
- Mongoose (ODM)
- Schema validation

**Additional:**
- CORS middleware
- UUID for IDs
- HTTP server wrapper

**Deployment:**
- Vercel (serverless)
- Node.js 18+

---

## 📁 PROJECT STRUCTURE

```
pastebin-backend/
├── server.js                    # Main server file
├── package.json
├── config/
│   └── index.js                 # Configuration file
├── database/
│   └── connection.js            # MongoDB connection
├── models/
│   └── paste.model.js           # Paste schema
├── routes/
│   └── paste.routes.js          # API routes
├── controllers/
│   └── paste.controller.js      # Business logic
├── utils/
│   ├── helpers.js               # Helper functions
├── local.env                    # Local dev variables
├── stage.env                    # Staging variables
├── production.env               # Production variables
├── .gitignore
└── README.md
```

---

## SETUP & INSTALLATION

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account
- Git

### Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd pastebin-backend

# 2. Install dependencies
npm install

# 3. Create local.env file
touch local.env

# 4. Add environment variables
# See Environment Variables section

# 5. Run locally
npm run start:local

# 6. Verify server is running
# Visit: http://localhost:8000/api/healthz
```

---

## 🔑 ENVIRONMENT VARIABLES

### Local Development (local.env)

```env
PORT=8000
MONGO_URL=mongodb://localhost:27017/pastebin
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Staging (stage.env)

```env
PORT=8000
MONGO_URL=mongodb+srv://vishh08:Vishali028@cluster0.bzwolk0.mongodb.net/pastebin_staging
FRONTEND_URL=https://pastebin-frontend-staging.vercel.app
NODE_ENV=staging
```

### Production (Vercel Dashboard)

Set these environment variables in Vercel:

```env
PORT=8000
MONGO_URL=mongodb+srv://vishh08:Vishali028@cluster0.bzwolk0.mongodb.net/pastebin
FRONTEND_URL=https://pastebin-frontend-mauve.vercel.app
NODE_ENV=production
```

### Environment Variable Explanation

| Variable | Purpose | Example |
|----------|---------|---------|
| PORT | Server port | 8000 |
| MONGO_URL | MongoDB connection string | mongodb+srv://... |
| FRONTEND_URL | Allowed frontend URL (CORS) | http://localhost:3000 |
| NODE_ENV | Environment type | development, staging, production |

---

## 🏃 RUNNING LOCALLY

### Development Mode

```bash
npm run start:local
```

- Uses `local.env` file
- Watches file changes (--watch flag)
- Full debug output
- Hot reload enabled

### Production Mode

```bash
npm run build
npm start
```

- Uses system environment variables
- Optimized for production
- No file watching

### Verify Server

```bash
# Test health check
curl http://localhost:8000/api/healthz

# Expected response
{"ok":true}
```

---



### Connection Test

```bash
# Test MongoDB connection
curl http://localhost:8000/api/healthz

# Should return
{"ok":true}
```

---

## 📡 API ENDPOINTS

### 1. Create Paste

```
POST /api/create-paste

Headers:
  Content-Type: application/json

Body:
{
  "content": "paste content here",
  "ttl_seconds": 3600,          // optional, seconds
  "max_views": 5                 // optional, number
}

Response (201):
{
  "status": "success",
  "message": "Paste Created Successfully",
  "data": {
    "id": "abc123xyz",
    "url": "https://frontend.url/p/abc123xyz"
  }
}

Error (400):
{
  "status": "failure",
  "message": "content is required and must be a non-empty string"
}
```

### 2. Get Paste

```
GET /api/get-paste/:id

Response (200):
{
  "status": "success",
  "message": "Paste Retrieved Successfully",
  "data": {
    "content": "paste content",
    "remaining_views": 3,
    "expires_at": "2024-12-31T10:00:00Z"
  }
}

Error (404):
{
  "status": "failure",
  "message": "Paste not found or has expired"
}
```

### 3. View Paste HTML

```
GET /p/:id

Response (200): HTML page with styled paste content
Error (404): HTML error page
```

### 4. Health Check

```
GET /api/healthz

Response (200):
{
  "status": "success",
  "ok": true
}
```

### 5. Get All Pastes (Admin)

```
GET /api/pastes

Response (200):
{
  "status": "success",
  "message": "All Pastes Retrieved Successfully",
  "data": [...]
}
```

### 6. Delete Paste (Admin)

```
DELETE /api/paste/:id

Response (200):
{
  "status": "success",
  "message": "Paste Deleted Successfully"
}
```

---
