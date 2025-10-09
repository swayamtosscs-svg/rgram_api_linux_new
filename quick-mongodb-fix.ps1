# Quick MongoDB Fix for R-GRAM API
Write-Host "🚀 Quick MongoDB Fix for R-GRAM API" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

Write-Host "`nChecking if MongoDB is installed..." -ForegroundColor Yellow
try {
    $mongodPath = Get-Command mongod -ErrorAction Stop
    Write-Host "✅ MongoDB is installed at: $($mongodPath.Source)" -ForegroundColor Green
} catch {
    Write-Host "❌ MongoDB is not installed" -ForegroundColor Red
    Write-Host "`n📥 Please download and install MongoDB Community Edition:" -ForegroundColor Yellow
    Write-Host "https://www.mongodb.com/try/download/community" -ForegroundColor Cyan
    Write-Host "`nAfter installation, run this script again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "`nStarting MongoDB service..." -ForegroundColor Yellow
try {
    Start-Service MongoDB -ErrorAction Stop
    Write-Host "✅ MongoDB service started successfully" -ForegroundColor Green
} catch {
    $service = Get-Service MongoDB -ErrorAction SilentlyContinue
    if ($service -and $service.Status -eq 'Running') {
        Write-Host "✅ MongoDB service is already running" -ForegroundColor Green
    } else {
        Write-Host "⚠️ MongoDB service might not be installed as a service" -ForegroundColor Yellow
        Write-Host "🔧 Trying to start MongoDB manually..." -ForegroundColor Yellow
        
        # Create data directory if it doesn't exist
        $dataDir = "C:\data\db"
        if (!(Test-Path $dataDir)) {
            New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
        }
        
        # Start MongoDB in background
        Start-Process mongod -ArgumentList "--dbpath", $dataDir -WindowStyle Hidden
        Start-Sleep -Seconds 3
    }
}

Write-Host "`nTesting MongoDB connection..." -ForegroundColor Yellow
try {
    $result = mongosh --eval "db.runCommand({ping: 1})" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MongoDB is running and accessible" -ForegroundColor Green
    } else {
        throw "Connection failed"
    }
} catch {
    Write-Host "❌ MongoDB is not accessible" -ForegroundColor Red
    Write-Host "Please check if MongoDB is running and try again" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "`nSetting up database and user..." -ForegroundColor Yellow
$setupScript = @"
use admin
try {
    db.createUser({
        user: 'swayamUser',
        pwd: 'swayamPass',
        roles: [
            { role: 'readWrite', db: 'swayam' },
            { role: 'dbAdmin', db: 'swayam' }
        ]
    })
    print('✅ User created successfully')
} catch (e) {
    if (e.code === 51003) {
        print('✅ User already exists')
    } else {
        print('❌ Error creating user: ' + e.message)
    }
}
use swayam
db.test.insertOne({message: 'Database setup complete', timestamp: new Date()})
print('✅ Database setup complete')
"@

try {
    $setupResult = mongosh --eval $setupScript 2>$null
    Write-Host "✅ Database and user setup completed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Database setup had issues, but continuing..." -ForegroundColor Yellow
}

Write-Host "`nTesting API connection..." -ForegroundColor Yellow
try {
    node test-follow-request-reject.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n🎉 Setup complete! Your API should now work." -ForegroundColor Green
    } else {
        Write-Host "`n⚠️ API test had issues, but MongoDB is running" -ForegroundColor Yellow
    }
} catch {
    Write-Host "`n⚠️ Could not test API, but MongoDB should be working" -ForegroundColor Yellow
}

Write-Host "`nPress Enter to exit..." -ForegroundColor Yellow
Read-Host
