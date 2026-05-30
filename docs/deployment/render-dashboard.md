# Deploy to Render via Dashboard (Blueprint Method)

## Overview
Since the Render CLI is not available via npm (`@render/cli` package doesn't exist), you can deploy your application using the **Render Dashboard** with the `render.yaml` Blueprint file that's already configured in this repository.

## Prerequisites
- GitHub account
- Render account (sign up at https://render.com)
- Code pushed to GitHub repository

## Step 1: Push Code to GitHub

Make sure all your recent changes are committed and pushed:

```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

## Step 2: Connect GitHub to Render

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click **"New+"** in the top navigation
3. Select **"Blueprint"**
4. Click **"Connect GitHub"** (if not already connected)
5. Authorize Render to access your GitHub repositories

## Step 3: Deploy Using Blueprint

1. After connecting GitHub, select your repository: **`shree-anna-marketplace-design`**
2. Render will automatically detect the `render.yaml` file
3. Click **"Apply"**
4. Render will create two services:
   - `shree-anna-backend` (Python/FastAPI)
   - `shree-anna-frontend` (Next.js)

## Step 4: Configure Environment Variables

### For Backend Service (`shree-anna-backend`):

Go to the backend service → **Environment** tab and add:

```bash
ENV=production
DEBUG=false
HOST=0.0.0.0
# PORT is auto-set by Render

# Database (CRITICAL: Replace 1234 with actual password from Supabase dashboard)
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Security (Generate new values for production)
JWT_SECRET_KEY=GENERATE_A_SECURE_32_CHAR_SECRET_HERE
PAYLOAD_SALT=GENERATE_A_SECURE_SALT_HERE
SERVER_SIGNING_KEY=GENERATE_A_SECURE_32_CHAR_KEY_HERE

# CORS (Update after frontend deploys)
CORS_ORIGINS=*

# Platform indicators
PYTHON_VERSION=3.11.0
RENDER=true
```

> **⚠️ IMPORTANT**: After the frontend deploys, update `CORS_ORIGINS` from `*` to your frontend URL (e.g., `https://shree-anna-frontend.onrender.com`)

### For Frontend Service (`shree-anna-frontend`):

Go to the frontend service → **Environment** tab and add:

```bash
NODE_VERSION=20

# API URL (Update with your deployed backend URL)
NEXT_PUBLIC_API_URL=https://shree-anna-backend.onrender.com
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_DEV_MODE=false
```

> **⚠️ IMPORTANT**: Replace `https://shree-anna-backend.onrender.com` with the actual URL of your deployed backend service.

## Step 5: Wait for Deployment

1. Render will start building both services
2. Backend build time: ~5-10 minutes
3. Frontend build time: ~3-5 minutes
4. Free tier services will spin down after inactivity (may take 30s to restart)

## Step 6: Get URLs

Once deployed, you'll get URLs like:
- Backend: `https://shree-anna-backend.onrender.com`
- Frontend: `https://shree-anna-frontend.onrender.com`

## Step 7: Update Cross-References

1. Update `NEXT_PUBLIC_API_URL` in frontend service with actual backend URL
2. Update `CORS_ORIGINS` in backend service with actual frontend URL
3. Both services will auto-redeploy when you save environment variable changes

## Troubleshooting

### Build Fails

**Backend:**
- Check that `requirements.txt` has all dependencies
- Verify Python version is 3.11.x in `runtime.txt`
- Check build logs for missing packages

**Frontend:**
- Check `package.json` for any script errors
- Verify Node version is set to 20
- Look for missing dependencies in build logs

### Database Connection Fails

- Verify `DATABASE_URL` password is correct (not `1234`)
- Check Supabase dashboard for correct connection string
- Ensure database allows connections from Render IPs

### CORS Errors

- Update `CORS_ORIGINS` on backend with actual frontend URL
- Wait for backend to redeploy after changing the variable
- Check browser console for exact CORS error

## Free Tier Limitations

- Services spin down after 15 minutes of inactivity
- 750 hours/month of runtime per service
- First request after spin-down takes ~30 seconds
- Limited to 512 MB RAM

## Updating Your Application

Simply push to GitHub:

```bash
git add .
git commit -m "Update application"
git push origin main
```

Render will automatically detect changes and redeploy both services.

---

**Alternative:** If you need CLI deployment, you can download the Render CLI binary directly from:
https://github.com/render-oss/cli/releases

But for most use cases, the Dashboard method above is simpler and more reliable.
