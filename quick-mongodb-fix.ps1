Write-Host "🚀 Quick MongoDB Fix for Swayam Database" -ForegroundColor Green
Write-Host ""

Write-Host "📋 MongoDB is not installed. Here are your options:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Download and Install MongoDB (Recommended)" -ForegroundColor Yellow
Write-Host "1. Go to: https://www.mongodb.com/try/download/community" -ForegroundColor White
Write-Host "2. Download MongoDB Community Server for Windows" -ForegroundColor White
Write-Host "3. Run the installer with default settings" -ForegroundColor White
Write-Host "4. Start MongoDB service" -ForegroundColor White
Write-Host ""
Write-Host "Option 2: Use MongoDB Atlas (Cloud)" -ForegroundColor Yellow
Write-Host "1. Go to: https://cloud.mongodb.com/" -ForegroundColor White
Write-Host "2. Create a free cluster" -ForegroundColor White
Write-Host "3. Get connection string" -ForegroundColor White
Write-Host "4. Update .env.local with Atlas URI" -ForegroundColor White
Write-Host ""
Write-Host "Option 3: Use Docker (If you have Docker)" -ForegroundColor Yellow
Write-Host "docker run -d -p 27017:27017 --name mongodb mongo:latest" -ForegroundColor White
Write-Host ""

# Check if Docker is available
try {
    $dockerVersion = & docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "✅ Docker is available!" -ForegroundColor Green
        Write-Host "💡 You can use: docker run -d -p 27017:27017 --name mongodb mongo:latest" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Docker not available" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔧 Quick Fix - Try Docker MongoDB:" -ForegroundColor Cyan
Write-Host "docker run -d -p 27017:27017 --name mongodb mongo:latest" -ForegroundColor White
Write-Host ""
Write-Host "Then test: node test-swayam-database.js" -ForegroundColor White