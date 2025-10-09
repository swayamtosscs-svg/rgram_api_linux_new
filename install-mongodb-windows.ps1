# MongoDB Installation Script for Windows
Write-Host "🔧 Installing MongoDB on Windows..." -ForegroundColor Green

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ Please run PowerShell as Administrator to install MongoDB" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Download MongoDB Community Server
Write-Host "📥 Downloading MongoDB Community Server..." -ForegroundColor Yellow
$mongoUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.8-signed.msi"
$mongoInstaller = "$env:TEMP\mongodb-installer.msi"

try {
    Invoke-WebRequest -Uri $mongoUrl -OutFile $mongoInstaller
    Write-Host "✅ MongoDB installer downloaded successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to download MongoDB installer: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Install MongoDB
Write-Host "🚀 Installing MongoDB..." -ForegroundColor Yellow
try {
    Start-Process msiexec.exe -Wait -ArgumentList "/i $mongoInstaller /quiet /norestart"
    Write-Host "✅ MongoDB installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install MongoDB: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create MongoDB data directory
Write-Host "📁 Creating MongoDB data directory..." -ForegroundColor Yellow
$dataDir = "C:\data\db"
if (!(Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force
    Write-Host "✅ Data directory created: $dataDir" -ForegroundColor Green
}

# Create MongoDB log directory
$logDir = "C:\data\log"
if (!(Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force
    Write-Host "✅ Log directory created: $logDir" -ForegroundColor Green
}

# Add MongoDB to PATH
Write-Host "🔧 Adding MongoDB to PATH..." -ForegroundColor Yellow
$mongoPath = "C:\Program Files\MongoDB\Server\7.0\bin"
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
if ($currentPath -notlike "*$mongoPath*") {
    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$mongoPath", "Machine")
    Write-Host "✅ MongoDB added to PATH" -ForegroundColor Green
}

# Start MongoDB service
Write-Host "🚀 Starting MongoDB service..." -ForegroundColor Yellow
try {
    Start-Service MongoDB
    Write-Host "✅ MongoDB service started successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️  MongoDB service might already be running or needs manual start" -ForegroundColor Yellow
}

# Clean up installer
Remove-Item $mongoInstaller -Force

Write-Host "`n🎉 MongoDB installation completed!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your terminal/PowerShell" -ForegroundColor White
Write-Host "2. Run: mongod --version (to verify installation)" -ForegroundColor White
Write-Host "3. Start MongoDB: net start MongoDB" -ForegroundColor White
Write-Host "4. Test your login API again" -ForegroundColor White

Write-Host "`n🔧 Manual MongoDB start command:" -ForegroundColor Yellow
Write-Host "net start MongoDB" -ForegroundColor White
