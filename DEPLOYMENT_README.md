# 📦 HoneyChain Deployment Resources

## Overview

This directory contains everything you need to deploy HoneyChain to Railway (backend) + Vercel (frontend).

---

## 📚 Documentation Files

### 1. **DEPLOYMENT.md** 📖
**Comprehensive deployment guide**
- Complete step-by-step instructions
- Troubleshooting section
- Monitoring and maintenance tips
- **Use when**: First-time deployment or need detailed explanations

### 2. **DEPLOY_SMOOTH.md** ✨
**Beginner-friendly deployment guide**
- Extra explanations and context
- Screenshots and examples
- Common pitfalls highlighted
- Post-deployment testing checklist
- **Use when**: You want the smoothest, most detailed experience

### 3. **DEPLOY_QUICK_REFERENCE.md** ⚡
**One-page cheat sheet**
- Quick command reference
- Essential steps only
- Environment variables template
- Troubleshooting quick fixes
- **Use when**: You've deployed before and need a reminder

---

## 🛠️ Helper Scripts

### 1. **pre-deploy-check.ps1** ✅
**Pre-deployment validation**

Checks:
- Git repository status
- Required files (requirements.txt, Procfile, etc.)
- Backend structure
- Frontend structure
- Python/Node.js installation
- .gitignore configuration
- Sensitive files not committed

**Run before deploying**:
```powershell
.\pre-deploy-check.ps1
```

**Output**:
- ✅ Passed checks
- ⚠️ Warnings (optional improvements)
- ❌ Critical issues (must fix before deploying)

---

### 2. **deploy.ps1** 🚀
**Interactive deployment helper**

Features:
1. **Generate JWT Secret** - Creates secure random string
2. **Verify Environment Variables** - Checks configuration
3. **Check Railway CLI Status** - Verify CLI installed
4. **Check Vercel CLI Status** - Verify CLI installed
5. **Seed Database** - Run seed command via Railway CLI
6. **View Railway Logs** - Quick log access
7. **View Deployment URLs** - Show your deployed URLs
8. **Generate .env file** - Create production env file
9. **Test Backend Connection** - Verify backend is live

**Run interactive menu**:
```powershell
.\deploy.ps1
```

---

## 🎯 Deployment Workflow

### First-Time Deployment

```
1. Run pre-deployment check
   .\pre-deploy-check.ps1
   
2. Fix any critical issues
   
3. Push to GitHub
   git push origin main
   
4. Follow DEPLOY_SMOOTH.md or DEPLOYMENT.md
   - Deploy to Railway
   - Deploy to Vercel
   - Connect frontend & backend
   - Seed database
   
5. Test deployment
   .\deploy.ps1  # Option 9: Test Backend Connection
   Visit: https://your-vercel-url.vercel.app
```

### Subsequent Deployments

```
1. Make your code changes
   
2. Test locally
   
3. Push to GitHub
   git push origin main
   
4. Auto-deployment happens!
   ✅ Railway deploys backend (~2 min)
   ✅ Vercel deploys frontend (~1 min)
   
5. Verify changes live
```

---

## 🔑 Environment Variables

### Railway (Backend)

Required:
```env
HONEYCHAIN_JWT_SECRET=<40+ char random string>
OFFICER_PASSWORD=<strong password>
LAB_PASSWORD=<strong password>
ADMIN_PASSWORD=<strong password>
CORS_ORIGINS=https://your-vercel-url.vercel.app,https://*.vercel.app
```

Optional:
```env
GEMINI_API_KEY=<your-gemini-api-key>
HONEYCHAIN_ACCESS_MINUTES=15
HONEYCHAIN_REFRESH_DAYS=7
```

Auto-added by Railway:
```env
DATABASE_URL=<postgresql connection string>
PORT=<assigned port>
```

### Vercel (Frontend)

Required:
```env
VITE_API_URL=https://your-railway-url.up.railway.app
```

---

## 📊 Quick Commands

```powershell
# Generate JWT secret
.\deploy.ps1  # Choose option 1

# Pre-deployment check
.\pre-deploy-check.ps1

# Seed database (Railway CLI required)
railway run python -m backend.seed

# View logs
railway logs           # Backend logs
vercel logs           # Frontend logs

# CLI status
railway whoami
vercel whoami

# Test backend
.\deploy.ps1  # Choose option 9
```

---

## 🐛 Common Issues

### Issue: CORS Error

**Symptom**: Browser console shows CORS error

**Fix**:
```powershell
# Railway → backend → Variables → CORS_ORIGINS
https://your-actual-vercel-url.vercel.app,https://*.vercel.app
```

### Issue: Failed to Fetch

**Symptom**: Frontend can't connect to backend

**Fix**:
```powershell
# Vercel → Settings → Environment Variables → VITE_API_URL
https://your-actual-railway-url.up.railway.app

# Then redeploy frontend
```

### Issue: Login Fails

**Symptom**: "Could not sign in" on staff demo

**Fix**:
```powershell
# Re-seed database
railway run python -m backend.seed

# Or check passwords match in Railway Variables
```

**For more troubleshooting**: See DEPLOYMENT.md or DEPLOY_SMOOTH.md

---

## 💰 Cost Estimate

### Free Tier (Perfect for Development)

**Railway**:
- $5 free credit/month
- 500 execution hours
- 1 GB PostgreSQL storage
- **Cost**: $0/month (free tier)

**Vercel**:
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- **Cost**: $0/month (free tier)

**Total**: **FREE** for development and demos

### Production (Optional Upgrade)

**Railway Hobby** ($5/month):
- Better performance
- No sleep on inactivity
- More execution hours

**Vercel Pro** ($20/month):
- Advanced analytics
- Password protection
- More team members

**Total**: $25/month for production features

---

## ✅ Deployment Checklist

**Before Deploying**:
- [ ] Code pushed to GitHub
- [ ] Ran `pre-deploy-check.ps1` (all critical checks pass)
- [ ] Have Railway and Vercel accounts
- [ ] Have Gemini API key (optional)

**Railway Setup**:
- [ ] Project created from GitHub
- [ ] PostgreSQL database added
- [ ] All environment variables set
- [ ] Domain generated
- [ ] Health check returns 200 OK

**Vercel Setup**:
- [ ] Project imported from GitHub
- [ ] Root directory set to `web`
- [ ] VITE_API_URL environment variable set
- [ ] Deployment successful
- [ ] Homepage loads without errors

**Connection**:
- [ ] CORS updated in Railway with Vercel URL
- [ ] No CORS errors in browser console
- [ ] Backend and frontend communicate

**Database**:
- [ ] Database seeded successfully
- [ ] Staff login works at `/login` (if seeded)
- [ ] Test accounts functional

**Testing**:
- [ ] Public pages load (homepage, verify)
- [ ] Staff demo login works
- [ ] API docs accessible
- [ ] Tested on mobile device
- [ ] All default passwords changed

**Production Hardening** (Before Real Users):
- [ ] Strong passwords (not defaults)
- [ ] Unique JWT secret (40+ chars)
- [ ] Uptime monitoring set up
- [ ] Database backups configured
- [ ] Custom domain (optional)
- [ ] Error tracking (Sentry, optional)

---

## 📞 Getting Help

### Documentation
1. Read `DEPLOY_SMOOTH.md` for detailed guide
2. Check `DEPLOY_QUICK_REFERENCE.md` for quick fixes
3. Review `DEPLOYMENT.md` troubleshooting section

### Helper Scripts
```powershell
# Run deployment helper
.\deploy.ps1

# Run pre-deployment check
.\pre-deploy-check.ps1
```

### Community Support
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ Live backend API on Railway
- ✅ Live frontend app on Vercel
- ✅ PostgreSQL database on Railway
- ✅ Auto-deployment on git push
- ✅ HTTPS everywhere (automatic)
- ✅ Free hosting (within limits)

**Share your deployed app**:
- Frontend: `https://your-app.vercel.app`
- API Docs: `https://your-api.up.railway.app/docs`

---

## 📂 File Structure

```
HoneyChain/
├── DEPLOYMENT.md              # Main deployment guide
├── DEPLOY_SMOOTH.md           # Beginner-friendly guide
├── DEPLOY_QUICK_REFERENCE.md  # One-page cheat sheet
├── DEPLOYMENT_README.md       # This file
├── deploy.ps1                 # Interactive helper script
├── pre-deploy-check.ps1       # Pre-deployment validator
├── railway.json               # Railway configuration
├── Procfile                   # Railway start command
├── vercel.json                # Vercel backend config (legacy)
├── requirements.txt           # Python dependencies
├── runtime.txt                # Python version
├── .env.example               # Environment variables template
├── backend/                   # FastAPI backend
├── web/                       # React/Vite frontend
│   ├── vercel.json           # Vercel frontend config
│   └── vite.config.js        # Vite configuration
└── ...
```

---

**Ready to deploy? Start with `.\pre-deploy-check.ps1` then follow `DEPLOY_SMOOTH.md`!** 🚀
