# Quick Guide: Deploy Frontend to Render

Since the Blueprint only deployed the backend, you need to manually create the frontend service.

## Option 1: Via Dashboard (Recommended - I've opened this for you)

I've opened the Render "New Web Service" page. Follow these steps:

### 1. Connect Repository
- Click **"Connect a repository"**
- Select: **`areycruzer/shree-anna-marketplace-design`**
- Click **"Connect"**

### 2. Configure Service
Fill in these details:

**Basic Info:**
- Name: `shree-anna-frontend`
- Region: `Oregon` (or same as backend)
- Branch: `main`
- Root Directory: *(leave blank - the project root)*

**Build & Deploy:**
- Runtime: `Node`
- Build Command: `npm install && npm run build`
- Start Command: `npm run start`

**Instance Type:**
- Plan: `Free`

### 3. Environment Variables
Add these in the "Environment" section:

```
NODE_VERSION=20
NEXT_PUBLIC_API_URL=https://shree-anna-backend-x3g7.onrender.com
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_DEV_MODE=false
```

### 4. Create Service
- Click **"Create Web Service"**
- Wait ~5-10 minutes for build

---

## Option 2: Via CLI (If Dashboard doesn't work)

Unfortunately, Render CLI doesn't support creating services - only managing existing ones. You must use the Dashboard.

---

## After Frontend Deploys

1. **Update Backend CORS**: 
   - Go to backend service → Environment
   - Change `CORS_ORIGINS` from `*` to your frontend URL (e.g., `https://shree-anna-frontend.onrender.com`)

2. **Test the App**:
   - Visit your frontend URL
   - Try logging in and navigating

---

**Current Status:**
- ✅ Backend: https://shree-anna-backend-x3g7.onrender.com
- ⏳ Frontend: Creating now...
