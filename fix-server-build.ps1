Write-Host "🔧 Fixing server build issues..." -ForegroundColor Green

# Set environment variables
$env:NODE_ENV = "production"
$env:NEXT_TELEMETRY_DISABLED = "1"

# Check if MongoDB URI is set
if (-not $env:MONGODB_URI) {
    Write-Host "❌ MONGODB_URI environment variable is not set" -ForegroundColor Red
    Write-Host "Please set it with: `$env:MONGODB_URI='your_mongodb_connection_string'" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Testing MongoDB connection..." -ForegroundColor Blue
node fix-mongodb-connection.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ MongoDB connection successful" -ForegroundColor Green
} else {
    Write-Host "❌ MongoDB connection failed" -ForegroundColor Red
    Write-Host "Please fix MongoDB connection before building" -ForegroundColor Yellow
    exit 1
}

Write-Host "🧹 Cleaning previous build..." -ForegroundColor Blue
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }
if (Test-Path "out") { Remove-Item -Recurse -Force "out" }

Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

Write-Host "🔧 Building application..." -ForegroundColor Blue
npm run build:prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
    Write-Host "🚀 You can now start the server with: npm start" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
