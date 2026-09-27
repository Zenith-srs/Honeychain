# 🚀 HoneyChain Deployment Guide

This guide will help you deploy HoneyChain with:
- **Backend**: Railway.app (Python FastAPI)
- **Frontend**: Vercel (React/Vite)
- **Database**: Railway PostgreSQL (free tier)

**Total Time**: ~15 minutes
**Cost**: Free (both platforms have generous free tiers)

---

## 📚 Deployment Resources

Choose the guide that fits your needs:

1. **📖 DEPLOY_SMOOTH.md** - Detailed step-by-step guide with explanations (this file)
2. **⚡ DEPLOY_QUICK_REFERENCE.md** - One-page cheat sheet for quick reference
3. **🔧 deploy.ps1** - Interactive PowerShell helper script
4. **✅ pre-deploy-check.ps1** - Pre-deployment validation script

**First time deploying?** → Follow this file (DEPLOYMENT.md)  
**Need a quick reminder?** → Use DEPLOY_QUICK_REFERENCE.md  
**Want automation help?** → Run `.\deploy.ps1` in PowerShell

---

## ⚡ Super Quick Start (TL;DR)

```powershell
# 1. Pre-flight check
.\pre-deploy-check.ps1

# 2. Push to GitHub
git push origin main

# 3. Railway: railway.app/new → Deploy from GitHub → Add PostgreSQL
#    Set env vars (use .\deploy.ps1 to generate JWT secret)

# 4. Vercel: vercel.com/new → Root: web → Add VITE_API_URL

# 5. Seed database
railway run python -m backend.seed

# Done! Test at your-vercel-url.vercel.app
```

**For detailed steps**, continue reading below.

---

## 📋 Pre-Deployment Checklist

**Run automated check**:
```powershell
.\pre-deploy-check.ps1
```

**Manual checklist**:

- [ ] Code pushed to GitHub
- [ ] Railway account created ([railway.app](https://railway.app))
- [ ] Vercel account created ([vercel.com](https://vercel.com))
- [ ] Gemini API key ready ([makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey))
- [ ] Strong passwords prepared for staff accounts

---

## Part 1: Deploy Backend to Railway 🚂

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"Login"** → **"Login with GitHub"**
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your **HoneyChain** repository
6. Railway will auto-detect Python and start building

### Step 2: Add PostgreSQL Database

1. In your Railway project dashboard
2. Click **"New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway automatically creates `DATABASE_URL` environment variable
4. Your backend will use this instead of SQLite

### Step 3: Configure Environment Variables

Click on your backend service → **"Variables"** tab → Click **"New Variable"**

Add these one by one:

```bash
HONEYCHAIN_JWT_SECRET=your-super-secret-random-32-char-string
GEMINI_API_KEY=AIzaSyBb8RN6Kor3eJ...your-key
OFFICER_PASSWORD=replace-with-unique-secret-for-officer
LAB_PASSWORD=replace-with-unique-secret-for-lab
ADMIN_PASSWORD=replace-with-unique-secret-for-admin
CORS_ORIGINS=https://honeychain.vercel.app,https://*.vercel.app
```

**💡 Generate JWT Secret**:
```powershell
# Option 1: Use helper script
.\deploy.ps1  # Choose option 1

# Option 2: Manual PowerShell command
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 40 | ForEach-Object {[char]$_})
```

**Important**: 
- Generate a random 32+ character string for `HONEYCHAIN_JWT_SECRET`
- Use strong, unique passwords for staff accounts (minimum 12 characters, mix of letters/numbers/symbols)
- NEVER commit production passwords to version control
- Staff passwords are only used during initial database seeding to create accounts
- You'll update `CORS_ORIGINS` later with your actual Vercel URL

### Step 4: Generate Public URL

1. Click **"Settings"** tab
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"**
4. Copy your Railway URL: `https://honeychain-production-abc123.up.railway.app`
5. **Save this URL** - you'll need it for Vercel

### Step 5: Wait for Deployment

1. Click **"Deployments"** tab
2. Wait for build to complete (~2-3 minutes)
3. Status should show **"Success"** with green checkmark
4. Click **"View Logs"** to verify no errors

### Step 6: Test Backend

Visit these URLs (replace with your Railway URL):

- **Health Check**: `https://your-url.up.railway.app/health`
  - Should return: `{"status": "ok"}`
  
- **API Docs**: `https://your-url.up.railway.app/docs`
  - Should show FastAPI interactive documentation

✅ **Backend deployed successfully!**

---

## Part 2: Deploy Frontend to Vercel 🔺

### Step 1: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Project"**
3. Select your **HoneyChain** GitHub repository
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 2: Add Environment Variable

**IMPORTANT**: The frontend makes direct cross-origin API calls to your backend.

Before deploying, add environment variable:

1. Expand **"Environment Variables"** section
2. Add variable:
   - **Name**: `VITE_API_URL`
   - **Value**: Your Railway backend URL (from Part 1, Step 4)
   - **Example**: `https://honeychain-production-abc123.up.railway.app`
   - **Format**: HTTPS origin only, NO trailing slash, NO `/api` suffix
3. Select **"Production"**, **"Preview"**, and **"Development"**

**Notes**:
- `VITE_API_URL` is a build-time variable embedded during the Vite build
- Changing it requires rebuilding/redeploying the frontend
- Do NOT include `/api` in the URL - the API client adds this automatically
- Do NOT add a trailing slash - it will be normalized automatically

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait for build (~1-2 minutes)
3. Vercel will show **"Your project is ready!"**
4. Copy your Vercel URL: `https://honeychain.vercel.app`

### Step 4: Test Frontend

Visit your Vercel URL:

- **Homepage**: `https://honeychain.vercel.app/`
  - Should load with proper styling
  
- **Staff Demo**: `https://honeychain.vercel.app/staff`
  - Should show three staff cards
  
- **API Connection**: Check browser console
  - Should not show CORS errors

✅ **Frontend deployed successfully!**

---

## Part 3: Connect Frontend & Backend 🔗

### Step 1: Update Backend CORS

1. Go back to **Railway dashboard**
2. Click on your backend service
3. Click **"Variables"** tab
4. Find `CORS_ORIGINS` variable
5. Update value with your actual Vercel URL:
   ```
   https://honeychain.vercel.app,https://*.vercel.app
   ```
6. Railway will automatically redeploy (~1 minute)

### Verify Connection

Visit your frontend and test:

1. **Beekeeper Registration**:
   - Go to `/register`
   - Create a new beekeeper account
   - Should succeed and log you in ✅

2. **Beekeeper Login**:
   - Go to `/login`
   - Sign in with your beekeeper credentials
   - Should work ✅

3. **Staff Login** (if seeded):
   - Go to `/login`
   - Sign in as `kvic_field_officer`, `lab_inspector`, or `kvic_admin`
   - Use the password you set in `OFFICER_PASSWORD`, `LAB_PASSWORD`, or `ADMIN_PASSWORD`
   - Should work ✅

✅ **Frontend and backend connected!**

---

## Part 4: Seed the Database 🌱

### Option A: Railway CLI (Recommended)

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link to your project:
   ```bash
   railway link
   ```

4. Run seed command:
   ```bash
   railway run python -m backend.seed
   ```

### Option B: Manual via Python

If Railway CLI doesn't work, you can create a temporary seed endpoint:

1. SSH into Railway container or use Railway shell
2. Run: `python -m backend.seed`

### Verify Seeding

Visit `/login` and try logging in with staff accounts:
- **KVIC Field Inspector**: username `kvic_field_officer` (password from `OFFICER_PASSWORD` env var)
- **Lab Inspector**: username `lab_inspector` (password from `LAB_PASSWORD` env var)
- **KVIC Admin**: username `kvic_admin` (password from `ADMIN_PASSWORD` env var)

**Note**: If a staff password environment variable was not set, that account was not created during seeding.

✅ **Database seeded successfully!**

---

## 🎉 Deployment Complete!

Your HoneyChain application is now live! Here are your URLs:

### Production URLs

**Frontend (Vercel)**:
- Homepage: `https://honeychain.vercel.app`
- Beekeeper Login: `https://honeychain.vercel.app/login`
- Beekeeper Registration: `https://honeychain.vercel.app/register`
- Verify Honey: `https://honeychain.vercel.app/verify`

**Backend (Railway)**:
- API: `https://your-backend.up.railway.app`
- API Docs: `https://your-backend.up.railway.app/docs`
- Health Check: `https://your-backend.up.railway.app/health`

### Demo Staff Accounts

After seeding with environment-supplied passwords, these staff accounts are available:

| Role | Username | Password |
|------|----------|----------|
| KVIC Field Inspector | `kvic_field_officer` | Value of `OFFICER_PASSWORD` env var |
| Lab Inspector | `lab_inspector` | Value of `LAB_PASSWORD` env var |
| KVIC Admin | `kvic_admin` | Value of `ADMIN_PASSWORD` env var |

**Important**: Staff accounts are only created if their corresponding password environment variables are set during initial seeding. Use `/login` to sign in with staff credentials.

---

## 🔄 Continuous Deployment

Both Railway and Vercel auto-deploy on git push:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

- ✅ Railway auto-deploys backend (~2 min)
- ✅ Vercel auto-deploys frontend (~1 min)

---

## 📊 Monitoring & Logs

### View Railway Logs
1. Railway dashboard → Your project
2. Click backend service
3. Click **"Deployments"** → **"View Logs"**

### View Vercel Logs
1. Vercel dashboard → Your project
2. Click **"Deployments"** → Select deployment
3. Click **"View Function Logs"**

### Set Up Uptime Monitoring
Consider adding [UptimeRobot](https://uptimerobot.com) (free):
- Monitor frontend URL
- Monitor backend `/health` endpoint
- Get email alerts if site goes down

---

## 🐛 Troubleshooting

### Backend Won't Start

**Symptoms**: Railway shows "Crashed" status

**Solutions**:
1. Check Railway logs for error messages
2. Verify all environment variables are set
3. Ensure `requirements.txt` has all dependencies
4. Check Python version in `runtime.txt` is 3.11+

### Frontend Can't Connect to Backend

**Symptoms**: "Failed to fetch" errors in browser console, or "Could not reach the HoneyChain API" errors

**Solutions**:
1. **Verify `VITE_API_URL` is set correctly in Vercel**:
   - Go to Vercel dashboard → Your project → Settings → Environment Variables
   - Check `VITE_API_URL` matches your Railway backend URL exactly
   - Format must be: `https://your-backend.up.railway.app` (no trailing slash, no `/api`)
2. **Rebuild frontend after changing `VITE_API_URL`**:
   - `VITE_API_URL` is a build-time variable
   - Vercel → Your project → Deployments → Click "..." → Redeploy
3. Check backend CORS includes your Vercel domain:
   - Railway → Backend service → Variables → `CORS_ORIGINS`
   - Should include: `https://your-frontend.vercel.app,https://*.vercel.app`
4. Ensure backend is running (check Railway status)
5. Test backend `/health` endpoint directly in browser

### Staff Demo Login Fails

**Symptoms**: "Could not sign in" or "Invalid credentials" error for staff accounts

**Solutions**:
1. Verify database is seeded: `railway run python -m backend.seed`
2. Check that staff password environment variables were set during seeding
3. Ensure you're using the correct password from the environment variable
4. Verify staff accounts exist in database (check Railway logs during seed)
5. Try using `/login` page with username and password directly

### Database Connection Errors

**Symptoms**: "Could not connect to database" errors

**Solutions**:
1. Verify PostgreSQL is running in Railway
2. Check `DATABASE_URL` is auto-added by Railway
3. Test database connection in Railway shell
4. Restart backend service

---

## 💰 Cost & Limits (Free Tier)

### Railway Free Tier
- **Execution Time**: 500 hours/month (~20 days)
- **Memory**: 512 MB per service
- **Database**: 1 GB PostgreSQL storage
- **Bandwidth**: Shared
- **Cost**: $0/month

### Vercel Free Tier
- **Bandwidth**: 100 GB/month
- **Build Time**: 100 hours/month
- **Deployments**: Unlimited
- **Team Members**: 1
- **Cost**: $0/month

**Good for**: Development, demos, small-scale production
**Upgrade when**: High traffic, need more resources

---

## 🎯 Production Checklist

Before launching to real users:

- [ ] Use strong random passwords for all staff accounts (min 12 chars, mix of letters/numbers/symbols)
- [ ] Use strong random `HONEYCHAIN_JWT_SECRET` (32+ chars)
- [ ] NEVER commit `.env` files or real passwords to version control
- [ ] Configure PostgreSQL backups (Railway → Settings)
- [ ] Set up custom domain (Vercel → Settings → Domains)
- [ ] Add uptime monitoring (UptimeRobot)
- [ ] Test all authentication flows
- [ ] Verify CORS settings are secure
- [ ] Test on mobile devices
- [ ] Review environment variables
- [ ] Set up error tracking (Sentry)
- [ ] Create admin documentation
- [ ] Test database backups/restore
- [ ] Document staff account creation process for production

---

## 📞 Get Help

- **Railway Support**: [railway.app/help](https://railway.app/help)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Vercel Discord**: [vercel.com/discord](https://vercel.com/discord)

---

## 📝 Quick Reference

### Railway Environment Variables
```bash
HONEYCHAIN_JWT_SECRET=<random-32+-char-string>
GEMINI_API_KEY=<your-key>
OFFICER_PASSWORD=<strong-unique-password>
LAB_PASSWORD=<strong-unique-password>
ADMIN_PASSWORD=<strong-unique-password>
CORS_ORIGINS=https://honeychain.vercel.app
DATABASE_URL=<auto-added-by-railway>
```

### Vercel Environment Variables
```bash
# Backend API URL - REQUIRED for production deployment
# Must be the HTTPS origin of your deployed backend
# Format: https://your-backend-domain (no trailing slash, no /api)
VITE_API_URL=https://your-backend.up.railway.app
```

### Useful Commands
```bash
# Railway CLI
railway login
railway link
railway run python -m backend.seed
railway logs

# Vercel CLI
vercel login
vercel --prod
vercel logs
```

---

**🎉 Congratulations! Your HoneyChain app is live!**

---

## 🎓 Next Steps After Deployment

### 1. Customize for Production

Run the helper script for production setup:
```powershell
.\deploy.ps1  # Interactive menu with various options
```

### 2. Set Up Monitoring

**Free Uptime Monitoring**:
- [UptimeRobot](https://uptimerobot.com) - Free tier monitors 50 URLs
- Monitor: Your Vercel URL + Railway `/health` endpoint
- Get email/SMS alerts if site goes down

### 3. Test Thoroughly

```powershell
# Test backend connection
.\deploy.ps1  # Choose option 9

# Check all features work:
# 1. Beekeeper registration at /register
# 2. Beekeeper login at /login
# 3. Staff login at /login (if seeded with env passwords)
# 4. Consumer verify at /verify
```

### 4. Document Your Deployment

Save these URLs in a safe place:
- **Frontend**: `https://your-vercel-domain.vercel.app`
- **Backend**: `https://your-railway-domain.up.railway.app`
- **Admin Password**: (store securely!)
- **JWT Secret**: (backup securely!)

### 5. Optional Enhancements

- **Custom Domain**: Vercel Settings → Domains → Add Custom Domain
- **SSL Certificate**: Auto-provided by Vercel (Let's Encrypt)
- **Database Backups**: Railway → Database → Settings → Backups
- **Error Tracking**: Add Sentry integration (optional)
- **Analytics**: Enable Vercel Analytics (optional, $10/month)

---

## 📚 Additional Resources

- **Quick Reference**: `DEPLOY_QUICK_REFERENCE.md` - One-page cheat sheet
- **Detailed Guide**: `DEPLOY_SMOOTH.md` - Step-by-step with explanations
- **Helper Scripts**: 
  - `deploy.ps1` - Interactive deployment helper
  - `pre-deploy-check.ps1` - Pre-deployment validation
- **Main Documentation**: `README.md` - Project overview
- **Security Guide**: `SECURITY_IMPROVEMENTS.md` - Security enhancements

---

## 🤝 Community & Support
