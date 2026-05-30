# 🚀 Deploying Shree Anna to Render

This guide will walk you through deploying the Shree Anna Marketplace to [Render](https://render.com).

## 📋 Prerequisites

1. **GitHub Account** - Your code should be pushed to GitHub
2. **Render Account** - Sign up at [render.com](https://render.com) (free tier available)
3. **Supabase Account** - For PostgreSQL database (you already have this configured)

---

## 🏗️ Architecture Overview

Your application consists of **two services**:

| Service | Type | Port | Runtime |
|---------|------|------|---------|
| **Frontend** | Next.js Web App | 3000 | Node.js 20 |
| **Backend** | FastAPI REST API | 10000 | Python 3.11 |

---

## 📦 Step 1: Push Your Code to GitHub

Make sure your latest code is committed and pushed:

```bash
# Navigate to project root
cd d:\Milletsih\main\shree-anna-marketplace-design

# Add all files
git add .

# Commit changes
git commit -m "Add Render deployment configuration"

# Push to GitHub
git push origin main
```

---

## 🐍 Step 2: Deploy the Python Backend

### 2.1 Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository: `shree-anna-marketplace-design`

### 2.2 Configure Backend Service

| Setting | Value |
|---------|-------|
| **Name** | `shree-anna-backend` |
| **Region** | Oregon (or closest to your users) |
| **Branch** | `main` |
| **Root Directory** | `backend-python` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | Free (or higher for production) |

### 2.3 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**:

| Key | Value |
|-----|-------|
| `ENV` | `production` |
| `DEBUG` | `false` |
| `DATABASE_URL` | `postgresql://postgres:[YOUR-PASSWORD]@db.YOUR_PROJECT_REF.supabase.co:5432/postgres` |
| `SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` |
| `SUPABASE_ANON_KEY` | `YOUR_SUPABASE_ANON_KEY` (from Supabase Dashboard → Settings → API) |
| `JWT_SECRET_KEY` | *Generate a secure 32+ character secret* |
| `PAYLOAD_SALT` | *Generate a secure salt* |
| `SERVER_SIGNING_KEY` | *Generate a secure 32+ character key* |
| `CORS_ORIGINS` | `*` (update after frontend deployment) |
| `PYTHON_VERSION` | `3.11.7` |
| `RENDER` | `true` |

> 💡 **Tip**: Get your Supabase database password from:  
> **Supabase Dashboard** → **Project Settings** → **Database** → **Connection String**

### 2.4 Deploy Backend

Click **"Create Web Service"**

Wait for the deployment to complete (5-10 minutes). Once done, you'll get a URL like:
```
https://shree-anna-backend.onrender.com
```

**Test it**: Visit `https://shree-anna-backend.onrender.com/health`

---

## ⚛️ Step 3: Deploy the Next.js Frontend

### 3.1 Create Another Web Service

1. Click **"New +"** → **"Web Service"**
2. Select the same GitHub repository
3. Select the repository: `shree-anna-marketplace-design`

### 3.2 Configure Frontend Service

| Setting | Value |
|---------|-------|
| **Name** | `shree-anna-frontend` |
| **Region** | Same as backend |
| **Branch** | `main` |
| **Root Directory** | *(leave empty - root of repo)* |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |
| **Instance Type** | Free |

### 3.3 Add Environment Variables

| Key | Value |
|-----|-------|
| `NODE_VERSION` | `20` |
| `NEXT_PUBLIC_API_URL` | `https://shree-anna-backend.onrender.com` *(your backend URL)* |
| `NEXT_PUBLIC_API_VERSION` | `v1` |
| `NEXT_PUBLIC_DEV_MODE` | `false` |

### 3.4 Deploy Frontend

Click **"Create Web Service"**

Wait for deployment (10-15 minutes for Next.js build). You'll get:
```
https://shree-anna-frontend.onrender.com
```

---

## 🔧 Step 4: Update CORS Settings

After both services are deployed, update the backend's CORS:

1. Go to **Backend Service** → **Environment**
2. Update `CORS_ORIGINS`:
   ```
   https://shree-anna-frontend.onrender.com
   ```
3. Click **"Save Changes"** - This will trigger a redeploy

---

## 🚀 Alternative: One-Click Blueprint Deployment

If you prefer automatic setup, use the `render.yaml` Blueprint:

1. Push your code to GitHub
2. Go to [Render Blueprint](https://dashboard.render.com/blueprints)
3. Click **"New Blueprint Instance"**
4. Connect your repository
5. Render will detect `render.yaml` and set up both services automatically
6. Fill in the environment variables when prompted
7. Click **"Apply"**

---

## ✅ Step 5: Verify Deployment

### Test Backend API
```bash
curl https://shree-anna-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  ...
}
```

### Test Frontend
Visit `https://shree-anna-frontend.onrender.com` in your browser

---

## 🐛 Troubleshooting

### Backend Issues

| Problem | Solution |
|---------|----------|
| **Database connection error** | Verify `DATABASE_URL` is correct. Check Supabase password. |
| **Import errors** | Check `requirements.txt` includes all dependencies |
| **Port binding error** | Ensure start command uses `$PORT` |

### Frontend Issues

| Problem | Solution |
|---------|----------|
| **Build fails** | Check Node version (20+). Run `npm run build` locally first. |
| **API calls fail** | Verify `NEXT_PUBLIC_API_URL` points to backend |
| **CORS errors** | Update backend `CORS_ORIGINS` with frontend URL |

### View Logs
1. Go to your service in Render dashboard
2. Click **"Logs"** tab
3. Check for errors during build or runtime

---

## 🔄 Continuous Deployment

Render automatically redeploys when you push to the `main` branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Both services will rebuild and redeploy automatically!

---

## 💰 Pricing Notes

**Free Tier Limitations:**
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month of free web service usage

**For Production:**
- Consider upgrading to **Starter** ($7/month) for always-on services
- Faster builds and no cold starts

---

## 📞 Support

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Project Issues**: Create an issue in your GitHub repository

---

## 🎉 Success!

Your Shree Anna Marketplace is now live on Render!

- **Frontend**: `https://shree-anna-frontend.onrender.com`
- **Backend API**: `https://shree-anna-backend.onrender.com`
- **API Docs**: `https://shree-anna-backend.onrender.com/docs`
