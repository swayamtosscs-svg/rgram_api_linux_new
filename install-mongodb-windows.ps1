# MongoDB Installation Script for Windows
# Run this script as Administrator

Write-Host "🚀 MongoDB Installation Script for R-GRAM API" -ForegroundColor Green
Write-Host ""

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script requires Administrator privileges" -ForegroundColor Red
    Write-Host "💡 Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green

# Check if MongoDB is already installed
try {
    $mongodVersion = & mongod --version 2>$null
    if ($mongodVersion) {
        Write-Host "✅ MongoDB is already installed" -ForegroundColor Green
        Write-Host "📋 Version: $($mongodVersion[0])" -ForegroundColor Cyan
        
        # Check if MongoDB service is running
        $service = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
        if ($service) {
            if ($service.Status -eq "Running") {
                Write-Host "✅ MongoDB service is running" -ForegroundColor Green
            } else {
                Write-Host "⚠️ MongoDB service is not running" -ForegroundColor Yellow
                Write-Host "🔄 Starting MongoDB service..." -ForegroundColor Cyan
                Start-Service -Name "MongoDB"
                Write-Host "✅ MongoDB service started" -ForegroundColor Green
            }
        }
        
        Write-Host ""
        Write-Host "🎉 MongoDB is ready to use!" -ForegroundColor Green
        Write-Host "💡 Test connection: node test-mongodb-connection.js" -ForegroundColor Cyan
        exit 0
    }
} catch {
    Write-Host "📝 MongoDB not found, proceeding with installation..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📥 Downloading MongoDB Community Server..." -ForegroundColor Cyan

# Download MongoDB Community Server
$downloadUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.8-signed.msi"
$installerPath = "$env:TEMP\mongodb-installer.msi"

try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath
    Write-Host "✅ Download completed" -ForegroundColor Green
} catch {
    Write-Host "❌ Download failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Please download manually from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🔧 Installing MongoDB..." -ForegroundColor Cyan

# Install MongoDB
try {
    $process = Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$installerPath`" /quiet /norestart" -Wait -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Host "✅ MongoDB installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Installation failed with exit code: $($process.ExitCode)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Installation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Clean up installer
Remove-Item $installerPath -Force

Write-Host ""
Write-Host "🔄 Starting MongoDB service..." -ForegroundColor Cyan

# Start MongoDB service
try {
    Start-Service -Name "MongoDB"
    Write-Host "✅ MongoDB service started" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Could not start MongoDB service automatically" -ForegroundColor Yellow
    Write-Host "💡 Please start it manually from Services (services.msc)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🎉 MongoDB installation completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Test connection: node test-mongodb-connection.js" -ForegroundColor White
Write-Host "2. Start your API: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "💡 MongoDB is now running on mongodb://localhost:27017" -ForegroundColor Yellow