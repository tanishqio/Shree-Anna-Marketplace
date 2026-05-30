# Running Shree Anna Locally

This guide will help you set up and run the Shree Anna platform on your local machine.

## Prerequisites

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| Node.js | 18.x or higher | [nodejs.org](https://nodejs.org/) |
| Python | 3.11+ | [python.org](https://python.org/) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

### Optional (for full features)
- PostgreSQL 14+ (SQLite works for development)
- Redis (for caching)

## Step 1: Clone the Repository

\`\`\`bash
git clone https://github.com/your-org/shree-anna.git
cd shree-anna
\`\`\`

## Step 2: Frontend Setup

### Install Dependencies

\`\`\`bash
npm install
\`\`\`

### Configure Environment

Create a \`.env.local\` file:

\`\`\`env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8005/api/v1

# Optional: Analytics
NEXT_PUBLIC_GA_ID=

# Optional: Push Notifications VAPID Key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
\`\`\`

### Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Frontend will be available at: **http://localhost:3000**

## Step 3: Backend Setup

### Navigate to Backend

\`\`\`bash
cd backend
\`\`\`

### Create Virtual Environment

**Windows (PowerShell):**
\`\`\`powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
\`\`\`

**macOS/Linux:**
\`\`\`bash
python -m venv venv
source venv/bin/activate
\`\`\`

### Install Dependencies

\`\`\`bash
pip install -r requirements.txt
\`\`\`

### Configure Environment

Create a \`.env\` file in the backend folder:

\`\`\`env
# Database
DATABASE_URL=sqlite:///./shree_anna.db
# For PostgreSQL: DATABASE_URL=postgresql://user:password@localhost/shree_anna

# Security
SECRET_KEY=your-secret-key-here-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Optional: SMS Gateway (for OTP)
SMS_API_KEY=
SMS_SENDER_ID=SHRANN

# Optional: Weather API
WEATHER_API_KEY=
\`\`\`

### Initialize Database

\`\`\`bash
# Run migrations
alembic upgrade head

# Seed demo data (optional)
python -m app.scripts.seed_data
\`\`\`

### Start Backend Server

\`\`\`bash
uvicorn app.main:app --reload --port 8005
\`\`\`

Backend API will be available at: **http://localhost:8005**

API Documentation: **http://localhost:8005/docs**

## Step 4: Verify Installation

### Check Frontend
1. Open http://localhost:3000 in your browser
2. You should see the Shree Anna homepage
3. Navigate to /marketplace to see listings

### Check Backend
1. Open http://localhost:8005/docs
2. You should see the Swagger API documentation
3. Try the GET /api/v1/health endpoint

### Run Tests

**Frontend Tests:**
\`\`\`bash
npm test
\`\`\`

**Backend Tests:**
\`\`\`bash
cd backend
pytest -v
\`\`\`

Expected: 105/105 tests passing

## Development Tips

### Hot Reload
Both frontend (Next.js) and backend (uvicorn with --reload) support hot reloading. Changes to code will automatically refresh.

### PWA Development
The service worker is registered in production mode only. To test PWA features:
\`\`\`bash
npm run build
npm start
\`\`\`

### Offline Testing
1. Open DevTools > Network tab
2. Set to "Offline"
3. Create listings - they queue locally
4. Go back online - observe automatic sync

### Multi-language Testing
Change language by adding \`?lang=hi\` to any URL, or use the language selector in the UI.

## Troubleshooting

### Port Already in Use

**Frontend (3000):**
\`\`\`bash
npx kill-port 3000
npm run dev
\`\`\`

**Backend (8005):**
\`\`\`bash
# Windows
netstat -ano | findstr :8005
taskkill /PID <pid> /F

# macOS/Linux
lsof -i :8005
kill -9 <pid>
\`\`\`

### Database Issues

Reset the database:
\`\`\`bash
cd backend
rm shree_anna.db
alembic upgrade head
python -m app.scripts.seed_data
\`\`\`

### Module Not Found

Clear caches and reinstall:
\`\`\`bash
# Frontend
rm -rf node_modules .next
npm install

# Backend
rm -rf venv __pycache__
python -m venv venv
pip install -r requirements.txt
\`\`\`

## Quick Reference

| Component | URL | Description |
|-----------|-----|-------------|
| Frontend | http://localhost:3000 | Next.js web app |
| Backend API | http://localhost:8005 | FastAPI server |
| API Docs | http://localhost:8005/docs | Swagger UI |
| ReDoc | http://localhost:8005/redoc | Alternative API docs |

## Demo Accounts

After seeding data, use these accounts:

| Role | Phone | OTP |
|------|-------|-----|
| Farmer | +919876543210 | 123456 |
| Buyer | +919876543211 | 123456 |
| FPO | +919876543212 | 123456 |
| Admin | +919876543200 | 123456 |

---

Need help? Check the [main README](../README.md) or open an issue.
