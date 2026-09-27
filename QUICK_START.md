# 🚀 HoneyChain Quick Start

Get HoneyChain running in 5 minutes!

## Prerequisites

- Python 3.11+ installed
- Node.js 20+ installed

## Step 1: Install Dependencies (2 min)

```bash
# Install Python packages
pip install -r requirements.txt

# Install Node packages
cd web
npm install
cd ..
```

## Step 2: Configure Environment (1 min)

```bash
# Create backend .env file
cp .env.example .env
```

Edit `.env` and set a secret key:
```env
HONEYCHAIN_JWT_SECRET=your-secret-key-here
```

Generate a secure secret:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Step 3: Start Backend (30 sec)

```bash
uvicorn backend.main:app --reload
```

✅ Backend running at: http://127.0.0.1:8000

## Step 4: Start Frontend (30 sec)

**New terminal window:**

```bash
cd web
npm run dev
```

✅ Frontend running at: http://localhost:5173

## Step 5: Test It (1 min)

**Visit:** http://localhost:5173

Or run automated tests:
```bash
python test_connections.py
```

---

## 🎯 You're Done!

The application should now be running with:
- ✅ Backend API on port 8000
- ✅ React frontend on port 5173
- ✅ Database initialized
- ✅ All connections working

---

## 🐛 Troubleshooting

### "Module not found" errors
```bash
pip install -r requirements.txt
```

### "Port already in use"
```bash
# Kill process on port 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### "Cannot connect to API"
1. Make sure backend is running (step 3)
2. Check `web/.env` exists with `VITE_API_URL=http://127.0.0.1:8000`
3. Restart frontend dev server

### Still having issues?
Run the diagnostic script:
```bash
python test_connections.py
```

Read the full guide: `SETUP_GUIDE.md`

---

## 📚 What's Next?

- Create a user account
- Explore the features
- Read `SETUP_GUIDE.md` for production deployment
- Check `VERCEL_DEPLOYMENT.md` for Vercel setup

---

**Need help?** Check the full documentation in `SETUP_GUIDE.md`
