# HoneyChain Vercel Deployment Script
# Run this script to deploy to Vercel

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "HoneyChain Vercel Deployment" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if logged in
Write-Host "[1/4] Checking Vercel login status..." -ForegroundColor Yellow
$whoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Vercel" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run:" -ForegroundColor Yellow
    Write-Host "  vercel login" -ForegroundColor Green
    Write-Host ""
    Write-Host "Then run this script again!" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Logged in as: $whoami" -ForegroundColor Green
Write-Host ""

# Step 2: Build the project
Write-Host "[2/4] Building production bundle..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

# Step 3: Wake up the backend
Write-Host "[3/4] Waking up backend server..." -ForegroundColor Yellow
Write-Host "(This may take 30 seconds...)" -ForegroundColor Gray
$response = curl.exe -s https://honeychain-y8j6.onrender.com/health
if ($response) {
    Write-Host "✅ Backend is awake!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend might be sleeping, but continuing..." -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Deploy to Vercel
Write-Host "[4/4] Deploying to Vercel..." -ForegroundColor Yellow
Write-Host ""
vercel --prod

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo Accounts:" -ForegroundColor Yellow
Write-Host "  Admin:   demo_admin / DemoAdminPass123!@#" -ForegroundColor White
Write-Host "  Officer: demo_officer / DemoOfficerPass123!@#" -ForegroundColor White
Write-Host "  Lab:     demo_lab / DemoLabPass123!@#" -ForegroundColor White
Write-Host ""
Write-Host "Features to show your mentor:" -ForegroundColor Yellow
Write-Host "  ✓ AI Chatbot (bottom-right 'Ask HoneyChain')" -ForegroundColor White
Write-Host "  ✓ 7 Languages (top menu)" -ForegroundColor White
Write-Host "  ✓ Live hive monitoring" -ForegroundColor White
Write-Host "  ✓ QR verification" -ForegroundColor White
Write-Host "  ✓ Mobile responsive" -ForegroundColor White
Write-Host ""
