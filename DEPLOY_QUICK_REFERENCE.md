# 🚀 HoneyChain Deployment Quick Reference

**One-page cheat sheet for Railway + Vercel deployment**

---

## 📦 Pre-Deployment

```powershell
# 1. Run pre-deployment check
.\pre-deploy-check.ps1

# 2. Commit and push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 3. Get Gemini API key (optional)
# Visit: https://makersuite.google.com/app/apikey
```

---

## 🚂 Railway (Backend) - 5 Minutes

### 1. Create Project
- Visit [railway.app/new](https://railway.app/new)
- **Deploy from GitHub repo** → Select `HoneyChain`

### 2. Add Database
- Click **+ New** → **Database** → **PostgreSQL**

### 3. Add Environment Variables
Click backend service → **Variables** → Add each:

```env
HONEYCHAIN_JWT_SECRET=<run .\deploy.ps1 option 1 to generate>
GEMINI_API_KEY=<your-gemini-key-or-blank>
OFFICER_PASSWORD=<strong-unique-password-for-officer>
LAB_PASSWORD=<strong-unique-password-for-lab>
ADMIN_PASSWORD=<strong-unique-password-for-admin>
CORS_ORIGINS=https://*.vercel.app
```

### 4. Generate Domain
- **Settings** → **Networking** → **Generate Domain**
- 📝 **SAVE THIS URL**: `https://honeychain-production-xxxxx.up.railway.app`

### 5. Test
- Visit: `https://your-url.up.railway.app/health`
- Should return: `{"status":"ok"}`

---

## 🔺 Vercel (Frontend) - 5 Minutes

### 1. Import Project
- Visit [vercel.com/new](https://vercel.com/new)
- **Import** your `HoneyChain` repo

### 2. Configure Settings
- **Framework**: Vite
- **Root Directory**: `web` ⚠️ **IMPORTANT**
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 3. Add Environment Variable
**Before deploying**, add:

```env
VITE_API_URL=<your-railway-url-from-step-4-above>
```

Check: ✅ Production ✅ Preview ✅ Development

### 4. Deploy
- Click **Deploy**
- Wait 2 minutes
- 📝 **SAVE THIS URL**: `https://honeychain.vercel.app`

---

## 🔗 Connect (2 Minutes)

### Update CORS in Railway
1. Railway → backend service → **Variables**
2. Edit `CORS_ORIGINS`:
   ```
   https://honeychain.vercel.app,https://*.vercel.app
   ```
   (Replace with your actual Vercel domain)
3. Wait for auto-redeploy (~1 min)

---

## 🌱 Seed Database (2 Minutes)

### Option A: Railway CLI
```powershell
# Install (if not already)
npm install -g @railway/cli

# Login and link
railway login
railway link

# Seed
railway run python -m backend.seed
```

### Option B: Dashboard
1. Railway → backend → **Settings**
2. **Deploy** section → **Custom Start Command**
3. Add: `python -m backend.seed && uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Wait 1 min, then remove seed command and save

---

## ✅ Test Deployment

### Test URLs

```
# Health check
https://your-railway-url.up.railway.app/health

# API docs
https://your-railway-url.up.railway.app/docs

# Frontend
https://your-vercel-url.vercel.app

# Frontend
https://your-vercel-url.vercel.app

# Verify honey (public)
https://your-vercel-url.vercel.app/verify
```

### Test Logins

Visit `/login` and test staff accounts (if seeded with env passwords):

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | Your `ADMIN_PASSWORD` |
| Officer | `officer` | Your `OFFICER_PASSWORD` |
| Lab | `lab` | Your `LAB_PASSWORD` |

---

## 🐛 Common Fixes

### ❌ CORS Error
```env
# Railway → backend → Variables → CORS_ORIGINS
https://your-vercel-domain.vercel.app,https://*.vercel.app
```

### ❌ Failed to Fetch
```env
# Vercel → Settings → Environment Variables → VITE_API_URL
https://your-railway-url.up.railway.app
```
Then **Redeploy**

### ❌ Login Fails
```powershell
# Re-seed database
railway run python -m backend.seed
```

---

## 🔄 Update App (Push Changes)

```powershell
# Make changes, then:
git add .
git commit -m "Update feature"
git push origin main

# Auto-deploys:
# ✅ Railway backend (~2 min)
# ✅ Vercel frontend (~1 min)
```

---

## 📊 Monitor

### View Logs
```powershell
# Railway
railway logs

# Vercel
vercel logs
```

### Dashboards
- **Railway**: [railway.app/dashboard](https://railway.app/dashboard)
- **Vercel**: [vercel.com/dashboard](https://vercel.com/dashboard)

---

## 💰 Free Tier Limits

| Service | Free Tier |
|---------|-----------|
| **Railway** | $5 credit/month, 500 exec hours, 1GB DB |
| **Vercel** | 100 GB bandwidth, unlimited deploys |

---

## 🆘 Help Commands

```powershell
# Generate JWT secret
.\deploy.ps1  # Choose option 1

# Check environment
.\deploy.ps1  # Choose option 2

# Pre-flight check
.\pre-deploy-check.ps1

# Seed database
railway run python -m backend.seed

# View logs
railway logs
vercel logs

# CLI status
railway whoami
vercel whoami
```

---

## 📞 Get Help

- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Full Guide**: `DEPLOY_SMOOTH.md`
- **Main Docs**: `README.md`

---

## 🎯 Checklist

**Railway (Backend)**
- [ ] Project created from GitHub
- [ ] PostgreSQL added
- [ ] All 6 environment variables set
- [ ] Domain generated
- [ ] `/health` returns 200 OK
- [ ] CORS updated with Vercel URL

**Vercel (Frontend)**
- [ ] Project imported
- [ ] Root directory set to `web`
- [ ] `VITE_API_URL` environment variable set
- [ ] Deployed successfully
- [ ] Homepage loads
- [ ] No CORS errors in console

**Database**
- [ ] Seeded with demo data
- [ ] Staff login works at `/login` (if seeded)
- [ ] Beekeeper login works at `/login`

**Testing**
- [ ] Public verify works (PK-LIVE)
- [ ] Staff demo login works
- [ ] API docs accessible
- [ ] Mobile responsive
- [ ] All passwords changed from defaults

---

**✨ Quick Deploy Time: ~15 minutes**

**For detailed instructions**: See `DEPLOY_SMOOTH.md`
