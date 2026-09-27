# HoneyChain Pre-Deployment Checklist
# Run this before deploying to catch common issues

Write-Host ""
Write-Host "🔍 HoneyChain Pre-Deployment Checker" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$issues = @()
$warnings = @()
$passed = 0
$total = 0

# Check 1: Git repository
$total++
Write-Host "[$total] Checking Git repository..." -ForegroundColor White
if (Test-Path ".git") {
    Write-Host "    ✅ Git repository found" -ForegroundColor Green
    $passed++
    
    # Check if there are uncommitted changes
    $status = git status --porcelain
    if ($status) {
        $warnings += "You have uncommitted changes. Commit before deploying."
        Write-Host "    ⚠️  Uncommitted changes found" -ForegroundColor Yellow
    }
} else {
    $issues += "Not a Git repository. Initialize with: git init"
    Write-Host "    ❌ Not a Git repository" -ForegroundColor Red
}

# Check 2: Python requirements.txt
$total++
Write-Host "[$total] Checking requirements.txt..." -ForegroundColor White
if (Test-Path "requirements.txt") {
    Write-Host "    ✅ requirements.txt found" -ForegroundColor Green
    $passed++
    
    $content = Get-Content "requirements.txt"
    $required = @("fastapi", "uvicorn", "sqlalchemy", "pydantic", "psycopg2-binary")
    foreach ($pkg in $required) {
        if ($content -match $pkg) {
            # Package found
        } else {
            $warnings += "Missing package in requirements.txt: $pkg"
        }
    }
} else {
    $issues += "requirements.txt not found"
    Write-Host "    ❌ requirements.txt not found" -ForegroundColor Red
}

# Check 3: Procfile
$total++
Write-Host "[$total] Checking Procfile..." -ForegroundColor White
if (Test-Path "Procfile") {
    Write-Host "    ✅ Procfile found" -ForegroundColor Green
    $passed++
    
    $content = Get-Content "Procfile"
    if ($content -match "uvicorn backend.main:app") {
        Write-Host "    ✅ Procfile configured correctly" -ForegroundColor Green
    } else {
        $warnings += "Procfile may not be configured correctly"
        Write-Host "    ⚠️  Procfile content may be incorrect" -ForegroundColor Yellow
    }
} else {
    $issues += "Procfile not found (needed for Railway)"
    Write-Host "    ❌ Procfile not found" -ForegroundColor Red
}

# Check 4: railway.json
$total++
Write-Host "[$total] Checking railway.json..." -ForegroundColor White
if (Test-Path "railway.json") {
    Write-Host "    ✅ railway.json found" -ForegroundColor Green
    $passed++
} else {
    $warnings += "railway.json not found (optional but recommended)"
    Write-Host "    ⚠️  railway.json not found" -ForegroundColor Yellow
}

# Check 5: Web frontend
$total++
Write-Host "[$total] Checking web frontend..." -ForegroundColor White
if (Test-Path "web") {
    Write-Host "    ✅ web directory found" -ForegroundColor Green
    $passed++
    
    # Check package.json
    if (Test-Path "web\package.json") {
        Write-Host "    ✅ web/package.json found" -ForegroundColor Green
    } else {
        $issues += "web/package.json not found"
        Write-Host "    ❌ web/package.json not found" -ForegroundColor Red
    }
    
    # Check vite.config.js
    if (Test-Path "web\vite.config.js") {
        Write-Host "    ✅ web/vite.config.js found" -ForegroundColor Green
    } else {
        $warnings += "web/vite.config.js not found"
        Write-Host "    ⚠️  web/vite.config.js not found" -ForegroundColor Yellow
    }
} else {
    $issues += "web directory not found"
    Write-Host "    ❌ web directory not found" -ForegroundColor Red
}

# Check 6: Backend structure
$total++
Write-Host "[$total] Checking backend structure..." -ForegroundColor White
if (Test-Path "backend") {
    Write-Host "    ✅ backend directory found" -ForegroundColor Green
    $passed++
    
    # Check main.py
    if (Test-Path "backend\main.py") {
        Write-Host "    ✅ backend/main.py found" -ForegroundColor Green
    } else {
        $issues += "backend/main.py not found"
        Write-Host "    ❌ backend/main.py not found" -ForegroundColor Red
    }
    
    # Check models
    if (Test-Path "backend\models") {
        Write-Host "    ✅ backend/models directory found" -ForegroundColor Green
    } else {
        $warnings += "backend/models directory not found"
    }
    
    # Check routers
    if (Test-Path "backend\routers") {
        Write-Host "    ✅ backend/routers directory found" -ForegroundColor Green
    } else {
        $warnings += "backend/routers directory not found"
    }
} else {
    $issues += "backend directory not found"
    Write-Host "    ❌ backend directory not found" -ForegroundColor Red
}

# Check 7: .env.example
$total++
Write-Host "[$total] Checking .env.example..." -ForegroundColor White
if (Test-Path ".env.example") {
    Write-Host "    ✅ .env.example found" -ForegroundColor Green
    $passed++
} else {
    $warnings += ".env.example not found (recommended for documentation)"
    Write-Host "    ⚠️  .env.example not found" -ForegroundColor Yellow
}

# Check 8: .gitignore
$total++
Write-Host "[$total] Checking .gitignore..." -ForegroundColor White
if (Test-Path ".gitignore") {
    Write-Host "    ✅ .gitignore found" -ForegroundColor Green
    $passed++
    
    $content = Get-Content ".gitignore"
    $shouldIgnore = @(".env", "node_modules", "__pycache__", "*.pyc", "*.db")
    foreach ($pattern in $shouldIgnore) {
        if ($content -match [regex]::Escape($pattern)) {
            # Pattern found
        } else {
            $warnings += ".gitignore should include: $pattern"
        }
    }
} else {
    $issues += ".gitignore not found"
    Write-Host "    ❌ .gitignore not found" -ForegroundColor Red
}

# Check 9: Sensitive files not committed
$total++
Write-Host "[$total] Checking for sensitive files..." -ForegroundColor White
$sensitiveFiles = @(".env", "honeychain.db", "*.sqlite", "*.sqlite3")
$foundSensitive = $false
foreach ($pattern in $sensitiveFiles) {
    $files = git ls-files $pattern 2>$null
    if ($files) {
        $issues += "Sensitive file committed to Git: $files"
        Write-Host "    ❌ Found: $files" -ForegroundColor Red
        $foundSensitive = $true
    }
}
if (-not $foundSensitive) {
    Write-Host "    ✅ No sensitive files in Git" -ForegroundColor Green
    $passed++
}

# Check 10: Node.js installed (for CLIs)
$total++
Write-Host "[$total] Checking Node.js..." -ForegroundColor White
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "    ✅ Node.js installed: $nodeVersion" -ForegroundColor Green
        $passed++
    }
} catch {
    $warnings += "Node.js not found (needed for Railway/Vercel CLI)"
    Write-Host "    ⚠️  Node.js not installed" -ForegroundColor Yellow
}

# Check 11: Python installed
$total++
Write-Host "[$total] Checking Python..." -ForegroundColor White
try {
    $pythonVersion = python --version 2>$null
    if ($pythonVersion -match "3\.(1[1-9]|[2-9][0-9])") {
        Write-Host "    ✅ Python installed: $pythonVersion" -ForegroundColor Green
        $passed++
    } elseif ($pythonVersion) {
        $warnings += "Python version may be too old (need 3.11+): $pythonVersion"
        Write-Host "    ⚠️  Python version: $pythonVersion (need 3.11+)" -ForegroundColor Yellow
    }
} catch {
    $issues += "Python not found"
    Write-Host "    ❌ Python not installed" -ForegroundColor Red
}

# Check 12: README.md
$total++
Write-Host "[$total] Checking README.md..." -ForegroundColor White
if (Test-Path "README.md") {
    Write-Host "    ✅ README.md found" -ForegroundColor Green
    $passed++
} else {
    $warnings += "README.md not found (recommended)"
    Write-Host "    ⚠️  README.md not found" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "📊 Summary" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Passed: $passed/$total checks" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })
Write-Host ""

if ($issues.Count -gt 0) {
    Write-Host "❌ Issues Found ($($issues.Count)):" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "   • $issue" -ForegroundColor Red
    }
    Write-Host ""
}

if ($warnings.Count -gt 0) {
    Write-Host "⚠️  Warnings ($($warnings.Count)):" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "   • $warning" -ForegroundColor Yellow
    }
    Write-Host ""
}

if ($issues.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "🎉 All checks passed! You're ready to deploy!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Push to GitHub: git push origin main" -ForegroundColor White
    Write-Host "2. Deploy backend to Railway" -ForegroundColor White
    Write-Host "3. Deploy frontend to Vercel" -ForegroundColor White
    Write-Host "4. Follow DEPLOY_SMOOTH.md guide" -ForegroundColor White
} elseif ($issues.Count -eq 0) {
    Write-Host "⚠️  Some warnings found, but you can proceed with deployment" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Consider fixing warnings before deploying for production" -ForegroundColor Yellow
} else {
    Write-Host "❌ Critical issues found! Fix these before deploying" -ForegroundColor Red
}

Write-Host ""
Write-Host "For detailed deployment instructions, see:" -ForegroundColor Cyan
Write-Host "  DEPLOY_SMOOTH.md" -ForegroundColor White
Write-Host ""
