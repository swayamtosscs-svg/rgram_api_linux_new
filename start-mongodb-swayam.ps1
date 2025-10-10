# Quick MongoDB Service Starter for Swayam Database
Write-Host "🚀 Starting MongoDB Service for Swayam Database..." -ForegroundColor Green
Write-Host ""

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "⚠️ Running without Administrator privileges" -ForegroundColor Yellow
    Write-Host "💡 Some operations may require elevated permissions" -ForegroundColor Cyan
}

# Check if MongoDB service exists
$service = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue

if ($service) {
    Write-Host "✅ MongoDB service found" -ForegroundColor Green
    
    if ($service.Status -eq "Running") {
        Write-Host "✅ MongoDB service is already running" -ForegroundColor Green
    } else {
        Write-Host "🔄 Starting MongoDB service..." -ForegroundColor Cyan
        try {
            Start-Service -Name "MongoDB"
            Write-Host "✅ MongoDB service started successfully" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to start MongoDB service: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "💡 Try running PowerShell as Administrator" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "❌ MongoDB service not found" -ForegroundColor Red
    Write-Host "💡 MongoDB may not be installed" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 To install MongoDB:" -ForegroundColor Cyan
    Write-Host "1. Download from: https://www.mongodb.com/try/download/community" -ForegroundColor White
    Write-Host "2. Run the installer" -ForegroundColor White
    Write-Host "3. Or run: mongodb-setup.bat" -ForegroundColor White
}

Write-Host ""
Write-Host "🔍 Testing database connection..." -ForegroundColor Cyan

# Test the connection
try {
    $testResult = node test-swayam-database.js 2>&1
    if ($testResult -match "Successfully connected") {
        Write-Host "✅ Database connection successful!" -ForegroundColor Green
        Write-Host "🎉 Your Swayam database is ready to use!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Database connection test completed" -ForegroundColor Yellow
        Write-Host "📝 Check the output above for any issues" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️ Could not run connection test" -ForegroundColor Yellow
    Write-Host "💡 Run manually: node test-swayam-database.js" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Test connection: node test-swayam-database.js" -ForegroundColor White
Write-Host "2. Start your API: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "💡 Database URI: mongodb://swayamUser:swayamPass@localhost:27017/swayam?authSource=admin" -ForegroundColor Yellow
